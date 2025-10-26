# 🏗️ ResearchFlow - Master Task List & Implementation Guide

**Project**: ResearchFlow - AI-Powered Scientific Research Todo Manager  
**Version**: 1.0  
**Last Updated**: October 26, 2025

---

## 🎯 Project Vision

**ResearchFlow** is an intelligent todo app designed specifically for scientific researchers, PhD students, and academic teams. It's not just another todo app - it's a **smart research assistant** that understands the unique workflows of scientific discovery.

### What Makes This Special?
- **Research-Focused Categories**: Data Analysis 📊, Experiments 🧪, Writing 📝, Funding 💰, Presentations 🎤, Literature 📚
- **Academic Workflows**: Pre-built templates for paper submissions, grant proposals, experiment cycles
- **Dark Academia Aesthetic**: Professional, distraction-free interface designed for deep work
- **Intelligent Features**: Smart categorization, productivity insights, dependency tracking
- **Offline-First PWA**: Works anywhere - even in basement labs with poor signal

### Core Philosophy
1. **Scientists don't have "tasks"** - they have experiments, deadlines, reviews, and discoveries
2. **Mobile-first research** - capture ideas quickly during lab work
3. **Vanilla JavaScript** - fast, reliable, no build complexity
4. **Progressive enhancement** - start simple, add intelligence incrementally

---

## 🚀 Quick Start for Developers

### Development Environment
- **Platform**: OpenCode CLI with LM Studio backend (GPT-OSS-20B)
- **Package Manager**: `uv run` for Python operations
- **Server**: `uv run python -m http.server 8000`
- **Tools**: Read, Write, Edit, Bash, Grep

### Critical Success Pattern
```
ALWAYS: Read → Edit → Verify → Test
```

1. **Read file** to understand current state
2. **Edit/Write** to make changes  
3. **Read again** to verify changes applied
4. **Test** functionality to ensure no regressions

### Error Recovery Protocol
When ANY tool fails:
1. Stop immediately - don't continue with broken state
2. Analyze the error message carefully
3. Adjust your approach
4. Retry with the fix
5. Verify success

---

## 📖 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Core Foundation](#phase-1-core-foundation-weeks-1-2)
3. [Phase 2: Research Features](#phase-2-research-features-weeks-3-4)
4. [Phase 3: UI Polish & UX](#phase-3-ui-polish--ux-week-5)
5. [Phase 4: Advanced Features](#phase-4-advanced-features-week-6)
6. [Code Standards](#code-standards)
7. [Testing Requirements](#testing-requirements)

---

## 🎯 Architecture Overview

### Project Structure
```
ResearchFlow/
├── src/
│   ├── core/           # Business logic (task management, storage, observer)
│   │   ├── taskStore.js       # Central store with observer pattern
│   │   ├── taskModel.js       # Task class and validation
│   │   ├── storage.js         # Versioned localStorage (rf.tasks.v1)
│   │   └── filterSort.js      # Filtering and sorting utilities
│   ├── ui/
│   │   ├── app.js             # Bootstrap and wire store to components
│   │   └── components/        # All UI components (flattened structure)
│   │       ├── TaskForm.js
│   │       ├── TaskItem.js
│   │       ├── TaskList.js
│   │       ├── ListView.js
│   │       ├── KanbanView.js
│   │       ├── Filters.js
│   │       └── EmptyState.js
│   ├── features/       # Research-specific (templates, AI, dependencies)
│   │   ├── templates/
│   │   ├── ai/
│   │   └── voice-capture.js   # Voice-to-text task creation
│   ├── utils/          # Helpers and utilities
│   │   ├── dom.js             # DOM helpers with event delegation
│   │   └── dates.js
│   └── config/         # Configuration and constants
├── styles/             # CSS organization (variables, components, animations)
├── assets/             # Icons, images, fonts
├── public/             # PWA files (manifest, service worker)
├── tests/              # Unit, integration, e2e tests
└── index.html          # Main application
```

**Note**: Simplified from original 15 folders to 9 core folders. UI components are flattened (no separate views/ folder) for easier navigation.

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: LocalStorage + IndexedDB (Phase 4)
- **Styling**: CSS Grid/Flexbox, Custom Properties
- **PWA**: Service Worker, Web Manifest
- **Testing**: Native assertions + manual testing

### Development Principles
1. **Read → Edit → Verify**: Always read files before editing
2. **Test After Each Task**: Validate functionality immediately
3. **Observer Pattern**: Use subscribe/notify for reactive state updates
4. **Event Delegation**: Delegate events at container level, not individual elements
5. **Versioned Storage**: Schema-versioned keys (rf.tasks.v1) for safe migrations
6. **Mobile-First**: Design for mobile, enhance for desktop
7. **Accessibility**: WCAG 2.1 AA compliance
8. **Performance**: <3 second load time, smooth 60fps animations

---

## 🚀 PHASE 1: Core Foundation (Weeks 1-2)

**Goal**: Build a fully functional todo app with research-specific categories and priorities.

### 1.1 Project Setup & File Structure

#### Task 1.1.1: Initialize Project Structure
- [ ] Create all folders: `src/`, `styles/`, `assets/`, `public/`, `tests/`
- [ ] Create subfolders: `src/core/`, `src/ui/`, `src/features/`, `src/utils/`, `src/config/`
- [ ] Create style subfolders as per architecture

**Acceptance Criteria**:
- All folders exist and are properly organized
- Structure matches architecture diagram

**Coder Notes**:
```bash
# Simplified structure - no separate views/ folder
mkdir -p src/{core,ui/components,features/{templates,ai},utils,config}
mkdir -p styles assets/{icons/{categories,ui},images,fonts} public tests/{unit,integration,e2e}
```

---

#### Task 1.1.2: Create Base HTML Structure
**File**: `index.html`

- [ ] Set up HTML5 boilerplate with proper doctype
- [ ] Add viewport meta tag for responsive design
- [ ] Include semantic structure: `<header>`, `<main>`, `<footer>`
- [ ] Add placeholder for theme toggle
- [ ] Link CSS files in correct order
- [ ] Add script tags with `type="module"` for JS files

**Acceptance Criteria**:
- Valid HTML5 structure
- Passes W3C validator
- Includes ARIA landmarks
- Mobile viewport configured

**Code Template**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AI-powered research task manager for scientists">
  <title>ResearchFlow - Smart Research Todo Manager</title>
  
  <!-- Styles -->
  <link rel="stylesheet" href="styles/reset.css">
  <link rel="stylesheet" href="styles/variables.css">
  <link rel="stylesheet" href="styles/typography.css">
  <link rel="stylesheet" href="styles/layout.css">
  <link rel="stylesheet" href="styles/components.css">
  <link rel="stylesheet" href="styles/animations.css">
  <link rel="stylesheet" href="styles/responsive.css">
  <link rel="stylesheet" href="styles/main.css">
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="public/manifest.json">
</head>
<body>
  <header class="app-header">
    <h1>🔬 ResearchFlow</h1>
    <p class="tagline">Smart Task Management for Researchers</p>
  </header>
  
  <main class="app-main">
    <!-- Task form will go here -->
    <!-- Task list will go here -->
  </main>
  
  <footer class="app-footer">
    <!-- Stats and info -->
  </footer>
  
  <!-- Scripts -->
  <script type="module" src="src/app.js"></script>
</body>
</html>
```

---

### 1.2 Configuration & Data Models

#### Task 1.2.1: Define Categories Configuration
**File**: `src/config/categories.js`

- [ ] Export categories array with id, name, icon, color properties
- [ ] Include all 6 research categories from PLAN.md
- [ ] Add description field for each category

**Acceptance Criteria**:
- Valid ES6 module export
- All 6 categories defined
- Consistent data structure

**Code Template**:
```javascript
export const CATEGORIES = [
  {
    id: 'data',
    name: 'Data Analysis',
    icon: '📊',
    color: '#3b82f6',
    description: 'Statistical analysis, data processing, visualizations'
  },
  {
    id: 'experiment',
    name: 'Experiments',
    icon: '🧪',
    color: '#8b5cf6',
    description: 'Lab work, measurements, protocols'
  },
  {
    id: 'writing',
    name: 'Writing',
    icon: '📝',
    color: '#f4a261',
    description: 'Papers, reports, documentation'
  },
  {
    id: 'funding',
    name: 'Funding',
    icon: '💰',
    color: '#10b981',
    description: 'Grants, proposals, budgets'
  },
  {
    id: 'presentation',
    name: 'Presentations',
    icon: '🎤',
    color: '#ef4444',
    description: 'Talks, posters, lab meetings'
  },
  {
    id: 'literature',
    name: 'Literature',
    icon: '📚',
    color: '#6366f1',
    description: 'Reading papers, reviews, citations'
  }
];

export const getCategoryById = (id) => {
  return CATEGORIES.find(cat => cat.id === id);
};
```

---

#### Task 1.2.2: Define Priorities Configuration
**File**: `src/config/priorities.js`

- [ ] Export priorities array with level, name, icon, color
- [ ] Include 4 priority levels: critical, high, normal, low
- [ ] Add urgency scores for sorting

**Code Template**:
```javascript
export const PRIORITIES = [
  {
    level: 'critical',
    name: 'Critical',
    icon: '🔥',
    color: '#ef4444',
    urgency: 4,
    description: 'Immediate attention required'
  },
  {
    level: 'high',
    name: 'High',
    icon: '⚡',
    color: '#f59e0b',
    urgency: 3,
    description: 'Important, schedule soon'
  },
  {
    level: 'normal',
    name: 'Normal',
    icon: '📌',
    color: '#3b82f6',
    urgency: 2,
    description: 'Standard priority'
  },
  {
    level: 'low',
    name: 'Low',
    icon: '💤',
    color: '#94a3b8',
    urgency: 1,
    description: 'When time permits'
  }
];

export const getPriorityByLevel = (level) => {
  return PRIORITIES.find(p => p.level === level);
};
```

---

#### Task 1.2.3: Create Data Models
**File**: `src/core/data-models.js`

- [ ] Define Task class with constructor and methods
- [ ] Define Project class (for Phase 2)
- [ ] Add validation methods
- [ ] Include toJSON/fromJSON serialization

**Acceptance Criteria**:
- Task model includes all required fields
- Validation prevents invalid data
- Timestamps are properly handled

**Code Template**:
```javascript
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
```

---

### 1.3 Storage Layer

#### Task 1.3.1: Implement LocalStorage Manager
**File**: `src/core/storage.js`

- [ ] Create StorageManager class
- [ ] Implement save(), load(), remove() methods
- [ ] Add error handling for quota exceeded
- [ ] Include data migration support

**Acceptance Criteria**:
- Data persists across page refreshes
- Handles localStorage errors gracefully
- Supports bulk operations

**Code Template**:
```javascript
// Versioned storage keys for safe data migration
const STORAGE_KEYS = {
  tasks: 'rf.tasks.v1',
  settings: 'rf.settings.v1',
  projects: 'rf.projects.v1'
};

class StorageManager {
  constructor() {
    this.keys = STORAGE_KEYS;
    this.version = 1;
  }

  // Save data to a specific versioned key
  save(key, data) {
    try {
      const storageKey = this.keys[key];
      if (!storageKey) {
        throw new Error(`Unknown storage key: ${key}`);
      }

      const payload = {
        version: this.version,
        timestamp: Date.now(),
        data: data
      };
      
      localStorage.setItem(storageKey, JSON.stringify(payload));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        this.handleQuotaExceeded();
      }
      console.error('Storage save failed:', error);
      return false;
    }
  }

  // Load data from a specific versioned key
  load(key) {
    try {
      const storageKey = this.keys[key];
      if (!storageKey) {
        throw new Error(`Unknown storage key: ${key}`);
      }

      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      
      const payload = JSON.parse(raw);
      
      // Version migration logic
      if (payload.version !== this.version) {
        return this.migrate(key, payload);
      }
      
      return payload.data;
    } catch (error) {
      console.error('Storage load failed:', error);
      return null;
    }
  }

  // Remove data from a specific key
  remove(key) {
    try {
      const storageKey = this.keys[key];
      if (!storageKey) {
        throw new Error(`Unknown storage key: ${key}`);
      }
      
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Storage remove failed:', error);
      return false;
    }
  }

  // Clear all ResearchFlow data
  clearAll() {
    try {
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Storage clear failed:', error);
      return false;
    }
  }

  // Handle data migration between versions
  migrate(key, oldPayload) {
    console.log(`Migrating ${key} from version ${oldPayload.version} to ${this.version}`);
    
    // Add migration logic here as versions change
    // Example: if (oldPayload.version === 0) { /* transform data */ }
    
    return oldPayload.data;
  }

  // Handle storage quota exceeded
  handleQuotaExceeded() {
    // Could implement cleanup strategies here
    // For now, just alert the user
    console.warn('Storage is full. Consider exporting and clearing old data.');
  }

  // Get storage size for a specific key
  getStorageSize(key) {
    const storageKey = this.keys[key];
    if (!storageKey) return 0;
    
    const data = localStorage.getItem(storageKey);
    return data ? new Blob([data]).size : 0;
  }

  // Get total storage size
  getTotalSize() {
    return Object.keys(this.keys).reduce((total, key) => {
      return total + this.getStorageSize(key);
    }, 0);
  }

  // Get storage statistics
  getStats() {
    const totalSize = this.getTotalSize();
    const maxSize = 5 * 1024 * 1024; // ~5MB typical localStorage limit
    
    return {
      totalSize,
      maxSize,
      percentUsed: ((totalSize / maxSize) * 100).toFixed(2),
      keys: Object.keys(this.keys).map(key => ({
        name: key,
        size: this.getStorageSize(key)
      }))
    };
  }
}

export const storage = new StorageManager();
export { STORAGE_KEYS };
```

---

### 1.4 Task Management Logic

#### Task 1.4.1: Implement Task Store with Observer Pattern
**File**: `src/core/taskStore.js` (renamed from task-manager.js)

- [ ] Create TaskStore class with observer pattern
- [ ] Implement subscribe/notify for reactive updates
- [ ] Implement CRUD operations: create, read, update, delete
- [ ] Add filtering methods (by category, priority, completion)
- [ ] Add sorting methods (by date, priority, category)
- [ ] Include search functionality

**Acceptance Criteria**:
- All CRUD operations work correctly
- Observers are notified on state changes
- Tasks are properly validated before saving
- Filtering and sorting return correct results
- Changes are persisted to storage

**Code Template**:
```javascript
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
```

---

### 1.4.2 Create DOM Utilities with Event Delegation
**File**: `src/utils/dom.js`

- [ ] Create DOM helper functions
- [ ] Implement event delegation pattern
- [ ] Add element creation helpers
- [ ] Include query selectors utilities

**Acceptance Criteria**:
- Event delegation works for dynamic elements
- Helper functions reduce code repetition
- Performance is better than individual listeners

**Code Template**:
```javascript
// DOM utility functions with event delegation pattern

// Create element with properties
export function createElement(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  
  // Set properties
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      // Event listener
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else {
      el[key] = value;
    }
  });
  
  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  
  return el;
}

// Event delegation: attach one listener to parent, handle events for children
export function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (event) => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, event, target);
    }
  });
}

// Query selector shortcuts
export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Mount component to container
export function mount(container, element) {
  if (typeof container === 'string') {
    container = $(container);
  }
  
  if (!container) {
    throw new Error('Container not found');
  }
  
  container.innerHTML = '';
  
  if (typeof element === 'string') {
    container.innerHTML = element;
  } else if (element instanceof Node) {
    container.appendChild(element);
  }
  
  return container;
}

// Example usage of event delegation:
// const taskList = $('#task-list');
// delegate(taskList, 'click', '.btn-delete', (event, target) => {
//   const taskId = target.closest('.task-card').dataset.taskId;
//   handleDelete(taskId);
// });
```

---

### 1.5 UI Components

#### Task 1.5.1: Create Task Form Component
**File**: `src/ui/components/task-form.js`

- [ ] Create TaskForm class
- [ ] Build form HTML with all inputs
- [ ] Add event listeners for form submission
- [ ] Implement validation and error display
- [ ] Add clear/reset functionality

**Acceptance Criteria**:
- Form validates inputs before submission
- Shows clear error messages
- Resets after successful submission
- Accessible with keyboard navigation

**Code Template**:
```javascript
import { CATEGORIES } from '../../config/categories.js';
import { PRIORITIES } from '../../config/priorities.js';

export class TaskForm {
  constructor(container, onSubmit) {
    this.container = container;
    this.onSubmit = onSubmit;
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <form class="task-form" id="taskForm">
        <div class="form-group">
          <label for="taskText">What research task needs doing?</label>
          <input 
            type="text" 
            id="taskText" 
            name="text"
            placeholder="e.g., Analyze RNA-seq results"
            maxlength="500"
            required
            aria-required="true"
          >
          <span class="error-message" id="textError"></span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="taskCategory">Category</label>
            <select id="taskCategory" name="category" required>
              ${CATEGORIES.map(cat => `
                <option value="${cat.id}">
                  ${cat.icon} ${cat.name}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="taskPriority">Priority</label>
            <select id="taskPriority" name="priority" required>
              ${PRIORITIES.map(pri => `
                <option value="${pri.level}">
                  ${pri.icon} ${pri.name}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="taskDueDate">Due Date</label>
            <input 
              type="date" 
              id="taskDueDate" 
              name="dueDate"
            >
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            ➕ Add Task
          </button>
          <button type="reset" class="btn btn-secondary">
            Clear
          </button>
        </div>
      </form>
    `;
  }

  attachEventListeners() {
    const form = this.container.querySelector('#taskForm');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate()) {
        const formData = new FormData(form);
        const taskData = {
          text: formData.get('text'),
          category: formData.get('category'),
          priority: formData.get('priority'),
          dueDate: formData.get('dueDate') || null
        };
        
        this.onSubmit(taskData);
        form.reset();
      }
    });
  }

  validate() {
    const textInput = document.getElementById('taskText');
    const errorSpan = document.getElementById('textError');
    
    if (!textInput.value.trim()) {
      errorSpan.textContent = 'Task description is required';
      textInput.focus();
      return false;
    }
    
    if (textInput.value.length > 500) {
      errorSpan.textContent = 'Task description must be less than 500 characters';
      textInput.focus();
      return false;
    }
    
    errorSpan.textContent = '';
    return true;
  }
}
```

---

#### Task 1.5.2: Create Task Card Component
**File**: `src/ui/components/task-card.js`

- [ ] Create TaskCard class
- [ ] Build task display with all properties
- [ ] Add action buttons (complete, edit, delete)
- [ ] Implement visual states (completed, overdue)
- [ ] Add animations for state changes

**Code Template**:
```javascript
import { getCategoryById } from '../../config/categories.js';
import { getPriorityByLevel } from '../../config/priorities.js';

export class TaskCard {
  constructor(task, callbacks) {
    this.task = task;
    this.callbacks = callbacks; // { onToggle, onEdit, onDelete }
  }

  render() {
    const category = getCategoryById(this.task.category);
    const priority = getPriorityByLevel(this.task.priority);
    const isOverdue = this.task.dueDate && 
      new Date(this.task.dueDate) < new Date() && 
      !this.task.completed;

    const card = document.createElement('div');
    card.className = `task-card ${this.task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
    card.dataset.taskId = this.task.id;

    card.innerHTML = `
      <div class="task-card__checkbox">
        <input 
          type="checkbox" 
          id="task-${this.task.id}"
          ${this.task.completed ? 'checked' : ''}
          aria-label="Mark task as ${this.task.completed ? 'incomplete' : 'complete'}"
        >
        <label for="task-${this.task.id}"></label>
      </div>

      <div class="task-card__content">
        <div class="task-card__header">
          <span class="task-category" title="${category.description}">
            ${category.icon} ${category.name}
          </span>
          <span class="task-priority priority-${priority.level}">
            ${priority.icon}
          </span>
        </div>

        <p class="task-card__text">${this.escapeHtml(this.task.text)}</p>

        ${this.task.dueDate ? `
          <div class="task-card__due-date ${isOverdue ? 'overdue' : ''}">
            📅 Due: ${this.formatDate(this.task.dueDate)}
            ${isOverdue ? ' <span class="overdue-badge">OVERDUE</span>' : ''}
          </div>
        ` : ''}

        ${this.task.notes ? `
          <p class="task-card__notes">${this.escapeHtml(this.task.notes)}</p>
        ` : ''}
      </div>

      <div class="task-card__actions">
        <button class="btn-icon btn-edit" title="Edit task" aria-label="Edit task">
          ✏️
        </button>
        <button class="btn-icon btn-delete" title="Delete task" aria-label="Delete task">
          🗑️
        </button>
      </div>
    `;

    this.attachEventListeners(card);
    return card;
  }

  attachEventListeners(card) {
    const checkbox = card.querySelector('input[type="checkbox"]');
    const editBtn = card.querySelector('.btn-edit');
    const deleteBtn = card.querySelector('.btn-delete');

    checkbox.addEventListener('change', () => {
      this.callbacks.onToggle(this.task.id);
    });

    editBtn.addEventListener('click', () => {
      this.callbacks.onEdit(this.task.id);
    });

    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this task?')) {
        this.callbacks.onDelete(this.task.id);
      }
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
```

---

#### Task 1.5.3: Create Task List View
**File**: `src/ui/components/ListView.js`

- [ ] Create ListView class
- [ ] Use event delegation for better performance
- [ ] Render collection of task cards
- [ ] Implement empty state message
- [ ] Add filtering controls
- [ ] Include sorting options

**Code Template**:
```javascript
import { TaskCard } from './TaskCard.js';
import { delegate } from '../../utils/dom.js';

export class ListView {
  constructor(container, taskStore) {
    this.container = container;
    this.taskStore = taskStore;
    this.currentFilter = 'all';
    this.currentSort = 'date';
    
    // Subscribe to store changes for reactive updates
    this.unsubscribe = taskStore.subscribe(() => {
      this.render();
    });
  }
  
  destroy() {
    // Clean up subscription
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const tasks = this.getFilteredTasks();
    
    this.container.innerHTML = `
      <div class="list-view">
        <div class="list-controls">
          <div class="filter-buttons">
            <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
              All
            </button>
            <button class="filter-btn ${this.currentFilter === 'active' ? 'active' : ''}" data-filter="active">
              Active
            </button>
            <button class="filter-btn ${this.currentFilter === 'completed' ? 'active' : ''}" data-filter="completed">
              Completed
            </button>
          </div>

          <div class="sort-options">
            <label for="sortSelect">Sort by:</label>
            <select id="sortSelect">
              <option value="date">Date Created</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        <div class="task-list" id="taskList">
          ${tasks.length > 0 ? '' : this.renderEmptyState()}
        </div>

        <div class="list-stats">
          ${this.renderStats()}
        </div>
      </div>
    `;

    if (tasks.length > 0) {
      this.renderTasks(tasks);
    }

    this.attachEventListeners();
  }

  renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
      const taskCard = new TaskCard(task, this.callbacks);
      taskList.appendChild(taskCard.render());
    });
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">🔬</div>
        <h3>No research tasks yet</h3>
        <p>Add your first task to start organizing your research workflow</p>
      </div>
    `;
  }

  renderStats() {
    const stats = this.taskStore.getStats();
    return `
      <div class="stats">
        <span>Total: <strong>${stats.total}</strong></span>
        <span>Completed: <strong>${stats.completed}</strong></span>
        <span>Pending: <strong>${stats.pending}</strong></span>
        ${stats.overdue > 0 ? `<span class="overdue">Overdue: <strong>${stats.overdue}</strong></span>` : ''}
      </div>
    `;
  }

  getFilteredTasks() {
    let tasks = [];

    switch (this.currentFilter) {
      case 'all':
        tasks = this.taskStore.getAll();
        break;
      case 'active':
        tasks = this.taskStore.filterByCompleted(false);
        break;
      case 'completed':
        tasks = this.taskStore.filterByCompleted(true);
        break;
    }

    return this.sortTasks(tasks);
  }

  sortTasks(tasks) {
    switch (this.currentSort) {
      case 'priority':
        return this.taskStore.sortByPriority();
      case 'dueDate':
        return this.taskStore.sortByDueDate();
      case 'date':
      default:
        return this.taskStore.sortByDate();
    }
  }

  attachEventListeners() {
    // Event delegation: single listener for all filter buttons
    delegate(this.container, 'click', '.filter-btn', (event, target) => {
      this.currentFilter = target.dataset.filter;
      this.render();
    });

    // Event delegation: task list interactions
    const taskList = this.container.querySelector('.task-list');
    
    // Toggle complete
    delegate(taskList, 'change', 'input[type="checkbox"]', (event, target) => {
      const taskId = target.closest('.task-card').dataset.taskId;
      this.taskStore.toggleComplete(taskId);
    });

    // Delete task
    delegate(taskList, 'click', '.btn-delete', (event, target) => {
      const taskId = target.closest('.task-card').dataset.taskId;
      if (confirm('Are you sure you want to delete this task?')) {
        this.taskStore.delete(taskId);
      }
    });

    // Edit task
    delegate(taskList, 'click', '.btn-edit', (event, target) => {
      const taskId = target.closest('.task-card').dataset.taskId;
      // TODO: Implement edit modal in Phase 2
      console.log('Edit task:', taskId);
    });

    // Sort select (single element, regular listener is fine)
    const sortSelect = this.container.querySelector('#sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.render();
      });
    }
  }
}
```

---

### 1.6 Main Application

#### Task 1.6.1: Create Application Controller
**File**: `src/ui/app.js`

- [ ] Initialize taskStore with observer pattern
- [ ] Wire components to store
- [ ] Set up global keyboard shortcuts
- [ ] Handle notifications

**Acceptance Criteria**:
- Store reactively updates UI via observers
- Components don't manually call render
- Global shortcuts work
- Clean separation of concerns

**Code Template**:
```javascript
import { taskStore } from '../core/taskStore.js';
import { TaskForm } from './components/TaskForm.js';
import { ListView } from './components/ListView.js';

class App {
  constructor() {
    this.taskStore = taskStore;
    this.init();
  }

  init() {
    this.setupUI();
    this.setupGlobalListeners();
  }

  setupUI() {
    const formContainer = document.querySelector('.task-form-container');
    const listContainer = document.querySelector('.task-list-container');

    // Task form - handles creation
    this.taskForm = new TaskForm(formContainer, (taskData) => {
      this.handleTaskCreate(taskData);
    });

    // List view - subscribes to store, auto-updates via observer pattern
    this.listView = new ListView(listContainer, this.taskStore);
    
    // Initial render happens via store's load() → notify()
  }

  setupGlobalListeners() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Quick add task
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('taskText')?.focus();
      }
      
      // Escape: Clear focus
      if (e.key === 'Escape') {
        document.activeElement?.blur();
      }
    });

    // Auto-save indicator (optional)
    this.taskStore.subscribe(() => {
      this.showSaveIndicator();
    });
  }

  handleTaskCreate(taskData) {
    try {
      this.taskStore.create(taskData);
      // No manual render needed - observer pattern handles it!
      this.showNotification('Task added successfully!', 'success');
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Simple toast notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showSaveIndicator() {
    // Optional: Show brief "Saved" indicator
    const indicator = document.querySelector('.save-indicator');
    if (indicator) {
      indicator.classList.add('active');
      setTimeout(() => indicator.classList.remove('active'), 1000);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

export default App;
```

---

### 1.7 Styling (Dark Academia Theme)

#### Task 1.7.1: CSS Reset
**File**: `styles/reset.css`

- [ ] Normalize browser defaults
- [ ] Box-sizing reset
- [ ] Remove default margins/padding

**Code Template**:
```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  line-height: 1.6;
  min-height: 100vh;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

a {
  text-decoration: none;
  color: inherit;
}

ul,
ol {
  list-style: none;
}
```

---

#### Task 1.7.2: CSS Variables (Theme)
**File**: `styles/variables.css`

- [ ] Define color palette (dark academia)
- [ ] Set typography scales
- [ ] Create spacing system
- [ ] Add animation timings

**Code Template**:
```css
:root {
  /* Dark Academia Colors */
  --color-primary-dark: #0d1421;
  --color-secondary-dark: #1e293b;
  --color-tertiary-dark: #334155;
  
  --color-accent-gold: #f4a261;
  --color-accent-emerald: #2d9f7c;
  --color-accent-blue: #3b82f6;
  
  --color-text-light: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-text-dark: #1e293b;
  
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #10b981;
  --color-info: #3b82f6;
  
  /* Typography */
  --font-heading: 'Crimson Text', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 2rem;      /* 32px */
  
  /* Spacing Scale */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.2);
  
  /* Animations */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Z-index Scale */
  --z-dropdown: 100;
  --z-modal: 200;
  --z-notification: 300;
}
```

---

#### Task 1.7.3: Layout Styles
**File**: `styles/layout.css`

- [ ] App container layout
- [ ] Grid system
- [ ] Flexbox utilities
- [ ] Responsive container

**Code Template**:
```css
body {
  background: var(--color-primary-dark);
  color: var(--color-text-light);
  font-family: var(--font-body);
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-md);
}

.app-header {
  text-align: center;
  padding: var(--space-2xl) 0;
  border-bottom: 2px solid var(--color-tertiary-dark);
  margin-bottom: var(--space-xl);
}

.app-header h1 {
  font-family: var(--font-heading);
  font-size: var(--font-size-3xl);
  color: var(--color-accent-gold);
  margin-bottom: var(--space-sm);
}

.tagline {
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}

.app-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

@media (min-width: 768px) {
  .app-main {
    grid-template-columns: 400px 1fr;
  }
}

.task-form-container {
  background: var(--color-secondary-dark);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
}

.task-list-container {
  background: var(--color-secondary-dark);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
}
```

---

#### Task 1.7.4: Component Styles
**File**: `styles/components.css`

- [ ] Task card styling
- [ ] Form styling
- [ ] Button variants
- [ ] Badge/pill components

**Code Template**:
```css
/* Task Form */
.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group select {
  padding: var(--space-md);
  background: var(--color-primary-dark);
  border: 2px solid var(--color-tertiary-dark);
  border-radius: var(--radius-md);
  color: var(--color-text-light);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-base);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-accent-gold);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

.error-message {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  min-height: 1.25rem;
}

/* Buttons */
.btn {
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.btn-primary {
  background: var(--color-accent-gold);
  color: var(--color-text-dark);
}

.btn-primary:hover {
  background: #e8935a;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--color-tertiary-dark);
  color: var(--color-text-light);
}

.btn-secondary:hover {
  background: var(--color-secondary-dark);
}

.form-actions {
  display: flex;
  gap: var(--space-md);
}

/* Task Card */
.task-card {
  background: var(--color-tertiary-dark);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  display: flex;
  gap: var(--space-md);
  transition: all var(--transition-base);
  border-left: 4px solid transparent;
}

.task-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.task-card.completed {
  opacity: 0.6;
}

.task-card.completed .task-card__text {
  text-decoration: line-through;
}

.task-card.overdue {
  border-left-color: var(--color-danger);
}

.task-card__checkbox {
  display: flex;
  align-items: flex-start;
  padding-top: 0.125rem;
}

.task-card__checkbox input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.task-card__content {
  flex: 1;
}

.task-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.task-category {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-primary-dark);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.task-priority {
  font-size: var(--font-size-lg);
}

.task-card__text {
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text-light);
  margin-bottom: var(--space-sm);
}

.task-card__due-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.task-card__due-date.overdue {
  color: var(--color-danger);
  font-weight: 600;
}

.overdue-badge {
  background: var(--color-danger);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  margin-left: var(--space-xs);
}

.task-card__actions {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
}

.btn-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--color-primary-dark);
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background: var(--color-accent-gold);
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--color-text-muted);
}

.empty-state__icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.empty-state h3 {
  font-family: var(--font-heading);
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-md);
  color: var(--color-text-light);
}

/* Stats */
.stats {
  display: flex;
  justify-content: space-around;
  padding: var(--space-lg);
  background: var(--color-tertiary-dark);
  border-radius: var(--radius-md);
  margin-top: var(--space-xl);
}

.stats span {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.stats strong {
  color: var(--color-text-light);
  font-size: var(--font-size-lg);
  display: block;
  margin-top: var(--space-xs);
}
```

---

### 1.8 Phase 1 Testing & Validation

#### Task 1.8.1: Manual Testing Checklist

- [ ] **Task Creation**
  - Create task with all fields filled
  - Create task with minimal fields (text only)
  - Validate empty text shows error
  - Validate max length (500 chars)
  - Test all category options
  - Test all priority levels
  - Test date picker

- [ ] **Task Display**
  - Tasks show correct category icon
  - Priority badges display properly
  - Due dates format correctly
  - Overdue tasks show warning

- [ ] **Task Actions**
  - Toggle completion updates UI
  - Edit button works (console log for now)
  - Delete shows confirmation
  - Delete removes task permanently

- [ ] **Data Persistence**
  - Tasks save to localStorage
  - Page refresh preserves tasks
  - Multiple tabs sync data

- [ ] **Filtering & Sorting**
  - Filter by All/Active/Completed
  - Sort by date, priority, due date
  - Empty state shows when no tasks match

- [ ] **Responsive Design**
  - Test on mobile (320px)
  - Test on tablet (768px)
  - Test on desktop (1024px+)
  - Form is usable on small screens

- [ ] **Accessibility**
  - Keyboard navigation works
  - Tab order is logical
  - Form labels are associated
  - ARIA labels present
  - Color contrast meets WCAG AA

- [ ] **Performance**
  - Page loads in < 3 seconds
  - Smooth animations (60fps)
  - No console errors
  - Works with 100+ tasks

---

## 🚀 PHASE 2: Research Features (Weeks 3-4)

**Goal**: Add academic workflow templates, task dependencies, and enhanced organization.

### 2.1 Template System

#### Task 2.1.1: Create Template Engine
**File**: `src/features/templates/template-engine.js`

- [ ] Define Template class
- [ ] Implement template loading
- [ ] Add task generation from template
- [ ] Include date calculation for deadlines

**Acceptance Criteria**:
- Templates can be loaded and applied
- Tasks generate with correct relative dates
- Template data is validated

---

#### Task 2.1.2: Paper Submission Template
**File**: `src/features/templates/paper-submission.js`

- [ ] Define paper submission workflow
- [ ] Include typical tasks (draft, review, format, submit)
- [ ] Set relative deadlines from submission date
- [ ] Add task dependencies

---

#### Task 2.1.3: Grant Proposal Template
**File**: `src/features/templates/grant-proposal.js`

- [ ] Define grant workflow tasks
- [ ] Include budget, aims, background sections
- [ ] Add multi-month timeline
- [ ] Include review cycles

---

#### Task 2.1.4: Experiment Cycle Template
**File**: `src/features/templates/experiment-cycle.js`

- [ ] Define experiment workflow
- [ ] Include preparation, execution, analysis phases
- [ ] Add equipment/resource notes
- [ ] Link related tasks

---

### 2.2 Task Dependencies

#### Task 2.2.1: Implement Dependency System
**File**: `src/features/dependencies.js`

- [ ] Add dependency field to Task model
- [ ] Create dependency validation (no circular deps)
- [ ] Implement blocking logic (can't complete if deps not done)
- [ ] Add visual dependency indicators

**Acceptance Criteria**:
- Tasks can have multiple dependencies
- Circular dependencies are prevented
- Blocked tasks show clear UI indication
- Completing deps unlocks blocked tasks

---

### 2.3 Enhanced Views

#### Task 2.3.1: Kanban Board View
**File**: `src/ui/views/kanban-view.js`

- [ ] Create columns: TODO, IN PROGRESS, REVIEW, DONE
- [ ] Implement drag-and-drop between columns
- [ ] Update task status based on column
- [ ] Add column task counts

---

#### Task 2.3.2: Timeline View
**File**: `src/ui/views/timeline-view.js`

- [ ] Create Gantt-style timeline
- [ ] Show tasks on date axis
- [ ] Highlight current date
- [ ] Show dependencies as connections

---

### 2.4 Advanced Filtering

#### Task 2.4.1: Multi-Filter System
**File**: `src/ui/components/advanced-filter.js`

- [ ] Create filter panel
- [ ] Add category checkboxes
- [ ] Add priority checkboxes
- [ ] Add date range picker
- [ ] Add tag filter
- [ ] Combine multiple filters

---

### 2.5 Projects & Organization

#### Task 2.5.1: Project Management
**File**: `src/core/project-manager.js`

- [ ] Implement project CRUD operations
- [ ] Link tasks to projects
- [ ] Add project color coding
- [ ] Create project view/filter

---

## 🎨 PHASE 3: UI Polish & UX (Week 5)

**Goal**: Professional, polished interface with smooth animations and excellent UX.

### 3.1 Animations & Transitions

#### Task 3.1.1: Create Animation Library
**File**: `styles/animations.css`

- [ ] Task card entrance animations
- [ ] Smooth completion transitions
- [ ] Drag-and-drop visual feedback
- [ ] Modal slide-in animations
- [ ] Loading states with spinners

---

### 3.2 Keyboard Shortcuts

#### Task 3.2.1: Implement Keyboard Navigation
**File**: `src/utils/keyboard-shortcuts.js`

- [ ] `Ctrl+K`: Quick add task
- [ ] `Ctrl+F`: Focus search/filter
- [ ] `Ctrl+1-6`: Switch between views
- [ ] `Escape`: Close modals
- [ ] Arrow keys: Navigate task list
- [ ] `Enter`: Edit focused task
- [ ] `Delete`: Delete focused task

---

### 3.3 Drag & Drop

#### Task 3.3.1: Implement Drag and Drop
**File**: `src/features/drag-drop.js`

- [ ] Make task cards draggable
- [ ] Add drop zones for reordering
- [ ] Visual feedback during drag
- [ ] Update task order in storage
- [ ] Works on touch devices

---

### 3.4 Mobile Optimization

#### Task 3.4.1: Mobile-Specific Features

- [ ] Swipe gestures for task actions
- [ ] Bottom sheet for quick add
- [ ] Optimized touch targets (44x44px minimum)
- [ ] Mobile-friendly modals
- [ ] Collapsible sections

---

### 3.5 Theme Customization

#### Task 3.5.1: Theme Switcher
**File**: `src/features/theme-manager.js`

- [ ] Light/Dark theme toggle
- [ ] Custom accent color picker
- [ ] Save theme preference
- [ ] Smooth theme transitions

---

## 🧠 PHASE 4: Advanced Features (Week 6+)

**Goal**: AI-powered insights, PWA capabilities, collaboration features.

### 4.1 AI Features

#### Task 4.1.1: Smart Categorization
**File**: `src/features/ai/categorizer.js`

- [ ] Analyze task text for keywords
- [ ] Suggest category based on content
- [ ] Learn from user corrections
- [ ] Confidence scoring

---

#### Task 4.1.2: Productivity Insights
**File**: `src/features/ai/insights.js`

- [ ] Track completion patterns
- [ ] Identify productive time periods
- [ ] Detect bottlenecks
- [ ] Generate weekly reports

---

#### Task 4.1.3: Voice-to-Text Task Capture
**File**: `src/features/voice-capture.js`

- [ ] Implement Web Speech API (SpeechRecognition)
- [ ] Add voice button to task form
- [ ] Handle speech-to-text conversion
- [ ] Parse voice input for task creation
- [ ] Graceful fallback for unsupported browsers

**Acceptance Criteria**:
- Voice capture works in supported browsers (Chrome, Edge)
- Shows clear UI feedback during recording
- Transcribed text appears in task input
- Handles errors gracefully

**Code Template**:
```javascript
// Voice-to-text task capture for hands-free lab work

class VoiceCapture {
  constructor(onTranscript, onError) {
    this.onTranscript = onTranscript;
    this.onError = onError;
    this.recognition = null;
    this.isListening = false;
    
    this.init();
  }

  init() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.setupEventListeners();
    return true;
  }

  setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log('Transcript:', transcript, 'Confidence:', confidence);
      
      if (this.onTranscript) {
        this.onTranscript(transcript, confidence);
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      
      let errorMessage = 'Voice recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found or access denied.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }
      
      if (this.onError) {
        this.onError(errorMessage);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Voice recognition ended');
    };
  }

  start() {
    if (!this.recognition) {
      if (this.onError) {
        this.onError('Voice recognition not supported in this browser');
      }
      return false;
    }

    if (this.isListening) {
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      if (this.onError) {
        this.onError('Failed to start voice recognition');
      }
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isSupported() {
    return !!this.recognition;
  }
}

export default VoiceCapture;

// Usage example in TaskForm component:
// import VoiceCapture from '../../features/voice-capture.js';
//
// const voiceCapture = new VoiceCapture(
//   (transcript, confidence) => {
//     document.getElementById('taskText').value = transcript;
//     // Auto-categorize based on keywords in transcript (Phase 4.1.1)
//   },
//   (error) => {
//     console.error('Voice error:', error);
//     showNotification(error, 'error');
//   }
// );
//
// // Add voice button to form
// <button type="button" class="btn-voice" aria-label="Voice input">
//   🎤 Speak
// </button>
```

**UI Integration Notes**:
- Add microphone button to task form
- Show pulsing animation during recording
- Display "Listening..." feedback
- Auto-focus task input after transcription
- Perfect for lab work when hands are busy!

---

### 4.2 PWA Implementation

#### Task 4.2.1: Service Worker
**File**: `public/service-worker.js`

- [ ] Cache app shell
- [ ] Offline functionality
- [ ] Background sync
- [ ] Push notifications

---

#### Task 4.2.2: Web Manifest
**File**: `public/manifest.json`

- [ ] App name and description
- [ ] Icons in all sizes
- [ ] Theme colors
- [ ] Display mode

---

### 4.3 Data Management

#### Task 4.3.1: Export Functionality
**File**: `src/utils/export.js`

- [ ] Export as JSON
- [ ] Export as CSV
- [ ] Export to Markdown
- [ ] Export specific projects/categories

---

#### Task 4.3.2: Import Functionality
**File**: `src/utils/import.js`

- [ ] Import from JSON
- [ ] Import from CSV
- [ ] Validate imported data
- [ ] Merge with existing tasks

---

### 4.4 Citation Integration

#### Task 4.4.1: Citation Manager
**File**: `src/features/citations.js`

- [ ] Link tasks to papers
- [ ] Store DOI/citation info
- [ ] Generate bibliography
- [ ] Fetch paper metadata

---

## 📋 Code Standards

### JavaScript Guidelines

1. **ES6+ Syntax**: Use modern JavaScript features
2. **Module Pattern**: Each file is a module with clear exports
3. **Observer Pattern**: Implement subscribe/notify for reactive state management
   - Store notifies observers on state changes
   - Components subscribe to updates instead of manual renders
   - Return unsubscribe function for cleanup
4. **Event Delegation**: Use delegate pattern for dynamic elements
   - Attach listeners to containers, not individual elements
   - Better performance with large lists
   - Works with dynamically added/removed elements
5. **Class-Based**: Use classes for components and stores
6. **Pure Functions**: Minimize side effects, especially in utilities
7. **Error Handling**: Try-catch blocks for all data operations
8. **Validation**: Validate all user inputs
9. **Versioned Storage**: Use namespaced keys (rf.tasks.v1) for safe migrations
10. **Comments**: Document complex logic and public APIs

### CSS Guidelines

1. **BEM Naming**: Use Block__Element--Modifier pattern
2. **Custom Properties**: Use CSS variables for theming
3. **Mobile-First**: Start with mobile, add desktop enhancements
4. **Transitions**: Smooth animations for all interactive elements
5. **Accessibility**: Ensure sufficient color contrast
6. **Comments**: Section headers for major component groups

### File Organization

1. **Single Responsibility**: Each file has one clear purpose
2. **Logical Grouping**: Related code in same directory
3. **Import Order**: Config → Core → Features → UI → Utils
4. **Export Pattern**: Named exports for utilities, default for components

---

## 🎯 Definition of Done

### For Each Task:
- [ ] Code is written and tested
- [ ] No console errors or warnings
- [ ] Passes manual testing
- [ ] Responsive on all breakpoints
- [ ] Accessible with keyboard
- [ ] Commented where necessary
- [ ] Follows code standards
- [ ] Integrated with existing code

### For Each Phase:
- [ ] All tasks completed
- [ ] Phase tested end-to-end
- [ ] Performance benchmarks met
- [ ] Accessibility validated
- [ ] Code reviewed
- [ ] Documentation updated

---

## 📝 Progress Tracking

### Phase 1: Core Foundation
- Status: **NOT STARTED**
- Estimated: 2 weeks
- Progress: 0/8 major tasks

### Phase 2: Research Features
- Status: **NOT STARTED**
- Estimated: 2 weeks
- Progress: 0/5 major tasks

### Phase 3: UI Polish & UX
- Status: **NOT STARTED**
- Estimated: 1 week
- Progress: 0/5 major tasks

### Phase 4: Advanced Features
- Status: **NOT STARTED**
- Estimated: 1+ weeks
- Progress: 0/4 major tasks


---


*Architecture designed by: Chief Architect Agent*  
*Date: October 26, 2025*

