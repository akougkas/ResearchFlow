
export class LandingPage {
    constructor(container, onEnter) {
        this.container = container;
        this.onEnter = onEnter;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="landing-container flex-center flex-col full-h full-w">
                <div class="landing-content text-center">
                    <h1 class="logo-text font-head text-huge text-primary glitch-effect" data-text="RESEARCH_FLOW">
                        RESEARCH_FLOW
                    </h1>
                    <div class="separator bg-primary"></div>
                    <p class="font-mono text-main tracking-wide">
                        // NEO-MODERN RESEARCH TERMINAL<br>
                        // V2.0 SYSTEM READY
                    </p>
                    
                    <button id="enter-btn" class="btn-enter font-head text-lg border-thick border-primary text-primary margin-top-4">
                        [ ENTER SYSTEM ]
                    </button>
                    
                    <div class="version-tag font-mono text-muted text-sm">
                        OS: LINUX | KERNEL: ACTIVE
                    </div>
                </div>
                <div class="scanlines"></div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const btn = this.container.querySelector('#enter-btn');
        btn.addEventListener('click', () => {
            // Add exit animation class if desired
            this.onEnter();
        });
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
