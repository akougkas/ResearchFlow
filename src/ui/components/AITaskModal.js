/**
 * AITaskModal - AI-Assisted Research Task Generator Modal
 * Enables natural language task decomposition & preset academic template injection.
 */

import { TaskBreakdownEngine } from '../../features/ai/TaskBreakdownEngine.js';

export class AITaskModal {
    constructor(container, options = {}) {
        this.container = container;
        this.onConfirm = options.onConfirm || (() => {});
        this.generatedTasks = [];

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="modal-overlay flex-center fade-in z-50">
                <div class="modal-box bg-dark border-thick border-primary padding-4 max-w-650 full-w relative shadow-glow">
                    <button class="modal-close absolute top-3 right-3 text-muted hover-text-primary text-lg font-mono" id="ai-modal-close">✕</button>

                    <div class="modal-header margin-bottom-4 border-bottom-thin padding-bottom-2">
                        <div class="font-head text-primary text-lg flex align-center gap-2">
                            <span>🤖</span>
                            <span>AI_RESEARCH_TASK_GENERATOR</span>
                        </div>
                        <div class="font-mono text-muted text-xs margin-top-1">
                            Enter a high-level scientific objective or select a preset research template.
                        </div>
                    </div>

                    <!-- PROMPT INPUT SECTION -->
                    <div class="prompt-section margin-bottom-4 flex-col gap-2">
                        <label class="font-mono text-xs text-secondary uppercase">// RESEARCH OBJECTIVE PROMPT</label>
                        <div class="flex gap-2">
                            <input type="text" id="ai-prompt-input" class="input-tactical flex-grow font-mono text-sm padding-2" placeholder="e.g. Conduct RNA-Seq data pipeline for mouse brain samples...">
                            <button id="btn-generate-ai" class="btn-tactical text-primary border-thin padding-2 font-mono uppercase">
                                [GENERATE]
                            </button>
                        </div>
                    </div>

                    <!-- PRESETS -->
                    <div class="presets-section margin-bottom-4">
                        <label class="font-mono text-xs text-muted uppercase margin-bottom-2 block">// PRESET ACADEMIC WORKFLOWS</label>
                        <div class="preset-grid grid-2 gap-2">
                            ${TaskBreakdownEngine.TEMPLATES.map(tpl => `
                                <button class="btn-preset bg-dim border-thin padding-2 text-left hover-border-primary transition-all font-mono text-xs flex-col gap-1" data-tpl="${tpl.id}">
                                    <div class="flex align-center gap-2 font-bold text-main">
                                        <span>${tpl.icon}</span>
                                        <span>${tpl.title}</span>
                                    </div>
                                    <div class="text-muted text-xs truncate">${tpl.description}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- PREVIEW SECTION -->
                    <div id="ai-preview-section" class="preview-section margin-bottom-4 display-none border-top-thin padding-top-3">
                        <div class="font-mono text-xs text-success uppercase margin-bottom-2 flex-between">
                            <span>// GENERATED PROTOCOL STEPS (<span id="preview-count">0</span>)</span>
                            <span class="text-muted">Target Timeline: ~<span id="preview-days">0</span> Days</span>
                        </div>
                        <div id="preview-list" class="preview-list flex-col gap-2 scroll-y max-h-200 padding-right-1"></div>
                    </div>

                    <!-- ACTIONS -->
                    <div class="modal-actions flex-end gap-3 border-top-thin padding-top-3">
                        <button id="ai-cancel-btn" class="btn-tactical text-muted border-thin padding-2 font-mono uppercase">[CANCEL]</button>
                        <button id="ai-inject-btn" class="btn-tactical text-primary border-thin padding-2 font-mono uppercase opacity-50 pointer-events-none">[INJECT INTO WORKSPACE]</button>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const closeBtn = this.container.querySelector('#ai-modal-close');
        const cancelBtn = this.container.querySelector('#ai-cancel-btn');
        const promptInput = this.container.querySelector('#ai-prompt-input');
        const generateBtn = this.container.querySelector('#btn-generate-ai');
        const injectBtn = this.container.querySelector('#ai-inject-btn');

        const closeModal = () => {
            this.container.innerHTML = '';
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        generateBtn.addEventListener('click', () => {
            const prompt = promptInput.value.trim();
            if (prompt) {
                const tasks = TaskBreakdownEngine.parsePrompt(prompt);
                this.displayPreview(tasks);
            }
        });

        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                generateBtn.click();
            }
        });

        // Preset templates
        this.container.querySelectorAll('.btn-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const tplId = btn.dataset.tpl;
                const template = TaskBreakdownEngine.TEMPLATES.find(t => t.id === tplId);
                if (template) {
                    this.displayPreview(template.tasks);
                }
            });
        });

        injectBtn.addEventListener('click', () => {
            if (this.generatedTasks.length > 0) {
                this.onConfirm(this.generatedTasks);
                closeModal();
            }
        });
    }

    displayPreview(tasks) {
        this.generatedTasks = tasks;
        const previewSection = this.container.querySelector('#ai-preview-section');
        const previewList = this.container.querySelector('#preview-list');
        const previewCount = this.container.querySelector('#preview-count');
        const previewDays = this.container.querySelector('#preview-days');
        const injectBtn = this.container.querySelector('#ai-inject-btn');

        previewCount.textContent = tasks.length;
        const maxDays = Math.max(...tasks.map(t => t.offsetDays || 0), 0);
        previewDays.textContent = maxDays;

        previewList.innerHTML = tasks.map((t, idx) => `
            <div class="preview-item bg-dim border-thin padding-2 font-mono text-xs flex-between">
                <div class="flex align-center gap-2">
                    <span class="text-primary font-bold">#${idx + 1}</span>
                    <span class="text-main">${t.text}</span>
                </div>
                <div class="flex gap-2 text-muted">
                    <span class="text-secondary">[${t.category}]</span>
                    <span>T+${t.offsetDays || 0}d</span>
                </div>
            </div>
        `).join('');

        previewSection.classList.remove('display-none');
        injectBtn.classList.remove('opacity-50', 'pointer-events-none');
    }
}
