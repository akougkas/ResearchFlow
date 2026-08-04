/**
 * TriptychLayout - Main 3-pane dashboard controller
 * Coordinates Navigation, View Switching (Matrix, Kanban, Timeline, Graph), and ContextPanel.
 */

import { Navigation } from './Navigation.js';
import { TaskMatrix } from './TaskMatrix.js';
import { KanbanView } from './KanbanView.js';
import { TimelineView } from './TimelineView.js';
import { GraphView } from './GraphView.js';
import { ContextPanel } from './ContextPanel.js';
import { SystemMenu } from './SystemMenu.js';
import { AITaskModal } from './AITaskModal.js';
import { TemplateModal } from './TemplateModal.js';
import { VoiceCaptureModal } from './VoiceCaptureModal.js';
import { CommandPaletteModal } from './CommandPaletteModal.js';
import { AnalyticsModal } from './AnalyticsModal.js';
import { CATEGORIES } from '../../config/categories.js';

export class TriptychLayout {
    constructor(container, taskStore) {
        this.container = container;
        this.taskStore = taskStore;

        this.currentViewId = 'MATRIX';
        this.activeViewComponent = null;
        this.contextPanel = null;

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="triptych-container full-h full-w">
                <nav id="nav-pane" class="pane-nav flex-col"></nav>
                <main id="workspace-pane" class="pane-workspace relative overflow-hidden"></main>
                <aside id="context-pane" class="pane-context flex-col"></aside>
                <div id="modal-container"></div>
            </div>
        `;

        this.initPanes();
        this.attachGlobalShortcuts();
    }

    initPanes() {
        const navContainer = this.container.querySelector('#nav-pane');
        const contextContainer = this.container.querySelector('#context-pane');

        // Context Panel setup
        this.contextPanel = new ContextPanel(contextContainer, this.taskStore);

        // Navigation setup
        new Navigation(navContainer, (viewId) => this.handleNavChange(viewId));

        // Initial workspace view
        this.switchWorkspaceView('MATRIX');
    }

    attachGlobalShortcuts() {
        document.addEventListener('keydown', this.handleGlobalKeydown = (e) => {
            const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

            // Cmd+K or Ctrl+K -> Command Palette
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.openCommandPalette();
                return;
            }

            // Quick search with '/' key if not inside an input
            if (!isInput && e.key === '/') {
                e.preventDefault();
                this.openCommandPalette();
                return;
            }

            // View switching shortcuts (1: Matrix, 2: Kanban, 3: Timeline, 4: Graph) if not in input
            if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (e.key === '1') this.handleNavChange('MATRIX');
                else if (e.key === '2') this.handleNavChange('KANBAN');
                else if (e.key === '3') this.handleNavChange('TIMELINE');
                else if (e.key === '4') this.handleNavChange('GRAPH');
            }
        });
    }

    openCommandPalette() {
        const modalContainer = this.container.querySelector('#modal-container');
        new CommandPaletteModal(modalContainer, {
            taskStore: this.taskStore,
            onNavChange: (viewId) => {
                if (viewId === 'TEMPLATES') {
                    new TemplateModal(modalContainer, { taskStore: this.taskStore });
                } else if (viewId === 'NEW_TASK') {
                    if (this.activeViewComponent && typeof this.activeViewComponent.openCreateModal === 'function') {
                        this.activeViewComponent.openCreateModal();
                    }
                } else {
                    this.handleNavChange(viewId);
                }
            },
            onTaskSelect: (task) => {
                if (this.contextPanel) {
                    this.contextPanel.setSelectedTask(task);
                }
            }
        });
    }

    handleNavChange(viewId) {
        if (viewId === 'SETTINGS') {
            const modalContainer = this.container.querySelector('#modal-container');
            new SystemMenu(modalContainer, () => {});
            return;
        }

        if (viewId === 'AI_GEN') {
            const modalContainer = this.container.querySelector('#modal-container');
            new AITaskModal(modalContainer, {
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
            return;
        }

        if (viewId === 'VOICE') {
            const modalContainer = this.container.querySelector('#modal-container');
            new VoiceCaptureModal(modalContainer, {
                taskStore: this.taskStore
            });
            return;
        }

        if (viewId === 'ANALYTICS') {
            const modalContainer = this.container.querySelector('#modal-container');
            new AnalyticsModal(modalContainer, {
                taskStore: this.taskStore
            });
            return;
        }

        // Check if category clicked
        const isCategory = CATEGORIES.some(c => c.id === viewId);
        if (isCategory) {
            this.switchWorkspaceView('MATRIX', { categoryFilter: viewId });
            return;
        }

        this.switchWorkspaceView(viewId);
    }

    switchWorkspaceView(viewId, options = {}) {
        const workspaceContainer = this.container.querySelector('#workspace-pane');
        if (!workspaceContainer) return;

        // Cleanup existing view component
        if (this.activeViewComponent && typeof this.activeViewComponent.destroy === 'function') {
            this.activeViewComponent.destroy();
        }

        workspaceContainer.innerHTML = '';
        this.currentViewId = viewId;

        const onTaskSelect = (task) => {
            if (this.contextPanel) {
                this.contextPanel.setSelectedTask(task);
            }
        };

        switch (viewId) {
            case 'KANBAN':
                this.activeViewComponent = new KanbanView(workspaceContainer, this.taskStore, { onTaskSelect });
                break;

            case 'TIMELINE':
                this.activeViewComponent = new TimelineView(workspaceContainer, this.taskStore, { onTaskSelect });
                break;

            case 'GRAPH':
                this.activeViewComponent = new GraphView(workspaceContainer, this.taskStore, { onTaskSelect });
                break;

            case 'MATRIX':
            default:
                this.activeViewComponent = new TaskMatrix(workspaceContainer, this.taskStore, { onTaskSelect });
                if (options.categoryFilter && this.activeViewComponent.currentFilters) {
                    this.activeViewComponent.currentFilters.category = options.categoryFilter;
                    this.activeViewComponent.render();
                }
                break;
        }
    }

    destroy() {
        if (this.handleGlobalKeydown) {
            document.removeEventListener('keydown', this.handleGlobalKeydown);
        }
        if (this.activeViewComponent && typeof this.activeViewComponent.destroy === 'function') {
            this.activeViewComponent.destroy();
        }
        if (this.contextPanel && typeof this.contextPanel.destroy === 'function') {
            this.contextPanel.destroy();
        }
    }
}
