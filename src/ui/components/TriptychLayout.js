
import { Navigation } from './Navigation.js';
import { TaskMatrix } from './TaskMatrix.js';
import { ContextPanel } from './ContextPanel.js';
import { SystemMenu } from './SystemMenu.js';

export class TriptychLayout {
    constructor(container, taskStore) {
        this.container = container;
        this.taskStore = taskStore;
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

        // Initialize Components
        new Navigation(navContainer, this.handleNavChange.bind(this));
        new TaskMatrix(workspaceContainer, this.taskStore);
        new ContextPanel(contextContainer, this.taskStore);
    }

    handleNavChange(viewId) {
        if (viewId === 'SETTINGS') {
            const modalContainer = this.container.querySelector('#modal-container');
            new SystemMenu(modalContainer, () => {
                // On Close
            });
            return;
        }

        console.log("Switching view to:", viewId);
        // Dispatch event or call method on Workspace
    }
}
