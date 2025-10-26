/**
 * Template Engine - Generates tasks from academic workflow templates
 * Handles task creation, dependency linking, and relative date calculations
 */

export class Template {
  constructor({
    id = null,
    name = '',
    description = '',
    category = 'data',
    tasks = [], // Array of task templates
    estimatedDuration = null // Duration in days
  } = {}) {
    this.id = id || this.generateId();
    this.name = name;
    this.description = description;
    this.category = category;
    this.tasks = tasks; // Each task has: text, category, priority, daysFromStart, dependencies
    this.estimatedDuration = estimatedDuration;
    this.createdAt = Date.now();
  }

  generateId() {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate template structure
   */
  validate() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Template name is required');
    }
    if (!Array.isArray(this.tasks) || this.tasks.length === 0) {
      throw new Error('Template must contain at least one task');
    }
    
    // Validate each task
    this.tasks.forEach((taskTemplate, index) => {
      if (!taskTemplate.text || taskTemplate.text.trim().length === 0) {
        throw new Error(`Task ${index + 1}: text is required`);
      }
      if (typeof taskTemplate.daysFromStart !== 'number' || taskTemplate.daysFromStart < 0) {
        throw new Error(`Task ${index + 1}: daysFromStart must be a non-negative number`);
      }
    });

    return true;
  }

  /**
   * Generate actual tasks from this template
   * @param {Date|null} startDate - Base date for calculating due dates. If null, uses today
   * @param {Object} overrides - Optional overrides for category, priority, projectId
   * @returns {Array} Array of task objects ready for taskStore.create()
   */
  generateTasks(startDate = null, overrides = {}) {
    this.validate();

    const baseDate = startDate ? new Date(startDate) : new Date();
    const generatedTasks = [];
    const taskIdMap = {}; // Map template task indices to generated task IDs

    // First pass: Generate all tasks with their base data
    this.tasks.forEach((taskTemplate, index) => {
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + taskTemplate.daysFromStart);

      const generatedTask = {
        text: taskTemplate.text,
        category: overrides.category || taskTemplate.category || this.category,
        priority: taskTemplate.priority || 'normal',
        dueDate: dueDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        notes: taskTemplate.notes || '',
        tags: taskTemplate.tags || [this.name], // Tag with template name
        dependencies: [], // Will be populated in second pass
        projectId: overrides.projectId || null
      };

      generatedTasks.push(generatedTask);
      // Store index mapping for dependency resolution
      taskIdMap[index] = index;
    });

    // Second pass: Resolve dependencies (map template indices to actual generated tasks)
    this.tasks.forEach((taskTemplate, index) => {
      if (taskTemplate.dependencies && Array.isArray(taskTemplate.dependencies)) {
        generatedTasks[index].dependencies = taskTemplate.dependencies.map(depIndex => {
          // Dependencies will need to be resolved to actual task IDs after creation
          // For now, store as indices. TaskStore will handle ID resolution
          return depIndex;
        });
      }
    });

    return generatedTasks;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(json) {
    return new Template(json);
  }
}

/**
 * TemplateManager - Manages template storage and application
 */
export class TemplateManager {
  constructor() {
    this.templates = new Map(); // Map of template.id -> Template
    this.builtInTemplates = [];
  }

  /**
   * Register a built-in template
   */
  registerTemplate(template) {
    template.validate();
    this.templates.set(template.id, template);
    this.builtInTemplates.push(template.id);
  }

  /**
   * Get all available templates
   */
  getAll() {
    return Array.from(this.templates.values());
  }

  /**
   * Get built-in templates only
   */
  getBuiltIn() {
    return this.builtInTemplates
      .map(id => this.templates.get(id))
      .filter(t => t !== undefined);
  }

  /**
   * Get template by ID
   */
  getById(id) {
    return this.templates.get(id);
  }

  /**
   * Generate tasks from a template
   */
  generateFromTemplate(templateId, startDate = null, overrides = {}) {
    const template = this.getById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    return template.generateTasks(startDate, overrides);
  }
}

// Singleton instance
export const templateManager = new TemplateManager();
