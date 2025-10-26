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

