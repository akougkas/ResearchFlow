/**
 * TaskModal - Neobrutalist modal for task creation/editing
 * Matches the cyberpunk aesthetic of ResearchFlow and supports task dependency selection.
 */

import { CATEGORIES } from '../../config/categories.js';
import { PRIORITIES } from '../../config/priorities.js';

export class TaskModal {
    constructor(container, options = {}) {
        this.container = container;
        this.onSave = options.onSave || (() => {});
        this.onClose = options.onClose || (() => {});
        this.task = options.task || null; // null = create, object = edit
        this.allTasks = options.allTasks || []; // Available tasks for dependencies
        this.render();
    }

    render() {
        const isEdit = !!this.task;
        const title = isEdit ? 'EDIT_PROTOCOL' : 'INIT_NEW_PROTOCOL';

        // Filter out current task from dependency options to prevent self-dependency
        const availableDeps = this.allTasks.filter(t => !isEdit || t.id !== this.task.id);
        const selectedDeps = new Set(this.task?.dependencies || []);

        this.container.innerHTML = `
            <div class="modal-overlay" id="modal-overlay">
                <div class="modal-container" style="max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header border-bottom-thick padding-3">
                        <div class="flex-between align-center">
                            <div class="font-head text-primary text-lg">${title}</div>
                            <button id="modal-close" class="btn-close text-muted font-mono">[ X ]</button>
                        </div>
                        <div class="font-mono text-muted text-xs margin-top-1">
                            // ${isEdit ? 'MODIFY EXISTING PROTOCOL' : 'CREATE NEW RESEARCH TASK'}
                        </div>
                    </div>

                    <form id="task-form" class="modal-body padding-3">
                        <!-- TASK TEXT -->
                        <div class="form-field margin-bottom-3">
                            <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                PROTOCOL_DESC <span class="text-alert">*</span>
                            </label>
                            <input
                                type="text"
                                id="task-text"
                                class="input-field full-w"
                                placeholder="e.g., Analyze RNA-seq differential expression..."
                                maxlength="500"
                                value="${this.escapeHtml(this.task?.text || '')}"
                                required
                            />
                            <div class="text-xs text-muted margin-top-1">
                                <span id="char-count">${this.task?.text?.length || 0}</span>/500
                            </div>
                        </div>

                        <!-- CATEGORY & PRIORITY ROW -->
                        <div class="grid-2 gap-3 margin-bottom-3">
                            <div class="form-field">
                                <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                    CATEGORY
                                </label>
                                <select id="task-category" class="input-field full-w">
                                    ${CATEGORIES.map(cat => `
                                        <option value="${cat.id}" ${this.task?.category === cat.id ? 'selected' : ''}>
                                            ${cat.icon} ${cat.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-field">
                                <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                    PRIORITY
                                </label>
                                <select id="task-priority" class="input-field full-w">
                                    ${PRIORITIES.map(pri => `
                                        <option value="${pri.level}" ${this.task?.priority === pri.level ? 'selected' : ''}>
                                            ${pri.icon} ${pri.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- DUE DATE -->
                        <div class="form-field margin-bottom-3">
                            <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                T-MINUS (DUE DATE)
                            </label>
                            <input
                                type="date"
                                id="task-due-date"
                                class="input-field full-w"
                                value="${this.task?.dueDate || ''}"
                            />
                        </div>

                        <!-- DEPENDENCIES -->
                        ${availableDeps.length > 0 ? `
                        <div class="form-field margin-bottom-3">
                            <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                DEPENDENCIES (PREREQUISITES)
                            </label>
                            <div class="border-thin padding-2 scroll-y bg-dim" style="max-height: 120px;">
                                ${availableDeps.map(dep => `
                                    <label class="flex align-center gap-2 padding-y-1 font-mono text-xs cursor-pointer hover-text-primary">
                                        <input type="checkbox" name="task-deps" value="${dep.id}" ${selectedDeps.has(dep.id) ? 'checked' : ''} />
                                        <span>[${dep.completed ? '✓' : '○'}] ${this.escapeHtml(dep.text.slice(0, 45))}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <!-- NOTES -->
                        <div class="form-field margin-bottom-3">
                            <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                NOTES // [[Task:id]] for links
                            </label>
                            <textarea
                                id="task-notes"
                                class="input-field full-w"
                                rows="3"
                                placeholder="Additional notes, references, or bi-directional links..."
                            >${this.escapeHtml(this.task?.notes || '')}</textarea>
                        </div>

                        <!-- ERROR MESSAGE -->
                        <div id="form-error" class="text-alert text-sm margin-bottom-3 hidden"></div>

                        <!-- ACTIONS -->
                        <div class="modal-footer flex gap-3">
                            <button type="submit" class="btn-tactical text-primary border-thin padding-2 font-mono uppercase flex-grow">
                                [ ${isEdit ? 'UPDATE' : 'CREATE'}_PROTOCOL ]
                            </button>
                            <button type="button" id="modal-cancel" class="btn-tactical text-muted border-thin padding-2 font-mono uppercase">
                                [ ABORT ]
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const overlay = this.container.querySelector('#modal-overlay');
        const closeBtn = this.container.querySelector('#modal-close');
        const cancelBtn = this.container.querySelector('#modal-cancel');
        const form = this.container.querySelector('#task-form');
        const textInput = this.container.querySelector('#task-text');
        const charCount = this.container.querySelector('#char-count');

        // Close handlers
        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        // Escape key
        document.addEventListener('keydown', this.handleEscape = (e) => {
            if (e.key === 'Escape') this.close();
        });

        // Character counter
        textInput.addEventListener('input', () => {
            charCount.textContent = textInput.value.length;
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Focus text input
        textInput.focus();
    }

    handleSubmit() {
        const textInput = this.container.querySelector('#task-text');
        const categoryInput = this.container.querySelector('#task-category');
        const priorityInput = this.container.querySelector('#task-priority');
        const dueDateInput = this.container.querySelector('#task-due-date');
        const notesInput = this.container.querySelector('#task-notes');
        const errorDiv = this.container.querySelector('#form-error');

        // Selected dependencies
        const depCheckboxes = this.container.querySelectorAll('input[name="task-deps"]:checked');
        const dependencies = Array.from(depCheckboxes).map(cb => cb.value);

        // Validation
        const text = textInput.value.trim();
        if (!text) {
            this.showError('Protocol description is required');
            textInput.focus();
            return;
        }

        if (text.length > 500) {
            this.showError('Protocol description must be under 500 characters');
            textInput.focus();
            return;
        }

        // Build task data
        const taskData = {
            text,
            category: categoryInput.value,
            priority: priorityInput.value,
            dueDate: dueDateInput.value || null,
            dependencies: dependencies,
            notes: notesInput.value.trim()
        };

        // If editing, include the ID
        if (this.task) {
            taskData.id = this.task.id;
        }

        // Clear error
        errorDiv.classList.add('hidden');

        // Callback and close
        this.onSave(taskData, !!this.task);
        this.close();
    }

    showError(message) {
        const errorDiv = this.container.querySelector('#form-error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    close() {
        // Remove escape listener
        document.removeEventListener('keydown', this.handleEscape);

        // Clear container
        this.container.innerHTML = '';

        // Callback
        this.onClose();
    }
}
