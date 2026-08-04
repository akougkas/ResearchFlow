import { taskStore } from '../core/taskStore.js';
import { LandingPage } from './components/LandingPage.js';
import { TriptychLayout } from './components/TriptychLayout.js';
import '../features/templates/index.js';

class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.state = 'DASHBOARD'; // Default to DASHBOARD for instant access
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.render();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/public/sw.js')
                    .then(reg => console.log('ResearchFlow SW registered:', reg.scope))
                    .catch(err => console.log('SW registration failed:', err));
            });
        }
    }

    render() {
        this.appContainer.innerHTML = ''; // Clear root

        if (this.state === 'LANDING') {
            new LandingPage(this.appContainer, () => {
                this.state = 'DASHBOARD';
                this.render();
            });
        } else if (this.state === 'DASHBOARD') {
            new TriptychLayout(this.appContainer, taskStore);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App;
