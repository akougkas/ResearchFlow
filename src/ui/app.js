import { taskStore } from '../core/taskStore.js';
import { projectManager } from '../core/projectManager.js';
import { TaskForm } from './components/TaskForm.js';
import { ListView } from './components/ListView.js';
import { KanbanView } from './components/KanbanView.js';
import { TimelineView } from './components/TimelineView.js';
import { AdvancedFilter } from './components/AdvancedFilter.js';

// Templates
import PaperSubmissionTemplate from '../features/templates/paper-submission.js';
import GrantProposalTemplate from '../features/templates/grant-proposal.js';
import ExperimentCycleTemplate from '../features/templates/experiment-cycle.js';

class App {
  constructor() {
    this.taskStore = taskStore;
    this.projectManager = projectManager;
    this.currentView = 'list'; // list, kanban, timeline
    this.currentViewComponent = null;
    this.currentFilteredTasks = [];
    
    this.init();
  }

  init() {
    this.setupUI();
    this.setupViewSwitcher();
    this.setupTemplateSwitcher();
    this.setupProjectManager();
    this.setupAdvancedFilter();
    this.setupGlobalListeners();
  }

  setupUI() {
    const formContainer = document.querySelector('.task-form-container');
    
    // Task form - handles creation
    this.taskForm = new TaskForm(formContainer, (taskData) => {
      this.handleTaskCreate(taskData);
    });

    // Initialize with list view
    this.switchView('list');
  }

  /**
   * View Switcher: List ↔ Kanban ↔ Timeline
   */
  setupViewSwitcher() {
    const viewContainer = document.querySelector('.view-controls');
    if (!viewContainer) return;

    const buttons = viewContainer.querySelectorAll('[data-view]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
        
        // Update active button
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Set initial active button
    viewContainer.querySelector('[data-view="list"]')?.classList.add('active');
  }

  /**
   * Switch between view modes
   */
  switchView(viewType) {
    // Destroy previous view component
    if (this.currentViewComponent && this.currentViewComponent.destroy) {
      this.currentViewComponent.destroy();
    }

    const listContainer = document.querySelector('.task-list-container');
    if (!listContainer) return;

    this.currentView = viewType;

    // Create callback for views to get filtered tasks
    const getFilteredTasks = () => this.currentFilteredTasks.length > 0 ? this.currentFilteredTasks : null;

    switch (viewType) {
      case 'kanban':
        this.currentViewComponent = new KanbanView(listContainer, this.taskStore, getFilteredTasks);
        break;
      case 'timeline':
        this.currentViewComponent = new TimelineView(listContainer, this.taskStore, getFilteredTasks);
        break;
      case 'list':
      default:
        this.currentViewComponent = new ListView(listContainer, this.taskStore, getFilteredTasks);
        break;
    }
  }

  /**
   * Template Switcher: Load pre-built workflows
   */
  setupTemplateSwitcher() {
    const templateBtn = document.querySelector('.template-switcher');
    if (!templateBtn) return;

    const container = document.querySelector('.template-switcher-container');
    if (!container) return;

    const menu = document.createElement('div');
    menu.className = 'template-menu';
    menu.style.display = 'none'; // Initialize as hidden
    menu.innerHTML = `
      <button class="template-option" data-template="paper">
        📝 Paper Submission (18 tasks)
      </button>
      <button class="template-option" data-template="grant">
        💰 Grant Proposal (30+ tasks)
      </button>
      <button class="template-option" data-template="experiment">
        🧪 Experiment Cycle (30 tasks)
      </button>
    `;

    templateBtn.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    menu.querySelectorAll('.template-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const template = btn.dataset.template;
        this.loadTemplate(template);
        menu.style.display = 'none';
      });
    });

    container.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        menu.style.display = 'none';
      }
    });
  }

  /**
   * Load a template and create tasks
   */
  loadTemplate(templateType) {
    let template = null;
    let templateName = '';

    switch (templateType) {
      case 'paper':
        template = PaperSubmissionTemplate;
        templateName = 'Paper Submission';
        break;
      case 'grant':
        template = GrantProposalTemplate;
        templateName = 'Grant Proposal';
        break;
      case 'experiment':
        template = ExperimentCycleTemplate;
        templateName = 'Experiment Cycle';
        break;
    }

    if (!template) return;

    try {
      // Generate tasks from template
      const generatedTasks = template.generateTasks(new Date());
      
      // Create all tasks with dependency resolution
      const created = this.taskStore.createFromTemplate(generatedTasks);
      
      this.showNotification(
        `✅ Created ${created.length} tasks from ${templateName} template!`,
        'success'
      );
    } catch (error) {
      this.showNotification(`❌ Failed to load template: ${error.message}`, 'error');
    }
  }

  /**
   * Project Manager UI
   */
  setupProjectManager() {
    const projectContainer = document.querySelector('.project-manager');
    if (!projectContainer) return;

    const createBtn = projectContainer.querySelector('.new-project-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.showCreateProjectModal();
      });
    }

    // Subscribe to project changes
    this.projectManager.subscribe(() => {
      this.updateProjectList();
    });

    this.updateProjectList();
  }

  /**
   * Show create project modal
   */
  showCreateProjectModal() {
    const name = prompt('Project name:');
    if (!name) return;

    const description = prompt('Description (optional):');
    
    try {
      const project = this.projectManager.create({
        name,
        description: description || '',
        color: this.getRandomColor()
      });

      this.showNotification(`✅ Project "${name}" created!`, 'success');
    } catch (error) {
      this.showNotification(`❌ Error: ${error.message}`, 'error');
    }
  }

  /**
   * Update project list display
   */
  updateProjectList() {
    const projectList = document.querySelector('.project-list');
    if (!projectList) return;

    const projects = this.projectManager.getAll();

    projectList.innerHTML = projects.length > 0 
      ? projects.map(project => `
        <div class="project-item" style="border-left-color: ${project.color}">
          <div class="project-name">${project.name}</div>
          <div class="project-desc">${project.description}</div>
          <div class="project-stats">
            ${this.getProjectStats(project.id)}
          </div>
        </div>
      `).join('')
      : '<div class="empty-projects">No projects yet. Create one to organize your tasks!</div>';
  }

  /**
   * Get project statistics
   */
  getProjectStats(projectId) {
    const stats = this.projectManager.getProjectStats(projectId, this.taskStore);
    return `${stats.completed}/${stats.total} (${stats.completionRate}%)`;
  }

  /**
   * Advanced Filter Setup
   */
  setupAdvancedFilter() {
    const filterContainer = document.querySelector('.filter-panel');
    if (!filterContainer) return;

    this.advancedFilter = new AdvancedFilter(filterContainer, this.taskStore, (filteredTasks) => {
      this.currentFilteredTasks = filteredTasks;
      this.updateViewWithFilters();
    });
  }

  /**
   * Update current view with filtered tasks
   * Force re-render of current view to respect advanced filters
   */
  updateViewWithFilters() {
    if (this.currentViewComponent && typeof this.currentViewComponent.render === 'function') {
      this.currentViewComponent.render();
    }
  }

  /**
   * Get filtered tasks for views to use
   * Returns advanced filtered tasks if available, otherwise all tasks
   */
  getTasksForView() {
    return this.currentFilteredTasks.length > 0 ? this.currentFilteredTasks : null;
  }

  /**
   * Task Creation Handler
   */
  handleTaskCreate(taskData) {
    try {
      this.taskStore.create(taskData);
      this.showNotification('✅ Task added successfully!', 'success');
    } catch (error) {
      this.showNotification(`❌ Error: ${error.message}`, 'error');
    }
  }

  /**
   * Global Keyboard Shortcuts
   */
  setupGlobalListeners() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Quick add task (focus input)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('taskText')?.focus();
      }
      
      // Ctrl/Cmd + 1: List view
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        this.switchView('list');
      }

      // Ctrl/Cmd + 2: Kanban view
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        this.switchView('kanban');
      }

      // Ctrl/Cmd + 3: Timeline view
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        this.switchView('timeline');
      }
      
      // Escape: Clear focus
      if (e.key === 'Escape') {
        document.activeElement?.blur();
      }
    });

    // Auto-save indicator
    this.taskStore.subscribe(() => {
      this.showSaveIndicator();
    });
  }

  /**
   * Notification System
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Save Indicator
   */
  showSaveIndicator() {
    const indicator = document.querySelector('.save-indicator');
    if (indicator) {
      indicator.classList.add('active');
      setTimeout(() => indicator.classList.remove('active'), 1000);
    }
  }

  /**
   * Utility: Get random color for projects
   */
  getRandomColor() {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

export default App;

