/**
 * GraphView - Interactive Force Graph View Component
 * Wraps GraphEngine with container sizing, HUD controls, live search, and detail callbacks.
 */

import { GraphEngine } from '../../core/graph/GraphEngine.js';

export class GraphView {
    constructor(container, taskStore, options = {}) {
        this.container = container;
        this.taskStore = taskStore;
        this.onTaskSelect = options.onTaskSelect || (() => {});

        this.graphEngine = null;
        this.resizeObserver = null;

        this.render();
        this.unsubscribe = this.taskStore.subscribe(() => this.updateData());
    }

    render() {
        this.container.innerHTML = `
            <div class="graph-view-container full-h full-w relative flex-col overflow-hidden bg-grid">
                <!-- GRAPH HUD OVERLAY -->
                <div class="graph-hud absolute top-0 left-0 right-0 padding-3 flex-between pointer-events-none z-10">
                    <div class="hud-title">
                        <div class="font-head text-primary text-md uppercase tracking-wider">// GRAPH_INTELLIGENCE</div>
                        <div class="font-mono text-muted text-xs margin-top-1">
                            FORCE_SIMULATION :: DRAG NODES | PAN / ZOOM | CLICK TO SELECT
                        </div>
                    </div>
                    <div class="hud-controls flex gap-2 pointer-events-auto align-center">
                        <input type="text" id="graph-search-input" class="input-tactical text-xs padding-x-2 padding-y-1 font-mono max-w-200" placeholder="Filter nodes...">
                        <button id="graph-reset-btn" class="btn-tactical text-xs padding-x-2 padding-y-1 font-mono">
                            [RESET CAMERA]
                        </button>
                    </div>
                </div>

                <!-- CANVAS ELEMENT -->
                <div class="canvas-wrapper flex-grow relative full-h full-w">
                    <canvas id="graph-canvas" class="full-h full-w block"></canvas>
                </div>
            </div>
        `;

        const canvas = this.container.querySelector('#graph-canvas');
        const wrapper = this.container.querySelector('.canvas-wrapper');

        // Set dimensions
        canvas.width = wrapper.clientWidth || 800;
        canvas.height = wrapper.clientHeight || 600;

        this.graphEngine = new GraphEngine(canvas, {
            onNodeSelect: (task) => this.onTaskSelect(task)
        });

        this.updateData();

        // Handle Window / Container Resize
        this.resizeObserver = new ResizeObserver(() => {
            if (wrapper && canvas && this.graphEngine) {
                const w = wrapper.clientWidth;
                const h = wrapper.clientHeight;
                if (w > 0 && h > 0) {
                    this.graphEngine.resize(w, h);
                }
            }
        });
        this.resizeObserver.observe(wrapper);

        // Search input
        const searchInput = this.container.querySelector('#graph-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (this.graphEngine) {
                    this.graphEngine.setSearchQuery(e.target.value);
                }
            });
        }

        // Reset camera button
        const resetBtn = this.container.querySelector('#graph-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (this.graphEngine) {
                    this.graphEngine.transform = { x: 0, y: 0, scale: 1 };
                }
            });
        }
    }

    updateData() {
        if (this.graphEngine) {
            const tasks = this.taskStore.getAll();
            this.graphEngine.setData(tasks);
        }
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.graphEngine) this.graphEngine.stop();
    }
}
