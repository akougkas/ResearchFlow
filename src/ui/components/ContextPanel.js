/**
 * ContextPanel - Right sidebar showing system diagnostics and selected task details
 * Updates dynamically based on task selection with bi-directional link support.
 */

import { getCategoryById } from '../../config/categories.js';
import { getPriorityByLevel } from '../../config/priorities.js';
import { TemplateModal } from './TemplateModal.js';

export class ContextPanel {
    constructor(container, taskStore) {
        this.container = container;
        this.taskStore = taskStore;
        this.selectedTask = null;

        // Subscribe to store changes for stats updates
        this.unsubscribe = this.taskStore.subscribe(() => this.render());
        this.render();
    }

    setSelectedTask(task) {
        this.selectedTask = task;
        this.render();
    }

    render() {
        const stats = this.taskStore.getStats();

        this.container.innerHTML = `
            <div class="context-header padding-3 border-bottom-thin">
                <div class="font-head text-secondary text-sm">SYS_DIAGNOSTICS</div>
            </div>

            <div class="context-body padding-3 flex-col gap-4 scroll-y" style="max-height: calc(100vh - 60px);">

                ${this.selectedTask ? this.renderTaskDetail() : this.renderOverview(stats)}

            </div>
        `;

        this.attachEvents();
    }

    renderOverview(stats) {
        const categories = ['data', 'experiment', 'writing', 'funding', 'presentation', 'literature'];
        const categoryStats = categories.map(catId => {
            const cat = getCategoryById(catId);
            const count = this.taskStore.filterByCategory(catId).length;
            return { ...cat, count };
        }).filter(c => c.count > 0);

        return `
            <!-- STATS BLOCKS -->
            <div class="stat-block border-thin padding-3 bg-panel">
                <div class="label text-muted text-xs uppercase margin-bottom-1">Task_Load</div>
                <div class="value font-head text-lg text-primary">${stats.total}</div>
                <div class="bar-container margin-top-2 bg-grid" style="height: 4px; width: 100%;">
                    <div class="bar bg-primary" style="height: 100%; width: ${stats.completionRate}%"></div>
                </div>
                <div class="sub-label text-right text-xs text-muted margin-top-1">${stats.completionRate}% COMPLETE</div>
            </div>

            <div class="stat-block border-thin padding-3 bg-panel">
                <div class="label text-muted text-xs uppercase margin-bottom-1">PENDING</div>
                <div class="value font-head text-lg text-secondary">${stats.pending}</div>
            </div>

            <div class="stat-block border-thin padding-3 bg-panel">
                <div class="label text-muted text-xs uppercase margin-bottom-1">OVERDUE</div>
                <div class="value font-head text-lg text-alert">${stats.overdue}</div>
            </div>

            ${stats.blocked > 0 ? `
            <div class="stat-block border-thin padding-3 bg-panel">
                <div class="label text-muted text-xs uppercase margin-bottom-1">BLOCKED</div>
                <div class="value font-head text-lg text-muted">${stats.blocked}</div>
            </div>
            ` : ''}

            <!-- CATEGORY BREAKDOWN -->
            ${categoryStats.length > 0 ? `
            <div class="category-breakdown margin-top-3">
                <div class="font-head text-muted text-xs margin-bottom-2">DISTRIBUTION</div>
                <div class="flex-col gap-1">
                    ${categoryStats.map(cat => `
                        <div class="flex-between text-xs font-mono">
                            <span>${cat.icon} ${cat.name}</span>
                            <span class="text-secondary">${cat.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- QUICK ACTIONS -->
            <div class="tools-section margin-top-4">
                <div class="font-head text-muted text-xs margin-bottom-2">QUICK_TOOLS</div>
                <div class="grid-2 gap-2">
                    <button id="btn-clear-completed" class="btn-tool border-thin padding-2 text-xs font-mono hover-inv text-main full-w">
                        [ CLR_DONE ]
                    </button>
                    <button id="btn-templates" class="btn-tool border-thin padding-2 text-xs font-mono hover-inv text-main full-w">
                        [ TEMPLATES ]
                    </button>
                </div>
            </div>
        `;
    }

    renderTaskDetail() {
        const task = this.selectedTask;
        const category = getCategoryById(task.category);
        const priority = getPriorityByLevel(task.priority);

        let dueStatus = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            if (task.completed) {
                dueStatus = '<span class="text-success">COMPLETED</span>';
            } else if (diffDays < 0) {
                dueStatus = `<span class="text-alert">OVERDUE BY ${Math.abs(diffDays)} DAYS</span>`;
            } else if (diffDays === 0) {
                dueStatus = '<span class="text-alert">DUE TODAY</span>';
            } else {
                dueStatus = `<span class="text-secondary">T-${diffDays} DAYS</span>`;
            }
        }

        const canComplete = this.taskStore.canComplete(task.id);
        const dependentTasks = this.taskStore.getDependentTasks(task.id);

        return `
            <div class="task-detail">
                <!-- BACK BUTTON -->
                <button id="btn-back" class="btn-tool border-thin padding-2 text-xs font-mono text-muted full-w margin-bottom-3">
                    [ ← BACK TO OVERVIEW ]
                </button>

                <!-- TASK HEADER -->
                <div class="task-detail-header padding-bottom-3 margin-bottom-3 border-bottom-thin">
                    <div class="flex-between align-center margin-bottom-2">
                        <span class="font-head text-xs text-muted">PROTOCOL_DETAIL</span>
                        <span class="text-xs font-mono text-muted">${task.id.split('_')[2]?.slice(0, 8) || task.id}</span>
                    </div>
                    <div class="font-mono text-main">${this.escapeHtml(task.text)}</div>
                </div>

                <!-- STATUS -->
                <div class="detail-field">
                    <div class="detail-label">STATUS</div>
                    <div class="detail-value ${task.completed ? 'text-success' : 'text-primary'}">
                        ${task.completed ? '● COMPLETED' : '○ ACTIVE'}
                    </div>
                </div>

                <!-- CATEGORY -->
                <div class="detail-field">
                    <div class="detail-label">CATEGORY</div>
                    <div class="detail-value">
                        ${category?.icon || ''} ${category?.name || task.category}
                    </div>
                </div>

                <!-- PRIORITY -->
                <div class="detail-field">
                    <div class="detail-label">PRIORITY</div>
                    <div class="detail-value" style="color: ${priority?.color || 'inherit'}">
                        ${priority?.icon || ''} ${priority?.name || task.priority}
                    </div>
                </div>

                <!-- DUE DATE -->
                ${task.dueDate ? `
                <div class="detail-field">
                    <div class="detail-label">T-MINUS</div>
                    <div class="detail-value">
                        ${new Date(task.dueDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                        <div class="text-xs margin-top-1">${dueStatus}</div>
                    </div>
                </div>
                ` : ''}

                <!-- NOTES WITH WIKI LINKS -->
                ${task.notes ? `
                <div class="detail-field">
                    <div class="detail-label">NOTES & REFERENCES</div>
                    <div class="detail-value text-sm" style="white-space: pre-wrap;">${this.formatNotesWithWikiLinks(task.notes)}</div>
                </div>
                ` : ''}

                <!-- DEPENDENCIES -->
                ${task.dependencies && task.dependencies.length > 0 ? `
                <div class="detail-field">
                    <div class="detail-label">DEPENDS ON</div>
                    <div class="detail-value text-sm">
                        ${task.dependencies.map(depId => {
                            const depTask = this.taskStore.getById(depId);
                            if (!depTask) return '';
                            return `
                                <div class="flex-between text-xs margin-bottom-1 cursor-pointer hover-text-primary btn-jump-task" data-id="${depTask.id}">
                                    <span class="${depTask.completed ? 'text-success' : 'text-muted'}">
                                        ${depTask.completed ? '●' : '○'} ${this.escapeHtml(depTask.text.slice(0, 28))}...
                                    </span>
                                    <span class="text-secondary text-xs">🔗</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${!canComplete && !task.completed ? `
                        <div class="text-xs text-alert margin-top-1">⚠ BLOCKED: Complete dependencies first</div>
                    ` : ''}
                </div>
                ` : ''}

                <!-- DEPENDENTS -->
                ${dependentTasks.length > 0 ? `
                <div class="detail-field">
                    <div class="detail-label">BLOCKS PROTOCOLS</div>
                    <div class="detail-value text-sm text-muted">
                        ${dependentTasks.map(dT => `
                            <div class="text-xs margin-bottom-1 cursor-pointer hover-text-primary btn-jump-task" data-id="${dT.id}">
                                ↳ ${this.escapeHtml(dT.text.slice(0, 28))}...
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- METADATA -->
                <div class="detail-field margin-top-3">
                    <div class="detail-label">METADATA</div>
                    <div class="detail-value text-xs text-muted">
                        Created: ${new Date(task.createdAt).toLocaleString()}<br>
                        Updated: ${new Date(task.updatedAt).toLocaleString()}
                    </div>
                </div>

                <!-- ACTIONS -->
                <div class="detail-actions margin-top-4">
                    <button id="btn-toggle" class="btn-tactical ${task.completed ? 'text-muted' : 'text-success'} border-thin padding-2 font-mono text-xs flex-grow"
                            ${!canComplete && !task.completed ? 'disabled title="Complete dependencies first"' : ''}>
                        [ ${task.completed ? 'REOPEN' : 'COMPLETE'} ]
                    </button>
                    <button id="btn-delete" class="btn-tactical text-alert border-thin padding-2 font-mono text-xs">
                        [ DELETE ]
                    </button>
                </div>
            </div>
        `;
    }

    formatNotesWithWikiLinks(notes) {
        if (!notes) return '';
        const escaped = this.escapeHtml(notes);

        // Replace [[Task:id]] or [[id]] with clickable span link
        return escaped.replace(/\[\[(?:Task:)?([a-zA-Z0-9_\-]+)\]\]/g, (match, taskId) => {
            const targetTask = this.taskStore.getById(taskId);
            const label = targetTask ? targetTask.text.slice(0, 20) + '...' : taskId;
            return `<span class="btn-jump-task text-secondary underline cursor-pointer" data-id="${taskId}">[[🔗 ${label}]]</span>`;
        });
    }

    attachEvents() {
        const backBtn = this.container.querySelector('#btn-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.selectedTask = null;
                this.render();
            });
        }

        // Jump to task link handlers
        this.container.querySelectorAll('.btn-jump-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.id;
                const targetTask = this.taskStore.getById(targetId);
                if (targetTask) {
                    this.setSelectedTask(targetTask);
                } else {
                    alert(`Referenced task [${targetId}] not found in workspace.`);
                }
            });
        });

        // Toggle complete
        const toggleBtn = this.container.querySelector('#btn-toggle');
        if (toggleBtn && this.selectedTask) {
            toggleBtn.addEventListener('click', () => {
                try {
                    this.taskStore.toggleComplete(this.selectedTask.id);
                    this.selectedTask = this.taskStore.getById(this.selectedTask.id);
                } catch (err) {
                    console.error('Toggle failed:', err);
                }
            });
        }

        // Delete
        const deleteBtn = this.container.querySelector('#btn-delete');
        if (deleteBtn && this.selectedTask) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Delete this task permanently?')) {
                    try {
                        this.taskStore.delete(this.selectedTask.id);
                        this.selectedTask = null;
                    } catch (err) {
                        console.error('Delete failed:', err);
                    }
                }
            });
        }

        // Clear completed
        const clearBtn = this.container.querySelector('#btn-clear-completed');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const completed = this.taskStore.filterByCompleted(true);
                if (completed.length === 0) {
                    alert('No completed tasks to clear.');
                    return;
                }
                if (confirm(`Delete ${completed.length} completed task(s)?`)) {
                    completed.forEach(task => {
                        try {
                            this.taskStore.delete(task.id);
                        } catch (err) {
                            console.error('Delete failed:', err);
                        }
                    });
                }
            });
        }

        // Templates button
        const templatesBtn = this.container.querySelector('#btn-templates');
        if (templatesBtn) {
            templatesBtn.addEventListener('click', () => {
                let modalContainer = document.querySelector('#template-modal-layer');
                if (!modalContainer) {
                    modalContainer = document.createElement('div');
                    modalContainer.id = 'template-modal-layer';
                    document.body.appendChild(modalContainer);
                }

                new TemplateModal(modalContainer, {
                    taskStore: this.taskStore,
                    onClose: () => {
                        modalContainer.remove();
                    }
                });
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
