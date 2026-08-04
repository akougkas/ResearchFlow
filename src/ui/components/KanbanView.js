/**
 * KanbanView - Kanban Board UI Component
 * Visualizes tasks across pipeline stages with quick status transitions.
 */

import { getCategoryById } from '../../config/categories.js';
import { getPriorityByLevel } from '../../config/priorities.js';

export class KanbanView {
    constructor(container, taskStore, options = {}) {
        this.container = container;
        this.taskStore = taskStore;
        this.onTaskSelect = options.onTaskSelect || (() => {});

        this.render();
        this.unsubscribe = this.taskStore.subscribe(() => this.render());
    }

    render() {
        const tasks = this.taskStore.getAll();

        // Categorize into columns
        const columns = [
            {
                id: 'critical',
                title: 'CRITICAL & OVERDUE',
                badgeClass: 'border-alert text-alert',
                tasks: tasks.filter(t => !t.completed && (t.priority === 'critical' || (t.dueDate && new Date(t.dueDate) < new Date())))
            },
            {
                id: 'active',
                title: 'IN PROGRESS',
                badgeClass: 'border-primary text-primary',
                tasks: tasks.filter(t => !t.completed && t.priority !== 'critical' && (!t.dueDate || new Date(t.dueDate) >= new Date()))
            },
            {
                id: 'completed',
                title: 'VERIFIED & COMPLETE',
                badgeClass: 'border-success text-success',
                tasks: tasks.filter(t => t.completed)
            }
        ];

        this.container.innerHTML = `
            <div class="kanban-container full-h full-w flex-col padding-4 scroll-x">
                <div class="kanban-header flex-between margin-bottom-4 border-bottom-thick border-primary padding-bottom-2">
                    <div>
                        <h2 class="font-head text-primary text-lg">// KANBAN_WORKFLOW_BOARD</h2>
                        <div class="font-mono text-muted text-xs">PIPELINE VIEW :: ${tasks.length} PROTOCOLS TRACKED</div>
                    </div>
                </div>

                <div class="kanban-columns flex gap-4 flex-grow full-h" style="min-height: 500px;">
                    ${columns.map(col => this.renderColumn(col)).join('')}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderColumn(col) {
        return `
            <div class="kanban-col flex-1 flex-col bg-dim border-thin padding-3 min-w-300" data-col="${col.id}">
                <div class="col-header flex-between margin-bottom-3 border-bottom-thin padding-bottom-2">
                    <span class="font-head text-sm ${col.badgeClass}">${col.title}</span>
                    <span class="font-mono text-xs border-thin padding-x-2 bg-dark">${col.tasks.length}</span>
                </div>

                <div class="col-cards flex-col gap-3 scroll-y flex-grow" style="max-height: calc(100vh - 260px);">
                    ${col.tasks.map(t => this.renderCard(t)).join('')}
                    ${col.tasks.length === 0 ? `<div class="text-center font-mono text-muted text-xs padding-4 border-thin border-dashed">// EMPTY_COLUMN</div>` : ''}
                </div>
            </div>
        `;
    }

    renderCard(task) {
        const cat = getCategoryById(task.category);
        const prio = getPriorityByLevel(task.priority);

        return `
            <div class="kanban-card bg-dark border-thin padding-3 cursor-pointer hover-border-primary transition-all flex-col gap-2 relative" data-id="${task.id}">
                <div class="flex-between text-xs font-mono">
                    <span class="text-secondary">${cat?.icon || ''} ${task.category.toUpperCase()}</span>
                    <span class="text-muted" style="color: ${prio?.color || '#FFF'}">${prio?.icon || ''} ${task.priority}</span>
                </div>

                <div class="font-mono text-sm text-main font-bold truncate-2">
                    ${this.escapeHtml(task.text)}
                </div>

                ${task.notes ? `<div class="font-mono text-xs text-muted truncate">${this.escapeHtml(task.notes)}</div>` : ''}

                <div class="flex-between margin-top-2 border-top-thin padding-top-2 text-xs font-mono">
                    <span class="text-muted">${task.dueDate ? `DUE: ${task.dueDate}` : 'NO DUE DATE'}</span>
                    <button class="btn-toggle-status text-xs padding-x-2 border-thin ${task.completed ? 'text-alert' : 'text-success'}" data-action="toggle">
                        ${task.completed ? '[REOPEN]' : '[COMPLETE]'}
                    </button>
                </div>
            </div>
        `;
    }

    attachEvents() {
        this.container.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const taskId = card.dataset.id;
                const toggleBtn = e.target.closest('[data-action="toggle"]');

                if (toggleBtn) {
                    e.stopPropagation();
                    this.taskStore.toggleComplete(taskId);
                } else {
                    const task = this.taskStore.getById(taskId);
                    this.onTaskSelect(task);
                }
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
