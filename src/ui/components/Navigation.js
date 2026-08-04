/**
 * Navigation - Left Navigation Rail Component
 * Switches views (Matrix, Kanban, Timeline, Graph), filters by category, and triggers system/AI modals.
 */

import { CATEGORIES } from '../../config/categories.js';

export class Navigation {
    constructor(container, onNavChange) {
        this.container = container;
        this.onNavChange = onNavChange;
        this.activeId = 'MATRIX';
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="nav-header padding-3 border-bottom-thick border-primary flex-col">
                <div class="flex-between align-center">
                    <div class="text-primary font-head text-lg tracking-wider">R_FLOW</div>
                    <span class="badge border-thin text-xs text-success font-mono">ALPHA</span>
                </div>
                <div class="text-muted font-mono text-xs margin-top-1">RESEARCHFLOW V1.0</div>
            </div>

            <div class="nav-links flex-col gap-2 padding-3 scroll-y flex-grow font-mono text-xs">
                <!-- VIEWS SECTION -->
                <div class="nav-section-label text-muted uppercase margin-bottom-1">
                    // WORKSPACE_VIEWS
                </div>
                <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-main transition-all ${this.activeId === 'MATRIX' ? 'nav-active' : ''}" data-id="MATRIX">
                    <span class="icon text-primary">▦</span>
                    <span class="label font-mono uppercase">MATRIX GRID</span>
                </button>
                <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-main transition-all ${this.activeId === 'KANBAN' ? 'nav-active' : ''}" data-id="KANBAN">
                    <span class="icon text-primary">📋</span>
                    <span class="label font-mono uppercase">KANBAN BOARD</span>
                </button>
                <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-main transition-all ${this.activeId === 'TIMELINE' ? 'nav-active' : ''}" data-id="TIMELINE">
                    <span class="icon text-primary">⏱</span>
                    <span class="label font-mono uppercase">TIMELINE</span>
                </button>
                <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-main transition-all ${this.activeId === 'GRAPH' ? 'nav-active' : ''}" data-id="GRAPH">
                    <span class="icon text-secondary">🕸</span>
                    <span class="label font-mono uppercase">FORCE GRAPH</span>
                </button>

                <!-- AI TOOLS SECTION -->
                <div class="nav-section-label text-muted uppercase margin-top-3 margin-bottom-1">
                    // INTELLIGENCE
                </div>
                <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-primary transition-all hover-glow" data-id="AI_GEN">
                    <span class="icon">🤖</span>
                    <span class="label font-mono uppercase">AI TASK GEN</span>
                </button>
                <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-secondary transition-all hover-glow" data-id="VOICE">
                    <span class="icon">🎙️</span>
                    <span class="label font-mono uppercase">VOICE CAPTURE</span>
                </button>

                <!-- CATEGORIES SECTION -->
                <div class="nav-section-label text-muted uppercase margin-top-3 margin-bottom-1">
                    // DATA_BANKS
                </div>
                ${CATEGORIES.map(cat => this.createCategoryLink(cat)).join('')}
                
                <!-- SYSTEM SECTION -->
                <div class="nav-section-label text-muted uppercase margin-top-3 margin-bottom-1">
                    // SYSTEM
                </div>
                <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-main transition-all" data-id="SETTINGS">
                    <span class="icon">⚙</span>
                    <span class="label font-mono uppercase">SETTINGS / EXPORT</span>
                </button>
            </div>
            
            <div class="nav-footer padding-3 border-top-thin text-center text-muted font-mono text-xs">
                LOCAL_STORAGE // ENCRYPTED
            </div>
        `;

        this.attachEvents();
    }

    createCategoryLink(category) {
        return `
            <button class="nav-item flex align-center gap-2 padding-2 border-thin text-left bg-transparent text-main transition-all ${this.activeId === category.id ? 'nav-active' : ''}" data-id="${category.id}">
                <span class="icon text-secondary">[${category.icon}]</span>
                <span class="label font-mono uppercase">${category.name}</span>
            </button>
        `;
    }

    attachEvents() {
        this.container.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (!id) return;

                if (!['SETTINGS', 'AI_GEN'].includes(id)) {
                    this.activeId = id;
                    this.container.querySelectorAll('.nav-item').forEach(b => b.classList.remove('nav-active'));
                    btn.classList.add('nav-active');
                }

                this.onNavChange(id);
            });
        });
    }
}
