
export class SystemMenu {
    constructor(container, onClose) {
        this.container = container;
        this.onClose = onClose;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="modal-backdrop flex-center full-h full-w" style="position: fixed; top: 0; left: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); z-index: 100;">
                <div class="bios-window bg-blue text-inv font-mono padding-4 border-thick border-white" style="width: 600px; background: #0000AA; color: white;">
                    <div class="bios-header text-center margin-bottom-4 border-bottom-thin padding-bottom-2">
                        <div class="blink">*** SYSTEM CONFIGURATION UTILITY ***</div>
                        <div class="text-xs margin-top-1">BIOS DATE 10/26/2025 14:22:55 VER 1.0.4</div>
                    </div>
                    
                    <div class="bios-content flex gap-4">
                         <ul class="bios-menu flex-col gap-1 list-none width-30">
                            <li class="selected bg-white text-blue padding-x-2">> SYSTEM_TIME</li>
                            <li class="padding-x-2">  BOOT_SEQ</li>
                            <li class="padding-x-2">  PERIPHERALS</li>
                            <li class="padding-x-2">  POWER_MGMT</li>
                            <li class="padding-x-2 text-muted">  EXIT</li>
                         </ul>

                         <div class="bios-detail width-70 border-left-thin padding-left-4">
                            <div class="flex-col gap-2">
                                <label class="flex-between">
                                    <span>SYSTEM_THEME</span>
                                    <span class="text-yellow">[ CYBER_DARK ]</span>
                                </label>
                                <label class="flex-between">
                                    <span>DATA_SYNC</span>
                                    <span class="text-yellow">[ ENABLED ]</span>
                                </label>
                                <label class="flex-between">
                                    <span>CACHE_CLEAR</span>
                                    <span class="text-yellow">[ PRESS_ENTER ]</span>
                                </label>
                            </div>
                            
                            <div class="bios-help margin-top-6 text-xs text-muted border-top-thin padding-top-2">
                                F1: Help  ESC: Exit  ARROWS: Select
                            </div>
                         </div>
                    </div>

                    <div class="bios-footer text-center margin-top-4 padding-top-2 border-top-thin">
                        (C) 2025 RESEARCH_FLOW INC.
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        // Close on backdrop click or ESC
        this.container.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.close();
            }
        });

        const exitItem = this.container.querySelectorAll('li')[4]; // Quick hack for 'EXIT'
        if (exitItem) {
            exitItem.addEventListener('click', () => this.close());
        }

        document.addEventListener('keydown', this.handleKey.bind(this));
    }

    handleKey(e) {
        if (e.key === 'Escape') {
            this.close();
        }
    }

    close() {
        document.removeEventListener('keydown', this.handleKey.bind(this));
        this.container.innerHTML = '';
        this.onClose();
    }
}
