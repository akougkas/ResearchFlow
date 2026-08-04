/**
 * TaskMatrix - Main workspace grid for displaying and managing tasks
 * Neobrutalist data-grid with inline actions
 */

import { QueryBuilder } from './QueryBuilder.js';
import { TaskModal } from './TaskModal.js';
import { TemplateModal } from './TemplateModal.js';
import { AITaskModal } from './AITaskModal.js';
import { getCategoryById } from '../../config/categories.js';
import { getPriorityByLevel } from '../../config/priorities.js';

export class TaskMatrix {
    constructor(container, taskStore, options = {}) {
        this.container = container;
        this.taskStore = taskStore;
        this.currentFilters = { category: 'ALL', priority: 'ALL' };
        this.selectedTaskId = null;
        this.onTaskSelect = options.onTaskSelect || (() => {});

        // Subscribe to changes
        this.unsubscribe = this.taskStore.subscribe(() => this.render());
        this.render();
    }

    render() {
        // Apply filters
        let tasks = this.taskStore.getAll();
        if (this.currentFilters.category !== 'ALL') {
            tasks = tasks.filter(t => t.category === this.currentFilters.category);
        }
        if (this.currentFilters.priority !== 'ALL') {
            tasks = tasks.filter(t => t.priority === this.currentFilters.priority);
        }

        // Sort: incomplete first, then by priority, then by due date
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        tasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return b.createdAt - a.createdAt;
        });

        const stats = this.taskStore.getStats();

        this.container.innerHTML = `
            <div class="matrix-header flex-col margin-bottom-4 padding-bottom-2 border-bottom-thick border-primary">
                <div class="flex-between margin-bottom-3">
                    <div>
                        <h2 class="font-head text-primary text-lg">active_protocols</h2>
                        <div class="font-mono text-muted text-sm">
                            // FEED_LIVE :: ${tasks.length} ITEMS | ${stats.pending} PENDING | ${stats.overdue} CRITICAL
                        </div>
                    </div>
                    <div class="matrix-actions flex gap-2">
                        <button id="ai-gen-btn" class="btn-tactical text-secondary border-thin padding-2 font-mono uppercase">
                            [🤖 AI GEN]
                        </button>
                        <button id="template-btn" class="btn-tactical text-main border-thin padding-2 font-mono uppercase">
                            [📚 TEMPLATES]
                        </button>
                        <button id="add-task-btn" class="btn-tactical text-primary border-thin padding-2 font-mono uppercase">
                            [+ INIT_TASK]
                        </button>
                    </div>
                </div>

                <!-- QUERY BUILDER SLOT -->
                <div id="query-builder-slot"></div>
            </div>

            <div class="matrix-grid font-mono text-sm">
                <!-- HEADERS -->
                <div class="matrix-row header text-muted uppercase text-xs border-bottom-thin padding-y-2">
                    <div class="col-status">STS</div>
                    <div class="col-id">ID</div>
                    <div class="col-desc">PROTOCOL_DESC</div>
                    <div class="col-cat">CAT</div>
                    <div class="col-date">T-MINUS</div>
                    <div class="col-actions">OPS</div>
                </div>

                <!-- CONTENT -->
                <div class="matrix-content scroll-y" id="task-list" style="max-height: calc(100vh - 280px);">
                    ${tasks.map(task => this.renderRow(task)).join('')}
                    ${tasks.length === 0 ? this.renderEmptyState() : ''}
                </div>
            </div>

            <!-- MODAL CONTAINER -->
            <div id="modal-layer"></div>
        `;

        // Initialize QueryBuilder
        new QueryBuilder(this.container.querySelector('#query-builder-slot'), (filters) => {
            this.currentFilters = filters;
            this.render();
        });

        this.attachEvents();
    }

    renderRow(task) {
        const isSelected = this.selectedTaskId === task.id;
        const isCompleted = task.completed;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const isBlocked = !task.completed && !this.taskStore.canComplete(task.id);
        const category = getCategoryById(task.category);
        const priority = getPriorityByLevel(task.priority);

        // Format due date
        let dueDateDisplay = '--';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                dueDateDisplay = `<span class="text-alert">T+${Math.abs(diffDays)}d</span>`;
            } else if (diffDays === 0) {
                dueDateDisplay = '<span class="text-alert">TODAY</span>';
            } else if (diffDays <= 7) {
                dueDateDisplay = `<span class="text-secondary">T-${diffDays}d</span>`;
            } else {
                dueDateDisplay = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        }

        const shortId = task.id.split('_')[2]?.slice(0, 6) || 'ERR';

        return `
            <div class="matrix-row item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''} ${isOverdue ? 'overdue' : ''} ${isBlocked ? 'blocked' : ''}
                        flex align-center border-bottom-thin padding-y-2 hover-bg-dim transition-all"
                 data-id="${task.id}">
                <div class="col-status text-center">
                    <div class="status-indicator ${isCompleted ? 'bg-success' : isBlocked ? 'bg-muted' : isOverdue ? 'bg-alert' : 'bg-primary'}"
                         style="width: 8px; height: 8px; display: inline-block;"
                         title="${isCompleted ? 'Completed' : isBlocked ? 'Blocked by incomplete dependencies' : isOverdue ? 'Overdue' : 'Active'}"></div>
                </div>
                <div class="col-id text-muted text-xs" title="${task.id}">${shortId}</div>
                <div class="col-desc text-main padding-x-2 flex-grow truncate" title="${task.text}">
                    <span class="priority-icon">${priority?.icon || ''}</span>
                    ${this.escapeHtml(task.text)}
                    ${isBlocked ? '<span class="badge text-xs text-muted border-thin margin-left-2 font-mono">[BLOCKED]</span>' : ''}
                </div>
                <div class="col-cat text-secondary text-xs uppercase" title="${category?.name || task.category}">
                    ${category?.icon || ''} ${task.category}
                </div>
                <div class="col-date text-xs">${dueDateDisplay}</div>
                <div class="col-actions">
                    <div class="row-actions">
                        <button class="btn-row-action complete ${isBlocked ? 'opacity-50' : ''}" data-action="toggle" title="${isCompleted ? 'Reopen' : isBlocked ? 'Blocked by incomplete dependencies' : 'Complete'}">
                            ${isCompleted ? '↩' : isBlocked ? '🔒' : '✓'}
                        </button>
                        <button class="btn-row-action edit" data-action="edit" title="Edit">
                            ✎
                        </button>
                        <button class="btn-row-action delete" data-action="delete" title="Delete">
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state padding-5 text-center">
                <div class="font-head text-primary text-lg margin-bottom-2">// NO_DATA_FOUND</div>
                <div class="font-mono text-muted text-sm margin-bottom-4">
                    Initialize a new research protocol or deploy a template to begin tracking.
                </div>
                <button id="empty-add-btn" class="btn-tactical text-primary border-thin padding-2 font-mono uppercase">
                    [+ INIT_FIRST_PROTOCOL]
                </button>
            </div>
        `;
    }

    attachEvents() {
        const addBtn = this.container.querySelector('#add-task-btn');
        const emptyAddBtn = this.container.querySelector('#empty-add-btn');
        const aiBtn = this.container.querySelector('#ai-gen-btn');
        const templateBtn = this.container.querySelector('#template-btn');
        const taskList = this.container.querySelector('#task-list');

        if (addBtn) addBtn.addEventListener('click', () => this.openCreateModal());
        if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => this.openCreateModal());

        if (aiBtn) {
            aiBtn.addEventListener('click', () => {
                const modalLayer = this.container.querySelector('#modal-layer');
                new AITaskModal(modalLayer, {
                    onConfirm: (tasks) => {
                        tasks.forEach(t => {
                            this.taskStore.create({
                                text: t.text,
                                category: t.category,
                                priority: t.priority,
                                notes: t.notes || '',
                                dueDate: t.offsetDays ? new Date(Date.now() + t.offsetDays * 86400000).toISOString().split('T')[0] : null
                            });
                        });
                    }
                });
            });
        }

        if (templateBtn) {
            templateBtn.addEventListener('click', () => {
                const modalLayer = this.container.querySelector('#modal-layer');
                new TemplateModal(modalLayer, { taskStore: this.taskStore });
            });
        }

        if (taskList) {
            taskList.addEventListener('click', (e) => {
                const row = e.target.closest('.matrix-row.item');
                if (!row) return;

                const taskId = row.dataset.id;
                const actionBtn = e.target.closest('[data-action]');

                if (actionBtn) {
                    const action = actionBtn.dataset.action;
                    this.handleRowAction(action, taskId);
                } else {
                    this.selectTask(taskId);
                }
            });
        }

        document.addEventListener('keydown', this.handleKeyboard = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openCreateModal();
            }
        });
    }

    handleRowAction(action, taskId) {
        switch (action) {
            case 'toggle':
                try {
                    this.taskStore.toggleComplete(taskId);
                } catch (err) {
                    console.error('Toggle failed:', err);
                }
                break;

            case 'edit':
                const task = this.taskStore.getById(taskId);
                if (task) this.openEditModal(task);
                break;

            case 'delete':
                this.confirmDelete(taskId);
                break;
        }
    }

    selectTask(taskId) {
        this.selectedTaskId = taskId;
        const task = this.taskStore.getById(taskId);

        this.container.querySelectorAll('.matrix-row.item').forEach(row => {
            row.classList.toggle('selected', row.dataset.id === taskId);
        });

        this.onTaskSelect(task);
    }

    openCreateModal() {
        const modalLayer = this.container.querySelector('#modal-layer');
        new TaskModal(modalLayer, {
            allTasks: this.taskStore.getAll(),
            onSave: (taskData) => {
                try {
                    this.taskStore.create(taskData);
                } catch (err) {
                    console.error('Create failed:', err);
                    alert('Failed to create task: ' + err.message);
                }
            }
        });
    }

    openEditModal(task) {
        const modalLayer = this.container.querySelector('#modal-layer');
        new TaskModal(modalLayer, {
            task: task,
            allTasks: this.taskStore.getAll(),
            onSave: (taskData, isEdit) => {
                try {
                    if (isEdit) {
                        this.taskStore.update(taskData.id, taskData);
                    }
                } catch (err) {
                    console.error('Update failed:', err);
                    alert('Failed to update task: ' + err.message);
                }
            }
        });
    }

    confirmDelete(taskId) {
        const task = this.taskStore.getById(taskId);
        if (!task) return;

        const confirmed = confirm(`DELETE PROTOCOL?\n\n"${task.text.slice(0, 50)}..."\n\nThis action cannot be undone.`);
        if (confirmed) {
            try {
                this.taskStore.delete(taskId);
                if (this.selectedTaskId === taskId) {
                    this.selectedTaskId = null;
                    this.onTaskSelect(null);
                }
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
        document.removeEventListener('keydown', this.handleKeyboard);
    }
}
