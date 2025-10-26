/**
 * Kanban Board View
 * Organize tasks in columns: TODO → IN PROGRESS → REVIEW → DONE
 * Supports drag-and-drop for moving tasks between columns
 */

import { TaskCard } from './TaskCard.js';
import { delegate } from '../../utils/dom.js';

// Task statuses map to columns
const STATUS_COLUMNS = {
  'todo': { id: 'todo', name: 'Todo', color: '#94a3b8', order: 0 },
  'in-progress': { id: 'in-progress', name: 'In Progress', color: '#3b82f6', order: 1 },
  'review': { id: 'review', name: 'Review', color: '#f59e0b', order: 2 },
  'done': { id: 'done', name: 'Done', color: '#10b981', order: 3 }
};

export class KanbanView {
  constructor(container, taskStore, getFilteredTasksFn = null) {
    this.container = container;
    this.taskStore = taskStore;
    this.getFilteredTasksFn = getFilteredTasksFn;
    this.draggedTask = null;
    
    // Subscribe to store changes for reactive updates
    this.unsubscribe = taskStore.subscribe(() => {
      this.render();
    });

    this.render();
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const columns = this.getColumnData();

    this.container.innerHTML = `
      <div class="kanban-board">
        <div class="kanban-header">
          <h2>📊 Kanban Board</h2>
          <p class="kanban-subtitle">Drag tasks between columns to update status</p>
        </div>

        <div class="kanban-columns">
          ${columns.map(column => `
            <div class="kanban-column" data-column="${column.id}">
              <div class="column-header" style="border-top-color: ${column.color}">
                <h3>${column.name}</h3>
                <span class="column-count">${column.tasks.length}</span>
              </div>

              <div class="column-content" id="column-${column.id}">
                ${column.tasks.length > 0 
                  ? column.tasks.map(task => `
                    <div class="kanban-task" draggable="true" data-task-id="${task.id}">
                      <div class="kanban-task-content">
                        <span class="task-category-badge">${this.getCategoryIcon(task.category)}</span>
                        <span class="task-priority-badge priority-${task.priority}">
                          ${this.getPriorityIcon(task.priority)}
                        </span>
                        <p class="kanban-task-text">${this.escapeHtml(task.text)}</p>
                        ${task.dueDate ? `
                          <div class="kanban-task-due">
                            📅 ${this.formatDate(task.dueDate)}
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')
                  : `<div class="column-empty">No tasks</div>`
                }
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  getColumnData() {
    // Use filtered tasks if available, otherwise get all tasks
    const tasks = (this.getFilteredTasksFn && this.getFilteredTasksFn()) || this.taskStore.getAll();
    
    // Group tasks by status (stored in a custom status field or derived from completed state)
    const columns = Object.values(STATUS_COLUMNS).sort((a, b) => a.order - b.order);

    return columns.map(column => {
      let columnTasks = [];

      switch (column.id) {
        case 'todo':
          columnTasks = tasks.filter(t => !t.completed && t.status !== 'in-progress' && t.status !== 'review');
          break;
        case 'in-progress':
          columnTasks = tasks.filter(t => !t.completed && t.status === 'in-progress');
          break;
        case 'review':
          columnTasks = tasks.filter(t => !t.completed && t.status === 'review');
          break;
        case 'done':
          columnTasks = tasks.filter(t => t.completed);
          break;
      }

      return {
        ...column,
        tasks: columnTasks
      };
    });
  }

  attachEventListeners() {
    const board = this.container.querySelector('.kanban-board');

    // Drag start
    delegate(board, 'dragstart', '.kanban-task', (event, target) => {
      this.draggedTask = target.dataset.taskId;
      target.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', target.innerHTML);
    });

    // Drag end
    delegate(board, 'dragend', '.kanban-task', (event, target) => {
      target.classList.remove('dragging');
      this.draggedTask = null;

      // Remove drag-over styling from all columns
      document.querySelectorAll('.column-content').forEach(col => {
        col.classList.remove('drag-over');
      });
    });

    // Drag over
    delegate(board, 'dragover', '.column-content', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      event.target.closest('.column-content').classList.add('drag-over');
    });

    // Drag leave
    delegate(board, 'dragleave', '.column-content', (event) => {
      const columnContent = event.target.closest('.column-content');
      if (columnContent && !columnContent.contains(event.relatedTarget)) {
        columnContent.classList.remove('drag-over');
      }
    });

    // Drop
    delegate(board, 'drop', '.column-content', (event, target) => {
      event.preventDefault();
      
      const columnContent = target.closest('.column-content');
      const columnId = columnContent.id.replace('column-', '');
      
      if (this.draggedTask) {
        this.moveTaskToColumn(this.draggedTask, columnId);
      }

      columnContent.classList.remove('drag-over');
      this.draggedTask = null;
    });

    // Prevent default drag behavior on column containers
    delegate(board, 'dragover', '.kanban-column', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    });
  }

  moveTaskToColumn(taskId, columnId) {
    const task = this.taskStore.getById(taskId);
    if (!task) return;

    // Update task status based on column
    const updates = {};
    
    switch (columnId) {
      case 'todo':
        updates.status = undefined; // Default status
        updates.completed = false;
        break;
      case 'in-progress':
        updates.status = 'in-progress';
        updates.completed = false;
        break;
      case 'review':
        updates.status = 'review';
        updates.completed = false;
        break;
      case 'done':
        updates.completed = true;
        updates.status = undefined;
        break;
    }

    try {
      this.taskStore.update(taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  getCategoryIcon(category) {
    const icons = {
      'data': '📊',
      'experiment': '🧪',
      'writing': '📝',
      'funding': '💰',
      'presentation': '🎤',
      'literature': '📚'
    };
    return icons[category] || '📌';
  }

  getPriorityIcon(priority) {
    const icons = {
      'critical': '🔥',
      'high': '⚡',
      'normal': '📌',
      'low': '💤'
    };
    return icons[priority] || '📌';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
