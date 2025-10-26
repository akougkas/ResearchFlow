/**
 * Timeline/Gantt View
 * Visualize tasks on a calendar timeline with due dates and estimated duration
 * Shows task dependencies as connecting lines
 */

export class TimelineView {
  constructor(container, taskStore, getFilteredTasksFn = null) {
    this.container = container;
    this.taskStore = taskStore;
    this.getFilteredTasksFn = getFilteredTasksFn;
    this.viewMode = 'month'; // 'week' or 'month'
    this.currentDate = new Date();

    // Subscribe to store changes
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
    this.container.innerHTML = `
      <div class="timeline-view">
        <div class="timeline-header">
          <div class="timeline-title">
            <h2>📅 Timeline</h2>
            <p class="timeline-subtitle">Project schedule and milestones</p>
          </div>

          <div class="timeline-controls">
            <button class="timeline-btn" id="prevMonth" aria-label="Previous month">← Prev</button>
            <span class="current-month">${this.formatMonthYear(this.currentDate)}</span>
            <button class="timeline-btn" id="nextMonth" aria-label="Next month">Next →</button>
            
            <select id="viewModeSelect">
              <option value="month">Month View</option>
              <option value="week">Week View</option>
            </select>
          </div>
        </div>

        <div class="timeline-content">
          ${this.viewMode === 'month' 
            ? this.renderMonthView() 
            : this.renderWeekView()
          }
        </div>

        <div class="timeline-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: #3b82f6;"></span>
            <span>Pending</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #f59e0b;"></span>
            <span>In Progress</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #10b981;"></span>
            <span>Completed</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #ef4444;"></span>
            <span>Overdue</span>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderMonthView() {
    const days = this.getDaysInMonth(this.currentDate);
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const startingDayOfWeek = firstDay.getDay();
    // Use filtered tasks if available, otherwise get all tasks
    const allTasks = (this.getFilteredTasksFn && this.getFilteredTasksFn()) || this.taskStore.getAll();
    const tasks = allTasks.filter(t => t.dueDate);

    let html = '<div class="timeline-month">';
    
    // Day headers
    html += '<div class="month-weekdays">';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      html += `<div class="weekday-header">${day}</div>`;
    });
    html += '</div>';

    // Calendar grid
    html += '<div class="month-grid">';

    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div class="month-day empty"></div>';
    }

    // Days of month
    for (let day = 1; day <= days; day++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(t => t.dueDate === dateStr);
      const isToday = this.isToday(date);
      const isPast = date < new Date() && !isToday;

      html += `
        <div class="month-day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}">
          <div class="day-number">${day}</div>
          <div class="day-tasks">
            ${dayTasks.slice(0, 2).map(task => `
              <div class="timeline-task-dot" 
                   title="${this.escapeHtml(task.text)}"
                   data-task-id="${task.id}"
                   style="background-color: ${this.getTaskColor(task)}"
              ></div>
            `).join('')}
            ${dayTasks.length > 2 ? `<span class="more-tasks">+${dayTasks.length - 2}</span>` : ''}
          </div>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  renderWeekView() {
    const weekStart = this.getWeekStart(this.currentDate);
    // Use filtered tasks if available, otherwise get all tasks
    const allTasks = (this.getFilteredTasksFn && this.getFilteredTasksFn()) || this.taskStore.getAll();
    const tasks = allTasks.filter(t => t.dueDate);

    let html = '<div class="timeline-week">';
    html += '<div class="week-header">';
    html += `<span>${this.formatDateRange(weekStart)}</span>`;
    html += '</div>';

    html += '<div class="week-grid">';

    // Week grid - 7 columns
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(t => t.dueDate === dateStr).sort((a, b) => {
        // Sort by priority
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      const isToday = this.isToday(date);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

      html += `
        <div class="week-day ${isToday ? 'today' : ''}">
          <div class="week-day-header">
            <div class="week-day-name">${dayName}</div>
            <div class="week-day-date">${date.getDate()}</div>
          </div>
          <div class="week-day-tasks">
            ${dayTasks.map(task => `
              <div class="timeline-task-item" 
                   data-task-id="${task.id}"
                   style="border-left-color: ${this.getTaskColor(task)}"
                   title="${this.escapeHtml(task.text)}"
              >
                <span class="task-priority">${this.getPriorityIcon(task.priority)}</span>
                <span class="task-text">${this.escapeHtml(task.text.substring(0, 25))}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  formatMonthYear(date) {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  formatDateRange(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    
    return `${start} - ${end}`;
  }

  getTaskColor(task) {
    if (task.completed) return '#10b981'; // Green - Done
    if (task.status === 'in-progress') return '#f59e0b'; // Orange - In Progress
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) return '#ef4444'; // Red - Overdue
    return '#3b82f6'; // Blue - Pending
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  attachEventListeners() {
    const prevBtn = this.container.querySelector('#prevMonth');
    const nextBtn = this.container.querySelector('#nextMonth');
    const viewModeSelect = this.container.querySelector('#viewModeSelect');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }

    if (viewModeSelect) {
      // Set initial value to match current view mode
      viewModeSelect.value = this.viewMode;
      
      viewModeSelect.addEventListener('change', (e) => {
        this.viewMode = e.target.value;
        this.render();
      });
    }

    // Task detail on click
    this.container.querySelectorAll('[data-task-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const taskId = el.dataset.taskId;
        const task = this.taskStore.getById(taskId);
        if (task) {
          this.showTaskDetail(task);
        }
      });
    });
  }

  showTaskDetail(task) {
    // Show a simple alert with task details
    // In a real app, this would open a modal
    alert(`
📌 ${task.text}
Category: ${task.category}
Priority: ${task.priority}
Due: ${task.dueDate}
Status: ${task.completed ? 'Completed' : 'Pending'}
${task.notes ? `\nNotes: ${task.notes}` : ''}
    `.trim());
  }
}
