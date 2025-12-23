import { taskStore } from '../core/taskStore.js';
import { LandingPage } from './components/LandingPage.js';
// Import template registry to register built-in templates
import '../features/templates/index.js';

class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.state = 'LANDING'; // LANDING | DASHBOARD
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.appContainer.innerHTML = ''; // Clear root

        if (this.state === 'LANDING') {
            new LandingPage(this.appContainer, () => {
                this.state = 'DASHBOARD';
                this.render();
            });
        } else if (this.state === 'DASHBOARD') {
            this.renderDashboard();
        }
    }

    renderDashboard() {
        // Placeholder for Triptych Layout
        // new TriptychLayout(this.appContainer, taskStore);
        this.appContainer.innerHTML = `
            <div class="dashboard-loading flex-center full-h full-w font-head text-lg text-primary blink">
                // LOADING MODULES...
            </div>
        `;

        // Simulate load for effect
        setTimeout(() => {
            import('./components/TriptychLayout.js')
                .then(module => {
                    const TriptychLayout = module.TriptychLayout;
                    this.appContainer.innerHTML = ''; // Clear loader
                    new TriptychLayout(this.appContainer, taskStore);
                })
                .catch(err => {
                    console.error("Failed to load dashboard", err);
                    this.appContainer.innerHTML = `<div class="text-alert">CRITICAL ERROR: MODULE FAIL</div>`;
                });
        }, 800);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App;
