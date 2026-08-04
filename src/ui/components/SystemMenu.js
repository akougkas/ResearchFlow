/**
 * SystemMenu - System Configuration & Data Backup Utility
 * Provides Export/Import of Workspace JSON, Markdown Notebook generation, and system settings.
 */

import { ExportImportEngine } from '../../core/exportImport.js';
import { taskStore } from '../../core/taskStore.js';

export class SystemMenu {
    constructor(container, onClose) {
        this.container = container;
        this.onClose = onClose;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="modal-backdrop flex-center full-h full-w z-50 fixed inset-0 bg-dark-overlay">
                <div class="bios-window bg-dark text-main font-mono padding-4 border-thick border-primary shadow-glow max-w-600 full-w relative">
                    <button class="modal-close absolute top-3 right-3 text-muted hover-text-primary text-lg font-mono" id="system-menu-close">✕</button>

                    <div class="bios-header text-center margin-bottom-4 border-bottom-thin padding-bottom-2">
                        <div class="font-head text-primary text-md uppercase tracking-wider">// SYSTEM_CONFIGURATION_UTILITY</div>
                        <div class="text-xs text-muted margin-top-1">RELEASE :: RESEARCHFLOW 1.0.0-ALPHA</div>
                    </div>
                    
                    <div class="bios-content flex-col gap-4">
                        <!-- DATA BACKUP & RESTORE -->
                        <div class="menu-section bg-dim border-thin padding-3">
                            <div class="font-head text-secondary text-xs uppercase margin-bottom-2">// DATA_BACKUP_AND_PORTABILITY</div>
                            <div class="flex-col gap-2">
                                <div class="flex-between align-center">
                                    <span class="text-xs text-muted">Export workspace data (JSON backup)</span>
                                    <button id="btn-export-json" class="btn-tactical text-xs padding-x-2 padding-y-1 text-primary border-thin">[EXPORT JSON]</button>
                                </div>
                                <div class="flex-between align-center">
                                    <span class="text-xs text-muted">Export Research Summary (Markdown)</span>
                                    <button id="btn-export-md" class="btn-tactical text-xs padding-x-2 padding-y-1 text-secondary border-thin">[EXPORT NOTEBOOK]</button>
                                </div>
                                <div class="flex-between align-center margin-top-2 border-top-thin padding-top-2">
                                    <span class="text-xs text-muted">Import workspace data (JSON file)</span>
                                    <label class="btn-tactical text-xs padding-x-2 padding-y-1 text-success border-thin cursor-pointer">
                                        [IMPORT JSON]
                                        <input type="file" id="file-import-json" accept=".json" class="display-none">
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- SYSTEM STORAGE CONTROL -->
                        <div class="menu-section bg-dim border-thin padding-3">
                            <div class="font-head text-alert text-xs uppercase margin-bottom-2">// STORAGE_MANAGEMENT</div>
                            <div class="flex-between align-center">
                                <span class="text-xs text-muted">Purge local workspace state & reset</span>
                                <button id="btn-reset-storage" class="btn-tactical text-xs padding-x-2 padding-y-1 text-alert border-thin">[PURGE ALL DATA]</button>
                            </div>
                        </div>
                    </div>

                    <div class="bios-footer text-center margin-top-4 padding-top-2 border-top-thin text-xs text-muted">
                        RESEARCHFLOW // NEOMODERN CYBERPUNK ARCHITECTURE
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const backdrop = this.container.querySelector('.modal-backdrop');
        const closeBtn = this.container.querySelector('#system-menu-close');
        const exportJsonBtn = this.container.querySelector('#btn-export-json');
        const exportMdBtn = this.container.querySelector('#btn-export-md');
        const importFileInput = this.container.querySelector('#file-import-json');
        const resetStorageBtn = this.container.querySelector('#btn-reset-storage');

        closeBtn.addEventListener('click', () => this.close());
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) this.close();
        });

        exportJsonBtn.addEventListener('click', () => {
            ExportImportEngine.downloadWorkspaceJSON();
        });

        exportMdBtn.addEventListener('click', () => {
            ExportImportEngine.downloadNotebookMarkdown();
        });

        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                const res = ExportImportEngine.importWorkspaceJSON(evt.target.result, false);
                if (res.success) {
                    alert(`SUCCESS: Imported ${res.count} research protocols into workspace.`);
                    this.close();
                } else {
                    alert(`IMPORT ERROR: ${res.error}`);
                }
            };
            reader.readAsText(file);
        });

        resetStorageBtn.addEventListener('click', () => {
            const confirmed = confirm('CRITICAL WARNING:\n\nThis will purge all tasks and reset ResearchFlow to empty state.\nAre you sure?');
            if (confirmed) {
                const current = taskStore.getAll();
                current.forEach(t => taskStore.delete(t.id));
                alert('Storage purged successfully.');
                this.close();
            }
        });

        document.addEventListener('keydown', this.handleKey = (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    close() {
        document.removeEventListener('keydown', this.handleKey);
        this.container.innerHTML = '';
        this.onClose();
    }
}
