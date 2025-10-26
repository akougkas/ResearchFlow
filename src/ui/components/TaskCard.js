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

