/**
 * VoiceCaptureModal - Neobrutalist voice capture modal interface
 * Displays live speech-to-text transcription, auto-detected category, and saves tasks.
 */

import { VoiceCaptureEngine } from '../../features/voice-capture.js';
import { CATEGORIES } from '../../config/categories.js';
import { PRIORITIES } from '../../config/priorities.js';

export class VoiceCaptureModal {
    constructor(container, options = {}) {
        this.container = container;
        this.taskStore = options.taskStore;
        this.onClose = options.onClose || (() => {});
        this.engine = new VoiceCaptureEngine();

        this.currentCategory = 'data';
        this.currentPriority = 'normal';
        this.transcript = '';

        this.render();
    }

    render() {
        const isSupported = this.engine.isSupported;

        this.container.innerHTML = `
            <div class="modal-overlay" id="voice-overlay">
                <div class="modal-container max-w-500">
                    <div class="modal-header border-bottom-thick padding-3">
                        <div class="flex-between align-center">
                            <div class="font-head text-primary text-md flex align-center gap-2">
                                <span class="pulse-dot">🎙️</span> VOICE_DICTATION_PROTOCOL
                            </div>
                            <button id="voice-close" class="btn-close text-muted font-mono">[ X ]</button>
                        </div>
                        <div class="font-mono text-muted text-xs margin-top-1">
                            // HANDS-FREE LAB TASK CAPTURE
                        </div>
                    </div>

                    <div class="modal-body padding-4 flex-col gap-4">
                        ${!isSupported ? `
                            <div class="border-thin border-alert padding-3 text-alert font-mono text-xs">
                                ⚠ Web Speech API is not supported in this browser. Please type tasks manually or use Chrome/Edge.
                            </div>
                        ` : ''}

                        <!-- MIC STATUS & CONTROLS -->
                        <div class="flex-between align-center border-thin padding-3 bg-dim">
                            <div class="font-mono text-xs flex align-center gap-2">
                                <span id="mic-status-indicator" class="status-indicator bg-muted"></span>
                                <span id="mic-status-text" class="text-muted uppercase">MIC_IDLE</span>
                            </div>
                            <button id="btn-mic-toggle" class="btn-tactical text-primary border-thin padding-2 font-mono text-xs uppercase" ${!isSupported ? 'disabled' : ''}>
                                [ START RECORDING ]
                            </button>
                        </div>

                        <!-- LIVE TRANSCRIPT -->
                        <div class="form-field">
                            <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                SPOKEN_TRANSCRIPT
                            </label>
                            <textarea
                                id="voice-transcript"
                                class="input-field full-w font-mono text-sm"
                                rows="4"
                                placeholder="Click [START RECORDING] and speak your research task..."
                            ></textarea>
                        </div>

                        <!-- CATEGORY & PRIORITY PREVIEW -->
                        <div class="grid-2 gap-3">
                            <div class="form-field">
                                <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                    DETECTED CATEGORY
                                </label>
                                <select id="voice-category" class="input-field full-w">
                                    ${CATEGORIES.map(cat => `
                                        <option value="${cat.id}">
                                            ${cat.icon} ${cat.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-field">
                                <label class="font-mono text-xs text-muted uppercase margin-bottom-1 block">
                                    PRIORITY
                                </label>
                                <select id="voice-priority" class="input-field full-w">
                                    ${PRIORITIES.map(pri => `
                                        <option value="${pri.level}">
                                            ${pri.icon} ${pri.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <div id="voice-error" class="text-alert font-mono text-xs hidden"></div>

                        <!-- ACTIONS -->
                        <div class="modal-footer flex gap-3">
                            <button id="btn-save-voice" class="btn-tactical text-success border-thin padding-2 font-mono uppercase flex-grow">
                                [ SAVE_VOICE_PROTOCOL ]
                            </button>
                            <button id="btn-cancel-voice" class="btn-tactical text-muted border-thin padding-2 font-mono uppercase">
                                [ CANCEL ]
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const overlay = this.container.querySelector('#voice-overlay');
        const closeBtn = this.container.querySelector('#voice-close');
        const cancelBtn = this.container.querySelector('#btn-cancel-voice');
        const micBtn = this.container.querySelector('#btn-mic-toggle');
        const saveBtn = this.container.querySelector('#btn-save-voice');
        const textarea = this.container.querySelector('#voice-transcript');
        const categorySelect = this.container.querySelector('#voice-category');
        const prioritySelect = this.container.querySelector('#voice-priority');
        const statusIndicator = this.container.querySelector('#mic-status-indicator');
        const statusText = this.container.querySelector('#mic-status-text');
        const errorDiv = this.container.querySelector('#voice-error');

        // Close handlers
        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        // Escape listener
        document.addEventListener('keydown', this.handleEscape = (e) => {
            if (e.key === 'Escape') this.close();
        });

        // Mic toggle
        micBtn.addEventListener('click', () => {
            if (this.engine.isListening) {
                this.engine.stop();
            } else {
                errorDiv.classList.add('hidden');
                this.engine.start(
                    (transcript, autoCat) => {
                        textarea.value = transcript;
                        this.transcript = transcript;
                        if (autoCat) {
                            categorySelect.value = autoCat;
                        }
                    },
                    (err) => {
                        errorDiv.textContent = `Error: ${err}`;
                        errorDiv.classList.remove('hidden');
                    },
                    (isListening) => {
                        if (isListening) {
                            micBtn.textContent = '[ STOP RECORDING ]';
                            micBtn.classList.remove('text-primary');
                            micBtn.classList.add('text-alert');
                            statusIndicator.className = 'status-indicator bg-alert';
                            statusText.textContent = 'LISTENING...';
                            statusText.classList.remove('text-muted');
                            statusText.classList.add('text-alert');
                        } else {
                            micBtn.textContent = '[ START RECORDING ]';
                            micBtn.classList.remove('text-alert');
                            micBtn.classList.add('text-primary');
                            statusIndicator.className = 'status-indicator bg-muted';
                            statusText.textContent = 'MIC_IDLE';
                            statusText.classList.remove('text-alert');
                            statusText.classList.add('text-muted');
                        }
                    }
                );
            }
        });

        // Save
        saveBtn.addEventListener('click', () => {
            const text = textarea.value.trim();
            if (!text) {
                errorDiv.textContent = 'Please record or enter task text.';
                errorDiv.classList.remove('hidden');
                return;
            }

            if (this.taskStore) {
                this.taskStore.create({
                    text: text,
                    category: categorySelect.value,
                    priority: prioritySelect.value,
                    notes: `Captured via Voice Dictation at ${new Date().toLocaleTimeString()}`
                });
            }

            this.close();
        });
    }

    close() {
        if (this.engine) this.engine.stop();
        document.removeEventListener('keydown', this.handleEscape);
        this.container.innerHTML = '';
        this.onClose();
    }
}
