/**
 * Task Repository - Specialized operations for tasks
 */

import { BaseRepository } from './BaseRepository.js';

export class TaskRepository extends BaseRepository {
  constructor(adapter, validator) {
    super(adapter, validator, 'tasks', 'task');
  }

  /**
   * Validate task dependencies (no cycles, no self-reference)
   */
  async validateDependencies(task) {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    // Check for self-dependency
    if (task.dependencies.includes(task.id)) {
      throw new Error('Task cannot depend on itself');
    }

    // Check all dependencies exist
    for (const depId of task.dependencies) {
      const dep = await this.getById(depId);
      if (!dep) {
        throw new Error(`Dependency not found: ${depId}`);
      }
    }

    // Check for circular dependencies (DFS)
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = async (taskId) => {
      visited.add(taskId);
      recursionStack.add(taskId);

      const currentTask = await this.getById(taskId);
      if (currentTask && currentTask.dependencies) {
        for (const depId of currentTask.dependencies) {
          if (!visited.has(depId)) {
            if (await hasCycle(depId)) {
              return true;
            }
          } else if (recursionStack.has(depId)) {
            return true; // Cycle detected
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    if (await hasCycle(task.id)) {
      throw new Error('Circular dependency detected');
    }

    return true;
  }

  /**
   * Override create to validate dependencies
   */
  async create(data) {
    const task = await super.create(data);
    await this.validateDependencies(task);
    return task;
  }

  /**
   * Override update to validate dependencies
   */
  async update(id, updates) {
    const updated = await super.update(id, updates);
    if (updates.dependencies) {
      await this.validateDependencies(updated);
    }
    return updated;
  }

  /**
   * Check if task can be completed (all deps completed)
   */
  async canComplete(taskId) {
    const task = await this.getById(taskId);
    if (!task) return false;

    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    for (const depId of task.dependencies) {
      const dep = await this.getById(depId);
      if (!dep || !dep.completed) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get tasks that depend on this task
   */
  async getDependentTasks(taskId) {
    const all = await this.getAll();
    return all.filter(task => 
      task.dependencies && task.dependencies.includes(taskId)
    );
  }

  /**
   * Get blocked tasks (dependencies not complete)
   */
  async getBlockedTasks() {
    const all = await this.getAll();
    const blocked = [];

    for (const task of all) {
      if (!task.completed && !(await this.canComplete(task.id))) {
        blocked.push(task);
      }
    }

    return blocked;
  }

  /**
   * Get tasks by project
   */
  async getByProject(projectId) {
    return await this.findBy('projectId', projectId);
  }

  /**
   * Get tasks by category
   */
  async getByCategory(category) {
    return await this.findBy('category', category);
  }

  /**
   * Get tasks by priority
   */
  async getByPriority(priority) {
    return await this.findBy('priority', priority);
  }

  /**
   * Get completed tasks
   */
  async getCompleted() {
    return await this.findBy('completed', true);
  }

  /**
   * Get active (not completed) tasks
   */
  async getActive() {
    return await this.findBy('completed', false);
  }

  /**
   * Get overdue tasks
   */
  async getOverdue() {
    const all = await this.getActive();
    const now = Date.now();
    
    return all.filter(task => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate).getTime();
      return due < now;
    });
  }

  /**
   * Get tasks due within range
   */
  async getTasksDueInRange(startDate, endDate) {
    const all = await this.getAll();
    
    return all.filter(task => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      return due >= startDate && due <= endDate;
    });
  }

  /**
   * Search tasks by text
   */
  async search(query) {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return all.filter(task =>
      task.text.toLowerCase().includes(lowerQuery) ||
      task.notes.toLowerCase().includes(lowerQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Toggle task completion
   */
  async toggleComplete(id) {
    const task = await this.getById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if can be completed
    if (!task.completed && !(await this.canComplete(id))) {
      throw new Error('Cannot complete task: dependencies not completed');
    }

    return await this.update(id, {
      completed: !task.completed,
      completedAt: !task.completed ? Date.now() : null
    });
  }

  /**
   * Get task statistics
   */
  async getStats() {
    const all = await this.getAll();
    const completed = all.filter(t => t.completed).length;
    const overdue = (await this.getOverdue()).length;
    const blocked = (await this.getBlockedTasks()).length;

    return {
      total: all.length,
      completed,
      pending: all.length - completed,
      overdue,
      blocked,
      completionRate: all.length > 0 ? (completed / all.length * 100).toFixed(1) : 0
    };
  }

  /**
   * Create tasks from template with dependency resolution
   */
  async createFromTemplate(templateTasks) {
    const indexToIdMap = new Map();
    const createdTasks = [];

    // First pass: Create tasks without dependencies
    for (let i = 0; i < templateTasks.length; i++) {
      const taskData = { ...templateTasks[i] };
      delete taskData.dependencies; // Remove for now

      const task = await this.create(taskData);
      indexToIdMap.set(i, task.id);
      createdTasks.push(task);
    }

    // Second pass: Add dependencies
    for (let i = 0; i < templateTasks.length; i++) {
      const templateTask = templateTasks[i];
      if (templateTask.dependencies && templateTask.dependencies.length > 0) {
        const dependencies = templateTask.dependencies
          .map(idx => indexToIdMap.get(idx))
          .filter(id => id !== undefined);

        if (dependencies.length > 0) {
          await this.update(createdTasks[i].id, { dependencies });
        }
      }
    }

    return createdTasks;
  }
}

