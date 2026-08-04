/**
 * TimelineView - Timeline / Schedule UI Component
 * Visualizes tasks chronologically on a schedule matrix.
 */

import { getCategoryById } from '../../config/categories.js';

export class TimelineView {
    constructor(container, taskStore, options = {}) {
        this.container = container;
        this.taskStore = taskStore;
        this.onTaskSelect = options.onTaskSelect || (() => {});

        this.render();
        this.unsubscribe = this.taskStore.subscribe(() => this.render());
    }

    render() {
        const tasks = this.taskStore.getAll();

        // Sort chronologically by due date / creation date
        const sortedTasks = [...tasks].sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : a.createdAt;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : b.createdAt;
            return dateA - dateB;
        });

        this.container.innerHTML = `
            <div class="timeline-container full-h full-w flex-col padding-4 scroll-y">
                <div class="timeline-header flex-between margin-bottom-4 border-bottom-thick border-primary padding-bottom-2">
                    <div>
                        <h2 class="font-head text-primary text-lg">// TIMELINE_CHRONO_MATRIX</h2>
                        <div class="font-mono text-muted text-xs">MILESTONE TRACKER :: CHRONOLOGICAL SEQUENCE</div>
                    </div>
                </div>

                <div class="timeline-body flex-col gap-4 relative padding-left-4 border-left-thick border-primary">
                    ${sortedTasks.map(t => this.renderTimelineItem(t)).join('')}
                    ${sortedTasks.length === 0 ? `<div class="font-mono text-muted text-sm padding-4">// NO TIMELINE DATA</div>` : ''}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderTimelineItem(task) {
        const cat = getCategoryById(task.category);
        const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'OPEN DEADLINE';
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

        return `
            <div class="timeline-item relative padding-3 bg-dim border-thin cursor-pointer hover-border-primary transition-all margin-bottom-2" data-id="${task.id}">
                <div class="timeline-node absolute" style="left: -25px; top: 18px; width: 12px; height: 12px; border-radius: 50%; background: ${task.completed ? '#39FF14' : isOverdue ? '#FF2A2A' : '#00F0FF'}; border: 2px solid #000;"></div>

                <div class="flex-between font-mono text-xs margin-bottom-1">
                    <span class="text-secondary">${cat?.icon || ''} ${task.category.toUpperCase()}</span>
                    <span class="${isOverdue ? 'text-alert font-bold' : 'text-primary'}">${dateStr}</span>
                </div>

                <div class="font-mono text-sm text-main font-bold ${task.completed ? 'strike text-muted' : ''}">
                    ${this.escapeHtml(task.text)}
                </div>

                ${task.dependencies && task.dependencies.length > 0 ? `
                    <div class="font-mono text-xs text-muted margin-top-2">
                        <span>⛓ Prerequisite task IDs: ${task.dependencies.join(', ')}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    attachEvents() {
        this.container.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', () => {
                const taskId = item.dataset.id;
                const task = this.taskStore.getById(taskId);
                this.onTaskSelect(task);
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
