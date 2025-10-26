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

        <div class="form-row-2col">
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
        </div>

        <div class="form-group">
          <label for="taskDueDate">Due Date (Optional)</label>
          <input 
            type="date" 
            id="taskDueDate" 
            name="dueDate"
            title="Select a due date for this task"
          >
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

