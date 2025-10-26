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
    this.tasks.push(task);
    this.save();
    return task;
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
    this.save();
    return task;
  }

  delete(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
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

    return {
      total,
      completed,
      pending: total - completed,
      overdue,
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
    };
  }
}

export const taskStore = new TaskStore();

