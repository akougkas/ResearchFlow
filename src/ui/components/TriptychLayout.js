/**
 * TriptychLayout - Main 3-pane dashboard layout
 * Coordinates Navigation, TaskMatrix (workspace), and ContextPanel
 */

import { Navigation } from './Navigation.js';
import { TaskMatrix } from './TaskMatrix.js';
import { ContextPanel } from './ContextPanel.js';
import { SystemMenu } from './SystemMenu.js';

export class TriptychLayout {
    constructor(container, taskStore) {
        this.container = container;
        this.taskStore = taskStore;
        this.contextPanel = null;
        this.taskMatrix = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="triptych-container full-h full-w">
                <nav id="nav-pane" class="pane-nav flex-col"></nav>
                <main id="workspace-pane" class="pane-workspace relative"></main>
                <aside id="context-pane" class="pane-context flex-col"></aside>
                <div id="modal-container"></div>
            </div>
        `;

        this.initPanes();
    }

    initPanes() {
        const navContainer = this.container.querySelector('#nav-pane');
        const workspaceContainer = this.container.querySelector('#workspace-pane');
        const contextContainer = this.container.querySelector('#context-pane');

        // Initialize Context Panel first (so we can pass callback to TaskMatrix)
        this.contextPanel = new ContextPanel(contextContainer, this.taskStore);

        // Initialize TaskMatrix with task selection callback
        this.taskMatrix = new TaskMatrix(workspaceContainer, this.taskStore, {
            onTaskSelect: (task) => {
                this.contextPanel.setSelectedTask(task);
            }
        });

        // Initialize Navigation
        new Navigation(navContainer, this.handleNavChange.bind(this));
    }

    handleNavChange(viewId) {
        if (viewId === 'SETTINGS') {
            const modalContainer = this.container.querySelector('#modal-container');
            new SystemMenu(modalContainer, () => {
                // On Close - cleanup if needed
            });
            return;
        }

        // Handle view switching (future: Kanban, Timeline, etc.)
        console.log("Switching view to:", viewId);

        // For now, just show a message for unimplemented views
        const unimplemented = ['KANBAN', 'TIMELINE', 'GRAPH'];
        if (unimplemented.includes(viewId)) {
            alert(`${viewId} view coming soon!\n\nCurrently available:\n• Matrix View (default)`);
        }
    }

    destroy() {
        if (this.contextPanel) this.contextPanel.destroy();
        if (this.taskMatrix) this.taskMatrix.destroy();
    }
}
