import { Task } from './data-models.js';
import { storage } from './storage.js';

class TaskStore {
  constructor() {
    this.tasks = [];
    this.subscribers = []; // Observer pattern: list of callbacks
    this.load();
  }

  // Observer pattern: subscribe to state changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      // Return unsubscribe function
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers of state changes
  notify() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.tasks);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  load() {
    const data = storage.load('tasks');
    if (data && Array.isArray(data)) {
      this.tasks = data.map(t => Task.fromJSON(t));
      this.notify(); // Notify after initial load
    }
  }

  save() {
    const success = storage.save('tasks', this.tasks.map(t => t.toJSON()));
    if (success) {
      this.notify(); // Notify observers after save
    }
    return success;
  }

  create(taskData) {
    const task = new Task(taskData);
    task.validate();
    this.validateDependencies(task); // Check for circular dependencies
    this.tasks.push(task);
    this.save();
    return task;
  }

  /**
   * Create multiple tasks from template with dependency resolution
   * Maps template task indices to actual task IDs
   */
  createFromTemplate(generatedTasks) {
    const createdTasks = [];
    const indexToIdMap = {}; // Maps original index to created task ID

    try {
      // First pass: Create all tasks with empty dependencies
      generatedTasks.forEach((taskData, index) => {
        const task = new Task({
          ...taskData,
          dependencies: [] // Start with no dependencies
        });
        task.validate();
        this.tasks.push(task);
        indexToIdMap[index] = task.id;
        createdTasks.push(task);
      });

      // Second pass: Resolve and update dependencies
      generatedTasks.forEach((taskData, index) => {
        const createdTask = createdTasks[index];
        if (taskData.dependencies && Array.isArray(taskData.dependencies)) {
          // Convert indices to actual task IDs
          createdTask.dependencies = taskData.dependencies
            .map(depIndex => indexToIdMap[depIndex])
            .filter(id => id !== undefined);
          
          // Validate final dependencies
          this.validateDependencies(createdTask);
        }
      });

      this.save();
      return createdTasks;
    } catch (error) {
      // Rollback: remove all created tasks if any validation fails
      createdTasks.forEach(task => {
        const idx = this.tasks.indexOf(task);
        if (idx !== -1) {
          this.tasks.splice(idx, 1);
        }
      });
      throw error;
    }
  }

  getAll() {
    return [...this.tasks];
  }

  getById(id) {
    return this.tasks.find(t => t.id === id);
  }

  update(id, updates) {
    const task = this.getById(id);
    if (!task) throw new Error('Task not found');
    
    Object.assign(task, updates);
    task.updatedAt = Date.now();
    task.validate();
    
    // If dependencies changed, validate them
    if (updates.dependencies) {
      this.validateDependencies(task);
    }
    
    this.save();
    return task;
  }

  delete(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
    // Remove this task from other tasks' dependencies
    this.tasks.forEach(task => {
      if (task.dependencies.includes(id)) {
        task.dependencies = task.dependencies.filter(depId => depId !== id);
      }
    });
    
    const deleted = this.tasks.splice(index, 1)[0];
    this.save();
    return deleted;
  }

  toggleComplete(id) {
    const task = this.getById(id);
    if (!task) throw new Error('Task not found');
    
    task.toggleComplete();
    this.save();
    return task;
  }

  /**
   * Check if a task can be completed (all dependencies are completed)
   */
  canComplete(taskId) {
    const task = this.getById(taskId);
    if (!task) return false;
    
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every(depId => {
      const depTask = this.getById(depId);
      return depTask && depTask.completed;
    });
  }

  /**
   * Get tasks that depend on a given task
   */
  getDependentTasks(taskId) {
    return this.tasks.filter(task => 
      task.dependencies && task.dependencies.includes(taskId)
    );
  }

  /**
   * Get all unblocked tasks (tasks with all dependencies completed or no dependencies)
   */
  getUnblockedTasks() {
    return this.tasks.filter(task => this.canComplete(task.id));
  }

  /**
   * Get all blocked tasks (tasks with incomplete dependencies)
   */
  getBlockedTasks() {
    return this.tasks.filter(task => !this.canComplete(task.id) && !task.completed);
  }

  /**
   * Validate dependencies for a task
   * Checks for circular dependencies and invalid task references
   */
  validateDependencies(task) {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    // Check for self-dependency
    if (task.dependencies.includes(task.id)) {
      throw new Error('Task cannot depend on itself');
    }

    // Check all dependencies exist
    task.dependencies.forEach(depId => {
      if (!this.getById(depId)) {
        throw new Error(`Dependency not found: ${depId}`);
      }
    });

    // Check for circular dependencies
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (taskId) => {
      visited.add(taskId);
      recursionStack.add(taskId);

      const currentTask = this.getById(taskId);
      if (currentTask && currentTask.dependencies) {
        for (const depId of currentTask.dependencies) {
          if (!visited.has(depId)) {
            if (hasCycle(depId)) {
              return true;
            }
          } else if (recursionStack.has(depId)) {
            return true; // Found a cycle
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    if (hasCycle(task.id)) {
      throw new Error('Circular dependency detected. Task dependencies form a cycle.');
    }

    return true;
  }

  // Filtering methods
  filterByCategory(category) {
    return this.tasks.filter(t => t.category === category);
  }

  filterByPriority(priority) {
    return this.tasks.filter(t => t.priority === priority);
  }

  filterByCompleted(completed = true) {
    return this.tasks.filter(t => t.completed === completed);
  }

  filterByDueDate(startDate, endDate) {
    return this.tasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due >= startDate && due <= endDate;
    });
  }

  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.tasks.filter(t => 
      t.text.toLowerCase().includes(lowerQuery) ||
      t.notes.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Sorting methods
  sortByDate(ascending = false) {
    return [...this.tasks].sort((a, b) => {
      return ascending 
        ? a.createdAt - b.createdAt 
        : b.createdAt - a.createdAt;
    });
  }

  sortByPriority() {
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
    return [...this.tasks].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  sortByDueDate() {
    return [...this.tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  // Statistics
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const overdue = this.tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length;
    const blocked = this.getBlockedTasks().length;

    return {
      total,
      completed,
      pending: total - completed,
      overdue,
      blocked,
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
    };
  }
}

export const taskStore = new TaskStore();

