import { taskStore } from '../core/taskStore.js';
import { seedDemoWorkspace } from '../data/demo-workspace.js';
import { GnosisTasksApp } from './gnosis-tasks-app.js';

if (new URLSearchParams(window.location.search).has('demo')) seedDemoWorkspace(taskStore);

new GnosisTasksApp(document.querySelector('#app'), taskStore).mount();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(new URL('../../sw.js', import.meta.url))
            .catch((error) => console.warn('Offline support unavailable:', error));
    });
}
