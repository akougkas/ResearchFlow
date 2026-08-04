/**
 * CommandPaletteModal - Cyberpunk Command Palette & Global Search (Cmd+K / '/')
 * Jump to any task, filter view, or execute system commands instantaneously.
 */

import { getCategoryById } from '../../config/categories.js';

export class CommandPaletteModal {
    constructor(container, options = {}) {
        this.container = container;
        this.taskStore = options.taskStore;
        this.onTaskSelect = options.onTaskSelect || (() => {});
        this.onNavChange = options.onNavChange || (() => {});
        this.onClose = options.onClose || (() => {});

        this.query = '';
        this.selectedIndex = 0;
        this.render();
    }

    render() {
        const allTasks = this.taskStore.getAll();
        const filteredTasks = this.query
            ? this.taskStore.search(this.query)
            : allTasks.slice(0, 10);

        const actions = [
            { id: 'ACT_NEW', label: '+ CREATE NEW TASK PROTOCOL', type: 'action', viewId: 'NEW_TASK' },
            { id: 'ACT_AI', label: '🤖 AI TASK GENERATOR', type: 'action', viewId: 'AI_GEN' },
            { id: 'ACT_VOICE', label: '🎙️ VOICE DICTATION', type: 'action', viewId: 'VOICE' },
            { id: 'ACT_ANALYTICS', label: '📈 PRODUCTIVITY ANALYTICS', type: 'action', viewId: 'ANALYTICS' },
            { id: 'ACT_TEMPLATES', label: '📚 WORKFLOW TEMPLATES', type: 'action', viewId: 'TEMPLATES' },
            { id: 'ACT_MATRIX', label: '▦ SWITCH TO MATRIX VIEW', type: 'action', viewId: 'MATRIX' },
            { id: 'ACT_KANBAN', label: '📋 SWITCH TO KANBAN VIEW', type: 'action', viewId: 'KANBAN' },
            { id: 'ACT_GRAPH', label: '🕸 SWITCH TO FORCE GRAPH', type: 'action', viewId: 'GRAPH' },
            { id: 'ACT_TIMELINE', label: '⏱ SWITCH TO TIMELINE', type: 'action', viewId: 'TIMELINE' },
        ].filter(act => !this.query || act.label.toLowerCase().includes(this.query.toLowerCase()));

        const items = [...actions, ...filteredTasks.map(t => ({ ...t, type: 'task' }))];

        this.container.innerHTML = `
            <div class="modal-overlay" id="cmd-overlay" style="align-items: flex-start; padding-top: 10vh;">
                <div class="modal-container max-w-600 border-thick border-primary bg-dark shadow-glow">
                    <div class="padding-3 border-bottom-thin flex align-center gap-2 bg-dim">
                        <span class="font-head text-primary text-md">⚡</span>
                        <input
                            type="text"
                            id="cmd-input"
                            class="input-field full-w font-mono text-sm border-none bg-transparent"
                            placeholder="Type a task name, search query, or command... (ESC to exit)"
                            value="${this.escapeHtml(this.query)}"
                            autofocus
                        />
                    </div>

                    <div class="cmd-results scroll-y font-mono text-xs padding-2" style="max-height: 350px;">
                        ${items.length === 0 ? `
                            <div class="padding-4 text-center text-muted">// NO MATCHING PROTOCOLS OR COMMANDS</div>
                        ` : items.map((item, idx) => {
                            const isSelected = idx === this.selectedIndex;
                            if (item.type === 'action') {
                                return `
                                    <div class="cmd-item padding-2 border-thin margin-bottom-1 cursor-pointer flex-between ${isSelected ? 'bg-primary text-dark font-bold' : 'hover-bg-dim text-secondary'}" data-idx="${idx}" data-type="action" data-view="${item.viewId}">
                                        <span>${this.escapeHtml(item.label)}</span>
                                        <span class="text-xs opacity-75">SYSTEM_CMD</span>
                                    </div>
                                `;
                            } else {
                                const cat = getCategoryById(item.category);
                                return `
                                    <div class="cmd-item padding-2 border-thin margin-bottom-1 cursor-pointer flex-between ${isSelected ? 'bg-primary text-dark font-bold' : 'hover-bg-dim text-main'}" data-idx="${idx}" data-type="task" data-id="${item.id}">
                                        <div class="flex align-center gap-2 truncate">
                                            <span>[${cat?.icon || '•'}]</span>
                                            <span class="truncate">${this.escapeHtml(item.text)}</span>
                                        </div>
                                        <span class="text-xs ${item.completed ? 'text-success' : 'text-muted'}">${item.completed ? 'DONE' : 'ACTIVE'}</span>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>

                    <div class="padding-2 border-top-thin flex-between text-muted font-mono text-xs bg-dim">
                        <span>NAV: ↑↓ | SELECT: ENTER | EXIT: ESC</span>
                        <span>RESEARCHFLOW CMD_v1.0</span>
                    </div>
                </div>
            </div>
        `;

        this.items = items;
        this.attachEvents();
    }

    attachEvents() {
        const overlay = this.container.querySelector('#cmd-overlay');
        const input = this.container.querySelector('#cmd-input');
        const resultsContainer = this.container.querySelector('.cmd-results');

        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);

            input.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.selectedIndex = 0;
                this.render();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (this.items.length > 0) {
                        this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
                        this.render();
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (this.items.length > 0) {
                        this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
                        this.render();
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeSelection(this.selectedIndex);
                } else if (e.key === 'Escape') {
                    this.close();
                }
            });
        }

        if (resultsContainer) {
            resultsContainer.addEventListener('click', (e) => {
                const itemEl = e.target.closest('.cmd-item');
                if (itemEl) {
                    const idx = parseInt(itemEl.dataset.idx, 10);
                    this.executeSelection(idx);
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }
    }

    executeSelection(idx) {
        const item = this.items[idx];
        if (!item) return;

        if (item.type === 'action') {
            this.onNavChange(item.viewId);
        } else if (item.type === 'task') {
            const task = this.taskStore.getById(item.id);
            if (task) this.onTaskSelect(task);
        }

        this.close();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    close() {
        this.container.innerHTML = '';
        this.onClose();
    }
}
