
import { CATEGORIES } from '../../config/categories.js';

export class Navigation {
    constructor(container, onNavChange) {
        this.container = container;
        this.onNavChange = onNavChange;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="nav-header padding-3 border-bottom-thick">
                <div class="text-primary font-head text-lg tracking-wider">R_FLOW</div>
                <div class="text-muted font-mono text-sm margin-top-1">V2.0.4</div>
            </div>

            <div class="nav-links flex-col gap-2 padding-3 scroll-y flex-grow">
                <div class="nav-section-label text-muted font-mono text-xs uppercase margin-bottom-2">
                    // DATA_BANKS
                </div>
                ${CATEGORIES.map(cat => this.createNavLink(cat)).join('')}
                
                <div class="nav-section-label text-muted font-mono text-xs uppercase margin-top-4 margin-bottom-2">
                    // SYSTEM
                </div>
                <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-main transition-all" data-id="SETTINGS">
                    <span class="icon">⚙</span>
                    <span class="label font-mono">SETTINGS</span>
                </button>
            </div>
            
            <div class="nav-footer padding-3 border-top-thin text-center text-muted font-mono text-xs">
                SECURE_CONN
            </div>
        `;

        this.attachEvents();
    }

    createNavLink(category) {
        return `
            <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-main transition-all" data-id="${category.id}">
                <span class="icon text-secondary">[${category.icon}]</span>
                <span class="label font-mono uppercase">${category.name}</span>
            </button>
        `;
    }

    attachEvents() {
        this.container.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.dataset.id;
                if (id) this.onNavChange(id);

                // Active state logic
                this.container.querySelectorAll('.nav-item').forEach(b => {
                    b.classList.remove('nav-active');
                    b.style.background = 'transparent';
                    b.style.color = 'var(--text-main)';
                });
                btn.classList.add('nav-active');
                btn.style.background = 'var(--category-color, rgba(243, 249, 26, 0.1))';
                btn.style.color = 'var(--color-primary)';
                btn.style.borderColor = 'var(--color-primary)';
            });
        });
    }
}
