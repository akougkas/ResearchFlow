import { TaskCard } from './TaskCard.js';
import { delegate } from '../../utils/dom.js';

export class ListView {
  constructor(container, taskStore, getFilteredTasksFn = null) {
    this.container = container;
    this.taskStore = taskStore;
    this.getFilteredTasksFn = getFilteredTasksFn;
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
              <option value="date" ${this.currentSort === 'date' ? 'selected' : ''}>Date Created</option>
              <option value="priority" ${this.currentSort === 'priority' ? 'selected' : ''}>Priority</option>
              <option value="dueDate" ${this.currentSort === 'dueDate' ? 'selected' : ''}>Due Date</option>
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
      const taskCard = new TaskCard(task, {
        onToggle: (id) => this.taskStore.toggleComplete(id),
        onEdit: (id) => console.log('Edit task:', id), // TODO: Implement in Phase 2
        onDelete: (id) => this.taskStore.delete(id)
      });
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
    // Start with advanced filtered tasks if available, otherwise all tasks
    const baseTasks = (this.getFilteredTasksFn && this.getFilteredTasksFn()) || this.taskStore.getAll();
    
    let tasks = [];

    // Apply ListView's own filter on top of advanced filter
    switch (this.currentFilter) {
      case 'all':
        tasks = baseTasks;
        break;
      case 'active':
        tasks = baseTasks.filter(t => !t.completed);
        break;
      case 'completed':
        tasks = baseTasks.filter(t => t.completed);
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
