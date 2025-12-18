
import { QueryBuilder } from './QueryBuilder.js';

export class TaskMatrix {
    constructor(container, taskStore) {
        this.container = container;
        this.taskStore = taskStore;
        this.currentFilters = { category: 'ALL', priority: 'ALL' };

        // Subscribe to changes
        this.unsubscribe = this.taskStore.subscribe(() => this.render());
        this.render();
    }

    render() {
        // Apply filters
        let tasks = this.taskStore.getAll();
        if (this.currentFilters.category !== 'ALL') {
            tasks = tasks.filter(t => t.category === this.currentFilters.category);
        }
        if (this.currentFilters.priority !== 'ALL') {
            tasks = tasks.filter(t => t.priority === this.currentFilters.priority);
        }

        this.container.innerHTML = `
            <div class="matrix-header flex-col margin-bottom-4 padding-bottom-2 border-bottom-thick border-primary">
                <div class="flex-between margin-bottom-3">
                    <div>
                        <h2 class="font-head text-primary text-lg">active_protocols</h2>
                        <div class="font-mono text-muted text-sm">// FEED_LIVE :: ${tasks.length} ITEMS</div>
                    </div>
                     <div class="matrix-actions flex gap-2">
                        <button id="add-task-btn" class="btn-tactical text-primary border-thin padding-2 font-mono uppercase">
                            [+ INIT_TASK]
                        </button>
                    </div>
                </div>
                
                <!-- QUERY BUILDER SLOT -->
                <div id="query-builder-slot"></div>
            </div>

            <div class="matrix-grid font-mono text-sm">
                <!-- HEADERS -->
                <div class="matrix-row header text-muted uppercase text-xs border-bottom-thin padding-y-2">
                    <div class="col-status">STS</div>
                    <div class="col-id">ID</div>
                    <div class="col-desc">PROTOCOL_DESC</div>
                    <div class="col-cat">CAT</div>
                    <div class="col-date">T-MINUS</div>
                </div>

                <!-- CONTENT -->
                <div class="matrix-content scroll-y" style="max-height: calc(100vh - 250px);">
                    ${tasks.map(task => this.renderRow(task)).join('')}
                    ${tasks.length === 0 ? '<div class="padding-4 text-muted">// NO DATA FOUND FOR QUERY</div>' : ''}
                </div>
            </div>
            
            <!-- MODAL CONTAINER (For Forms) -->
            <div id="modal-layer"></div>
        `;

        // Initialize Inner Components
        new QueryBuilder(this.container.querySelector('#query-builder-slot'), (filters) => {
            this.currentFilters = filters;
            this.render(); // Re-render with new filters
        });

        this.attachEvents();
    }

    renderRow(task) {
        return `
            <div class="matrix-row item flex align-center border-bottom-thin padding-y-2 hover-bg-dim transition-all" data-id="${task.id}">
                <div class="col-status text-center">
                    <div class="status-indicator ${task.completed ? 'bg-success' : 'bg-primary'}" style="width: 8px; height: 8px; display: inline-block;"></div>
                </div>
                <div class="col-id text-muted text-xs">${task.id.split('_')[2] || 'ERR'}</div>
                <div class="col-desc text-main padding-x-2 flex-grow truncate">${task.text}</div>
                <div class="col-cat text-secondary text-xs uppercase">[${task.category}]</div>
                <div class="col-date text-muted text-xs">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '--'}</div>
            </div>
        `;
    }

    attachEvents() {
        const addBtn = this.container.querySelector('#add-task-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                alert('INITIATE TASK CREATION PROTOCOL...');
                // TODO: Open Modal
            });
        }
    }
}
