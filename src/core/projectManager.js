/**
 * Project Manager - Manages research projects and task organization
 * Uses observer pattern for reactive updates
 */

import { Project } from './data-models.js';
import { storage } from './storage.js';

class ProjectManager {
  constructor() {
    this.projects = [];
    this.subscribers = [];
    this.load();
  }

  /**
   * Observer pattern: subscribe to state changes
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of state changes
   */
  notify() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.projects);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  /**
   * Load projects from storage
   */
  load() {
    const data = storage.load('projects');
    if (data && Array.isArray(data)) {
      this.projects = data.map(p => Project.fromJSON(p));
      this.notify();
    }
  }

  /**
   * Save projects to storage
   */
  save() {
    const success = storage.save('projects', this.projects.map(p => p.toJSON()));
    if (success) {
      this.notify();
    }
    return success;
  }

  /**
   * Create a new project
   */
  create(projectData) {
    const project = new Project(projectData);
    this.projects.push(project);
    this.save();
    return project;
  }

  /**
   * Get all projects
   */
  getAll() {
    return [...this.projects];
  }

  /**
   * Get project by ID
   */
  getById(id) {
    return this.projects.find(p => p.id === id);
  }

  /**
   * Update project
   */
  update(id, updates) {
    const project = this.getById(id);
    if (!project) throw new Error('Project not found');

    Object.assign(project, updates);
    this.save();
    return project;
  }

  /**
   * Delete project (does not delete associated tasks)
   */
  delete(id) {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');

    const deleted = this.projects.splice(index, 1)[0];
    this.save();
    return deleted;
  }

  /**
   * Get statistics for a project
   */
  getProjectStats(projectId, taskStore) {
    const projectTasks = taskStore.getAll().filter(t => t.projectId === projectId);
    const completed = projectTasks.filter(t => t.completed).length;

    return {
      total: projectTasks.length,
      completed,
      pending: projectTasks.length - completed,
      completionRate: projectTasks.length > 0 
        ? (completed / projectTasks.length * 100).toFixed(1) 
        : 0
    };
  }

  /**
   * Clear all projects
   */
  clearAll() {
    this.projects = [];
    this.save();
  }
}

// Singleton instance
export const projectManager = new ProjectManager();
