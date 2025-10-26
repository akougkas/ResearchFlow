/**
 * Advanced Filter Component
 * Multi-dimensional filtering: categories, priorities, date range, tags, completion status
 * Allows combining multiple filters
 */

import { CATEGORIES } from '../../config/categories.js';
import { PRIORITIES } from '../../config/priorities.js';
import { delegate } from '../../utils/dom.js';

export class AdvancedFilter {
  constructor(container, taskStore, onFilterChange) {
    this.container = container;
    this.taskStore = taskStore;
    this.onFilterChange = onFilterChange;

    // Filter state
    this.filters = {
      categories: [],
      priorities: [],
      completion: 'all', // 'all', 'completed', 'pending'
      dateRange: { start: null, end: null },
      tags: [],
      searchQuery: '',
      blocked: false // Show only blocked tasks
    };

    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="advanced-filter">
        <div class="filter-header">
          <h3>🔍 Advanced Filter</h3>
          <button class="filter-reset" id="resetFilters">Reset All</button>
        </div>

        <!-- Search -->
        <div class="filter-section">
          <label for="filterSearch">Search</label>
          <input 
            type="text" 
            id="filterSearch" 
            placeholder="Search tasks..."
            value="${this.filters.searchQuery}"
            class="filter-input"
          >
        </div>

        <!-- Categories -->
        <div class="filter-section">
          <label>Categories</label>
          <div class="filter-checkboxes">
            ${CATEGORIES.map(cat => `
              <label class="filter-checkbox">
                <input 
                  type="checkbox" 
                  class="category-filter"
                  value="${cat.id}"
                  ${this.filters.categories.includes(cat.id) ? 'checked' : ''}
                >
                <span>${cat.icon} ${cat.name}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Priorities -->
        <div class="filter-section">
          <label>Priorities</label>
          <div class="filter-checkboxes">
            ${PRIORITIES.map(pri => `
              <label class="filter-checkbox">
                <input 
                  type="checkbox" 
                  class="priority-filter"
                  value="${pri.level}"
                  ${this.filters.priorities.includes(pri.level) ? 'checked' : ''}
                >
                <span>${pri.icon} ${pri.name}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Completion Status -->
        <div class="filter-section">
          <label>Status</label>
          <div class="filter-radio">
            <label>
              <input 
                type="radio" 
                name="completion" 
                value="all"
                ${this.filters.completion === 'all' ? 'checked' : ''}
                class="status-filter"
              >
              All Tasks
            </label>
            <label>
              <input 
                type="radio" 
                name="completion" 
                value="pending"
                ${this.filters.completion === 'pending' ? 'checked' : ''}
                class="status-filter"
              >
              Pending
            </label>
            <label>
              <input 
                type="radio" 
                name="completion" 
                value="completed"
                ${this.filters.completion === 'completed' ? 'checked' : ''}
                class="status-filter"
              >
              Completed
            </label>
            <label>
              <input 
                type="radio" 
                name="completion" 
                value="blocked"
                ${this.filters.completion === 'blocked' ? 'checked' : ''}
                class="status-filter"
              >
              Blocked (Dependencies)
            </label>
          </div>
        </div>

        <!-- Date Range -->
        <div class="filter-section">
          <label>Due Date Range</label>
          <div class="filter-date-range">
            <input 
              type="date" 
              id="filterDateStart"
              class="filter-date"
              ${this.filters.dateRange.start ? `value="${this.filters.dateRange.start}"` : ''}
            >
            <span class="date-separator">to</span>
            <input 
              type="date" 
              id="filterDateEnd"
              class="filter-date"
              ${this.filters.dateRange.end ? `value="${this.filters.dateRange.end}"` : ''}
            >
          </div>
        </div>

        <!-- Active Filters Display -->
        ${this.getActiveFiltersHtml()}
      </div>
    `;
  }

  getActiveFiltersHtml() {
    const activeFilters = [];

    if (this.filters.categories.length > 0) {
      activeFilters.push(`Categories: ${this.filters.categories.length} selected`);
    }
    if (this.filters.priorities.length > 0) {
      activeFilters.push(`Priorities: ${this.filters.priorities.join(', ')}`);
    }
    if (this.filters.completion !== 'all') {
      activeFilters.push(`Status: ${this.filters.completion}`);
    }
    if (this.filters.dateRange.start || this.filters.dateRange.end) {
      const start = this.filters.dateRange.start || '?';
      const end = this.filters.dateRange.end || '?';
      activeFilters.push(`Dates: ${start} → ${end}`);
    }
    if (this.filters.searchQuery) {
      activeFilters.push(`Search: "${this.filters.searchQuery}"`);
    }

    if (activeFilters.length === 0) {
      return '';
    }

    return `
      <div class="active-filters">
        <div class="active-filters-title">Active Filters:</div>
        ${activeFilters.map(filter => `<span class="active-filter-badge">${filter}</span>`).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    const filterContainer = this.container.querySelector('.advanced-filter');

    // Search input
    const searchInput = filterContainer.querySelector('#filterSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.searchQuery = e.target.value;
        this.applyFilters();
      });
    }

    // Category checkboxes
    delegate(filterContainer, 'change', '.category-filter', (event, target) => {
      const category = target.value;
      if (target.checked) {
        if (!this.filters.categories.includes(category)) {
          this.filters.categories.push(category);
        }
      } else {
        this.filters.categories = this.filters.categories.filter(c => c !== category);
      }
      this.applyFilters();
    });

    // Priority checkboxes
    delegate(filterContainer, 'change', '.priority-filter', (event, target) => {
      const priority = target.value;
      if (target.checked) {
        if (!this.filters.priorities.includes(priority)) {
          this.filters.priorities.push(priority);
        }
      } else {
        this.filters.priorities = this.filters.priorities.filter(p => p !== priority);
      }
      this.applyFilters();
    });

    // Status radio buttons
    delegate(filterContainer, 'change', '.status-filter', (event, target) => {
      this.filters.completion = target.value;
      this.applyFilters();
    });

    // Date range inputs
    const dateStart = filterContainer.querySelector('#filterDateStart');
    const dateEnd = filterContainer.querySelector('#filterDateEnd');

    if (dateStart) {
      dateStart.addEventListener('change', (e) => {
        this.filters.dateRange.start = e.target.value || null;
        this.applyFilters();
      });
    }

    if (dateEnd) {
      dateEnd.addEventListener('change', (e) => {
        this.filters.dateRange.end = e.target.value || null;
        this.applyFilters();
      });
    }

    // Reset filters button
    const resetBtn = filterContainer.querySelector('#resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.filters = {
          categories: [],
          priorities: [],
          completion: 'all',
          dateRange: { start: null, end: null },
          tags: [],
          searchQuery: ''
        };
        this.render();
        this.attachEventListeners();
        this.applyFilters();
      });
    }
  }

  /**
   * Apply all active filters and return filtered tasks
   */
  applyFilters() {
    let tasks = this.taskStore.getAll();

    // Search filter
    if (this.filters.searchQuery) {
      tasks = tasks.filter(t =>
        t.text.toLowerCase().includes(this.filters.searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(this.filters.searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(this.filters.searchQuery.toLowerCase()))
      );
    }

    // Category filter (AND logic - task must match ALL selected categories)
    if (this.filters.categories.length > 0) {
      tasks = tasks.filter(t => this.filters.categories.includes(t.category));
    }

    // Priority filter (OR logic - task must match ANY selected priority)
    if (this.filters.priorities.length > 0) {
      tasks = tasks.filter(t => this.filters.priorities.includes(t.priority));
    }

    // Completion status filter
    switch (this.filters.completion) {
      case 'pending':
        tasks = tasks.filter(t => !t.completed);
        break;
      case 'completed':
        tasks = tasks.filter(t => t.completed);
        break;
      case 'blocked':
        tasks = tasks.filter(t => !this.taskStore.canComplete(t.id) && !t.completed);
        break;
      case 'all':
      default:
        // No filtering
        break;
    }

    // Date range filter
    if (this.filters.dateRange.start || this.filters.dateRange.end) {
      tasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);

        if (this.filters.dateRange.start) {
          const startDate = new Date(this.filters.dateRange.start);
          if (dueDate < startDate) return false;
        }

        if (this.filters.dateRange.end) {
          const endDate = new Date(this.filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (dueDate > endDate) return false;
        }

        return true;
      });
    }

    // Call the callback with filtered results
    if (this.onFilterChange) {
      this.onFilterChange(tasks);
    }

    return tasks;
  }

  /**
   * Get current filter state
   */
  getFilters() {
    return { ...this.filters };
  }

  /**
   * Set filters programmatically
   */
  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.render();
    this.attachEventListeners();
    this.applyFilters();
  }
}
