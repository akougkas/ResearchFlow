
export class ContextPanel {
    constructor(container, taskStore) {
        this.container = container;
        this.taskStore = taskStore;
        this.render();
    }

    render() {
        const stats = this.taskStore.getStats();

        this.container.innerHTML = `
            <div class="context-header padding-3 border-bottom-thin">
                <div class="font-head text-secondary text-sm">SYS_DIAGNOSTICS</div>
            </div>

            <div class="context-body padding-3 flex-col gap-4">
                <!-- STATS BLOCK -->
                <div class="stat-block border-thin padding-3 bg-panel">
                    <div class="label text-muted text-xs uppercase margin-bottom-1">Task_Load</div>
                    <div class="value font-head text-lg text-primary">${stats.total}</div>
                    <div class="bar-container margin-top-2 bg-grid" style="height: 4px; width: 100%;">
                        <div class="bar bg-primary" style="height: 100%; width: ${stats.completionRate}%"></div>
                    </div>
                    <div class="sub-label text-right text-xs text-muted margin-top-1">${stats.completionRate}% COMPLETE</div>
                </div>

                <div class="stat-block border-thin padding-3 bg-panel">
                    <div class="label text-muted text-xs uppercase margin-bottom-1">PENDING</div>
                    <div class="value font-head text-lg text-secondary">${stats.pending}</div>
                </div>
                
                <div class="stat-block border-thin padding-3 bg-panel">
                    <div class="label text-muted text-xs uppercase margin-bottom-1">CRITICAL</div>
                    <div class="value font-head text-lg text-alert">${stats.overdue}</div>
                </div>

                <!-- TOOLS -->
                 <div class="tools-section margin-top-4">
                    <div class="font-head text-muted text-xs margin-bottom-2">QUICK_TOOLS</div>
                    <div class="grid-2 gap-2">
                         <button class="btn-tool border-thin padding-2 text-xs font-mono hover-inv text-main full-w">
                            [ EXP_LOG ]
                        </button>
                         <button class="btn-tool border-thin padding-2 text-xs font-mono hover-inv text-main full-w">
                            [ CITATION ]
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}
