/**
 * AnalyticsModal - Real-Time Scientific Productivity & Bottleneck Dashboard
 * Visualizes category distribution, protocol completion velocity, and dependency bottlenecks.
 */

import { getCategoryById } from '../../config/categories.js';

export class AnalyticsModal {
    constructor(container, options = {}) {
        this.container = container;
        this.taskStore = options.taskStore;
        this.onClose = options.onClose || (() => {});
        this.render();
    }

    render() {
        const tasks = this.taskStore.getAll();
        const stats = this.taskStore.getStats();

        // 1. Bottleneck protocols (tasks that block the highest number of other tasks)
        const bottleneckMap = tasks.map(t => {
            const dependents = this.taskStore.getDependentTasks(t.id);
            return { task: t, dependentCount: dependents.length };
        }).filter(b => b.dependentCount > 0 && !b.task.completed)
          .sort((a, b) => b.dependentCount - a.dependentCount);

        // 2. Category distribution & completion rate
        const categories = ['data', 'experiment', 'writing', 'funding', 'presentation', 'literature'];
        const categoryData = categories.map(catId => {
            const catInfo = getCategoryById(catId);
            const catTasks = tasks.filter(t => t.category === catId);
            const completedCount = catTasks.filter(t => t.completed).length;
            const rate = catTasks.length > 0 ? ((completedCount / catTasks.length) * 100).toFixed(0) : 0;
            return {
                id: catId,
                name: catInfo?.name || catId,
                icon: catInfo?.icon || '•',
                color: catInfo?.color || '#3b82f6',
                total: catTasks.length,
                completed: completedCount,
                rate: rate
            };
        }).filter(c => c.total > 0);

        this.container.innerHTML = `
            <div class="modal-overlay" id="analytics-overlay">
                <div class="modal-container max-w-700 border-thick border-primary bg-dark shadow-glow scroll-y" style="max-height: 90vh;">
                    <div class="modal-header border-bottom-thick padding-3 flex-between align-center">
                        <div>
                            <div class="font-head text-primary text-lg flex align-center gap-2">
                                <span>📈</span> RESEARCH_ANALYTICS // PRODUCTIVITY_MATRIX
                            </div>
                            <div class="font-mono text-muted text-xs margin-top-1">
                                REAL-TIME METRICS & DEPENDENCY BOTTLENECK ANALYSIS
                            </div>
                        </div>
                        <button id="analytics-close" class="btn-close text-muted font-mono">[ X ]</button>
                    </div>

                    <div class="modal-body padding-4 flex-col gap-4">
                        <!-- KPI STATS CARDS -->
                        <div class="grid-4 gap-3 font-mono">
                            <div class="border-thin padding-3 bg-dim text-center">
                                <div class="text-xs text-muted uppercase">TOTAL PROTOCOLS</div>
                                <div class="font-head text-xl text-primary margin-y-1">${stats.total}</div>
                                <div class="text-xs text-muted">Tracked</div>
                            </div>
                            <div class="border-thin padding-3 bg-dim text-center">
                                <div class="text-xs text-muted uppercase">COMPLETED</div>
                                <div class="font-head text-xl text-success margin-y-1">${stats.completed}</div>
                                <div class="text-xs text-success">${stats.completionRate}% Done</div>
                            </div>
                            <div class="border-thin padding-3 bg-dim text-center">
                                <div class="text-xs text-muted uppercase">ACTIVE PENDING</div>
                                <div class="font-head text-xl text-secondary margin-y-1">${stats.pending}</div>
                                <div class="text-xs text-secondary">In Flight</div>
                            </div>
                            <div class="border-thin padding-3 bg-dim text-center">
                                <div class="text-xs text-muted uppercase">CRITICAL / OVERDUE</div>
                                <div class="font-head text-xl text-alert margin-y-1">${stats.overdue}</div>
                                <div class="text-xs text-alert">${stats.blocked} Blocked</div>
                            </div>
                        </div>

                        <!-- DEPENDENCY BOTTLENECKS SECTION -->
                        <div class="border-thin padding-3 bg-dim">
                            <div class="font-head text-secondary text-sm margin-bottom-2 flex align-center gap-2">
                                <span>🔒</span> DEPENDENCY_BOTTLENECK_ANALYSIS
                            </div>
                            ${bottleneckMap.length === 0 ? `
                                <div class="font-mono text-xs text-muted padding-2">// NO ACTIVE DEPENDENCY BOTTLENECKS DETECTED.</div>
                            ` : `
                                <div class="flex-col gap-2 font-mono text-xs">
                                    ${bottleneckMap.slice(0, 5).map(b => `
                                        <div class="flex-between align-center border-bottom-thin padding-y-2">
                                            <div class="flex align-center gap-2 truncate">
                                                <span class="text-alert font-bold">[BLOCKS ${b.dependentCount} PROTOCOL(S)]</span>
                                                <span class="text-main truncate">${this.escapeHtml(b.task.text)}</span>
                                            </div>
                                            <span class="text-secondary uppercase text-xs">[${b.task.category}]</span>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>

                        <!-- CATEGORY BREAKDOWN BARS -->
                        <div class="border-thin padding-3 bg-dim">
                            <div class="font-head text-primary text-sm margin-bottom-3 flex align-center gap-2">
                                <span>📊</span> CATEGORY_LOAD_&_VELOCITY
                            </div>
                            <div class="flex-col gap-3 font-mono text-xs">
                                ${categoryData.map(c => `
                                    <div class="flex-col gap-1">
                                        <div class="flex-between">
                                            <span>${c.icon} ${c.name.toUpperCase()} (${c.completed}/${c.total})</span>
                                            <span class="text-secondary">${c.rate}%</span>
                                        </div>
                                        <div class="bg-dark border-thin" style="height: 8px; width: 100%;">
                                            <div style="height: 100%; width: ${c.rate}%; background-color: ${c.color}; transition: width 0.4s;"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- FOOTER -->
                        <div class="modal-footer flex-end">
                            <button id="analytics-ok" class="btn-tactical text-primary border-thin padding-2 font-mono uppercase">
                                [ CLOSE_DIAGNOSTICS ]
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const overlay = this.container.querySelector('#analytics-overlay');
        const closeBtn = this.container.querySelector('#analytics-close');
        const okBtn = this.container.querySelector('#analytics-ok');

        const close = () => {
            document.removeEventListener('keydown', this.handleEscape);
            this.container.innerHTML = '';
            this.onClose();
        };

        if (closeBtn) closeBtn.addEventListener('click', close);
        if (okBtn) okBtn.addEventListener('click', close);
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close();
            });
        }

        document.addEventListener('keydown', this.handleEscape = (e) => {
            if (e.key === 'Escape') close();
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
}
