export class Task {
  constructor({
    id = null,
    text = '',
    category = 'data',
    priority = 'normal',
    completed = false,
    dueDate = null,
    createdAt = Date.now(),
    updatedAt = Date.now(),
    tags = [],
    notes = '',
    dependencies = [],
    projectId = null
  } = {}) {
    this.id = id || this.generateId();
    this.text = text;
    this.category = category;
    this.priority = priority;
    this.completed = completed;
    this.dueDate = dueDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.tags = tags;
    this.notes = notes;
    this.dependencies = dependencies;
    this.projectId = projectId;
  }

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validate() {
    if (!this.text || this.text.trim().length === 0) {
      throw new Error('Task text is required');
    }
    if (this.text.length > 500) {
      throw new Error('Task text must be less than 500 characters');
    }
    return true;
  }

  toggleComplete() {
    this.completed = !this.completed;
    this.updatedAt = Date.now();
    return this;
  }

  updateText(newText) {
    this.text = newText;
    this.updatedAt = Date.now();
    return this;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(json) {
    return new Task(json);
  }
}

export class Project {
  constructor({
    id = null,
    name = '',
    description = '',
    color = '#3b82f6',
    createdAt = Date.now()
  } = {}) {
    this.id = id || this.generateId();
    this.name = name;
    this.description = description;
    this.color = color;
    this.createdAt = createdAt;
  }

  generateId() {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(json) {
    return new Project(json);
  }
}

