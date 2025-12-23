/**
 * TemplateModal - Modal for selecting and applying workflow templates
 */

import { templateManager } from '../../features/templates/index.js';

export class TemplateModal {
    constructor(container, options = {}) {
        this.container = container;
        this.taskStore = options.taskStore;
        this.onClose = options.onClose || (() => {});
        this.selectedTemplateId = null;
        this.render();
    }

    render() {
        const templates = templateManager.getAll();

        this.container.innerHTML = `
            <div class="modal-overlay" id="template-overlay">
                <div class="modal-container" style="max-width: 640px;">
                    <div class="modal-header border-bottom-thick padding-3">
                        <div class="flex-between align-center">
                            <div class="font-head text-secondary text-lg">TEMPLATE_LIBRARY</div>
                            <button id="modal-close" class="btn-close text-muted font-mono">[ X ]</button>
                        </div>
                        <div class="font-mono text-muted text-xs margin-top-1">
                            // SELECT A RESEARCH WORKFLOW TEMPLATE
                        </div>
                    </div>

                    <div class="modal-body padding-3">
                        ${templates.length === 0 ? `
                            <div class="text-center padding-4 text-muted">
                                No templates available.
                            </div>
                        ` : `
                            <div class="template-list flex-col gap-3">
                                ${templates.map(template => this.renderTemplateCard(template)).join('')}
                            </div>

                            <!-- OPTIONS -->
                            <div class="template-options margin-top-4 padding-top-3 border-top-thin ${this.selectedTemplateId ? '' : 'hidden'}" id="template-options">
                                <div class="font-head text-xs text-muted margin-bottom-2">CONFIGURATION</div>

                                <div class="form-field margin-bottom-3">
                                    <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                        START DATE (T-0)
                                    </label>
                                    <input
                                        type="date"
                                        id="template-start-date"
                                        class="input-field full-w"
                                        value="${new Date().toISOString().split('T')[0]}"
                                    />
                                    <div class="text-xs text-muted margin-top-1">
                                        All task due dates will be calculated from this date
                                    </div>
                                </div>
                            </div>
                        `}
                    </div>

                    <div class="modal-footer padding-3 border-top-thin flex gap-3">
                        <button id="btn-apply" class="btn-tactical text-success border-thin padding-2 font-mono uppercase flex-grow" disabled>
                            [ DEPLOY_TEMPLATE ]
                        </button>
                        <button id="btn-cancel" class="btn-tactical text-muted border-thin padding-2 font-mono uppercase">
                            [ CANCEL ]
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderTemplateCard(template) {
        const isSelected = this.selectedTemplateId === template.id;
        const taskCount = template.tasks.length;
        const duration = template.estimatedDuration;

        return `
            <div class="template-card ${isSelected ? 'selected' : ''}" data-template-id="${template.id}">
                <div class="flex-between align-center margin-bottom-2">
                    <div class="font-head text-main">${template.name}</div>
                    <div class="text-xs font-mono text-secondary">${taskCount} TASKS</div>
                </div>
                <div class="text-sm text-muted margin-bottom-2">${template.description}</div>
                <div class="flex gap-3 text-xs text-muted">
                    <span>📁 ${template.category}</span>
                    <span>⏱ ${duration} days</span>
                </div>
            </div>
        `;
    }

    attachEvents() {
        const overlay = this.container.querySelector('#template-overlay');
        const closeBtn = this.container.querySelector('#modal-close');
        const cancelBtn = this.container.querySelector('#btn-cancel');
        const applyBtn = this.container.querySelector('#btn-apply');
        const templateCards = this.container.querySelectorAll('.template-card');

        // Close handlers
        closeBtn?.addEventListener('click', () => this.close());
        cancelBtn?.addEventListener('click', () => this.close());
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        // Escape key
        document.addEventListener('keydown', this.handleEscape = (e) => {
            if (e.key === 'Escape') this.close();
        });

        // Template selection
        templateCards.forEach(card => {
            card.addEventListener('click', () => {
                this.selectedTemplateId = card.dataset.templateId;

                // Update selection UI
                templateCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                // Show options and enable apply button
                const optionsDiv = this.container.querySelector('#template-options');
                if (optionsDiv) optionsDiv.classList.remove('hidden');
                if (applyBtn) applyBtn.disabled = false;
            });
        });

        // Apply template
        applyBtn?.addEventListener('click', () => this.applyTemplate());
    }

    applyTemplate() {
        if (!this.selectedTemplateId || !this.taskStore) {
            return;
        }

        const startDateInput = this.container.querySelector('#template-start-date');
        const startDate = startDateInput?.value ? new Date(startDateInput.value) : new Date();

        try {
            // Generate tasks from template
            const generatedTasks = templateManager.generateFromTemplate(
                this.selectedTemplateId,
                startDate
            );

            // Create all tasks using bulk creation (handles dependency resolution)
            const createdTasks = this.taskStore.createFromTemplate(generatedTasks);

            const template = templateManager.getById(this.selectedTemplateId);
            alert(`✓ Template deployed!\n\n${template.name}\n${createdTasks.length} tasks created`);

            this.close();
        } catch (err) {
            console.error('Template application failed:', err);
            alert('Failed to apply template: ' + err.message);
        }
    }

    close() {
        document.removeEventListener('keydown', this.handleEscape);
        this.container.innerHTML = '';
        this.onClose();
    }
}
