
export class QueryBuilder {
    constructor(container, onFilterChange) {
        this.container = container;
        this.onFilterChange = onFilterChange;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="query-interface flex align-center gap-2 font-mono text-sm padding-bottom-2">
                <span class="keyword text-secondary">QUERY:</span>
                
                <div class="query-segment flex align-center gap-1 bg-panel padding-x-2 border-thin">
                    <span class="var text-muted">category</span>
                    <span class="op text-adv">==</span>
                    <select id="filter-cat" class="bg-transparent border-none text-primary focus-none">
                        <option value="ALL">ALL</option>
                        <option value="data">DATA_ANALYSIS</option>
                        <option value="experiment">EXPERIMENT</option>
                        <option value="writing">WRITING</option>
                        <option value="funding">FUNDING</option>
                    </select>
                </div>
                
                <span class="logic text-muted">AND</span>

                <div class="query-segment flex align-center gap-1 bg-panel padding-x-2 border-thin">
                    <span class="var text-muted">priority</span>
                    <span class="op text-adv">>=</span>
                     <select id="filter-prio" class="bg-transparent border-none text-primary focus-none">
                        <option value="ALL">ANY</option>
                        <option value="critical">CRITICAL</option>
                        <option value="high">HIGH</option>
                        <option value="normal">NORMAL</option>
                    </select>
                </div>

                <button id="run-query" class="btn-run margin-left-2 text-xs border-thin padding-x-2 hover-inv">
                    [ EXECUTE ]
                </button>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const catSelect = this.container.querySelector('#filter-cat');
        const prioSelect = this.container.querySelector('#filter-prio');
        const runBtn = this.container.querySelector('#run-query');

        runBtn.addEventListener('click', () => {
            this.onFilterChange({
                category: catSelect.value,
                priority: prioSelect.value
            });

            // Visual feedback
            runBtn.textContent = "[ EXECUTING... ]";
            setTimeout(() => runBtn.textContent = "[ EXECUTE ]", 500);
        });
    }
}
