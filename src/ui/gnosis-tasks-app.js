import { icon } from './icons.js';
import { CATEGORIES } from '../config/categories.js';
import { ExportImportEngine } from '../core/exportImport.js';

const VIEWS = {
    focus: { label: 'Focus', icon: 'focus', eyebrow: 'Today', title: 'Move the work forward' },
    tasks: { label: 'All work', icon: 'tasks', eyebrow: 'Workspace', title: 'Research work' },
    board: { label: 'Board', icon: 'board', eyebrow: 'Progress', title: 'Research pipeline' },
    schedule: { label: 'Schedule', icon: 'calendar', eyebrow: 'Timeline', title: 'What is coming' },
};
const META = {
    literature: ['Literature', '#7257a8'],
    experiment: ['Experiment', '#d15b35'],
    data: ['Analysis', '#217a70'],
    writing: ['Writing', '#315b96'],
    funding: ['Funding', '#a36d16'],
    presentation: ['Communication', '#9b4766'],
};
function safe(value = '') {
    const node = document.createElement('div');
    node.textContent = String(value);
    return node.innerHTML;
}
function dateLabel(value, relative = false) {
    if (!value) return 'No date';
    const date = new Date(`${value}T12:00:00`);
    if (!relative) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((date - today) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 1 && days < 7) return `In ${days} days`;
    if (days < -1) return `${Math.abs(days)} days overdue`;
    return dateLabel(value);
}
function stateOf(task, store) {
    if (task.completed) return 'complete';
    if (!store.canComplete(task.id)) return 'blocked';
    if (task.status === 'in-progress') return 'active';
    if (task.status === 'review') return 'review';
    return 'planned';
}

export class GnosisTasksApp {
    constructor(root, store) {
        Object.assign(this, {
            root,
            store,
            view: 'focus',
            query: '',
            category: 'all',
            selectedId: null,
            modalOpen: false,
            editingId: null,
            mobileNavOpen: false,
        });
    }
    mount() {
        this.store.subscribe(() => this.render());
        this.render();
        this.bindKeys();
    }
    render() {
        const config = VIEWS[this.view];
        const tasks = this.filtered();
        this.root.innerHTML = `<div class="app-shell ${this.mobileNavOpen ? 'nav-open' : ''}">${this.sidebar()}<main class="workspace">${this.topbar()}<section class="workspace-content"><header class="page-header"><div><p class="eyebrow">${config.eyebrow}</p><h1>${config.title}</h1><p class="page-summary">${this.summary(tasks)}</p></div><button class="primary-button" data-action="new">${icon('plus', 17)} Add task</button></header>${this.view === 'focus' ? this.focus() : ''}${this.view === 'tasks' ? this.allTasks(tasks) : ''}${this.view === 'board' ? this.board(tasks) : ''}${this.view === 'schedule' ? this.schedule(tasks) : ''}</section></main>${this.selectedId ? this.detail() : ''}${this.modalOpen ? this.modal() : ''}<div class="mobile-scrim" data-action="close-nav"></div></div>`;
        this.bind();
    }
    sidebar() {
        const tasks = this.store.getAll();
        const open = tasks.filter((t) => !t.completed).length;
        return `<aside class="sidebar"><div class="brand"><div class="brand-mark"><span></span><span></span><span></span></div><div><strong>Gnosis</strong><small>Tasks</small></div><button class="icon-button sidebar-close" data-action="close-nav">${icon('close')}</button></div><nav class="primary-nav"><p class="nav-label">Workspace</p>${Object.entries(
            VIEWS,
        )
            .map(
                ([id, v]) =>
                    `<button class="nav-item ${this.view === id ? 'active' : ''}" data-view="${id}">${icon(v.icon)}<span>${v.label}</span>${id === 'tasks' ? `<em>${open}</em>` : ''}</button>`,
            )
            .join(
                '',
            )}</nav><div class="sidebar-section"><p class="nav-label">Research areas</p><button class="area-item ${this.category === 'all' ? 'active' : ''}" data-category="all"><i class="area-dot all"></i>All areas</button>${Object.entries(
            META,
        )
            .map(
                ([id, [label, color]]) =>
                    `<button class="area-item ${this.category === id ? 'active' : ''}" data-category="${id}"><i class="area-dot" style="--dot:${color}"></i>${label}<span>${tasks.filter((t) => t.category === id && !t.completed).length}</span></button>`,
            )
            .join(
                '',
            )}</div><div class="data-actions"><button data-action="export">Export backup</button><button data-action="import">Import</button><input id="backup-file" type="file" accept="application/json" hidden></div><div class="sidebar-footer"><div class="lab-avatar">GR</div><div><strong>Gnosis Research Center</strong><small>Local workspace</small></div>${icon('more')}</div></aside>`;
    }
    topbar() {
        return `<header class="topbar"><button class="icon-button mobile-menu" data-action="open-nav">${icon('menu')}</button><div class="breadcrumbs"><span>Gnosis Research Center</span><b>/</b><strong>Atlas study</strong></div><button class="search-trigger" data-action="search">${icon('search', 16)}<span>Search research work</span><kbd>⌘ K</kbd></button><div class="sync-state"><i></i> Saved locally</div><div class="user-avatar">AK</div></header>`;
    }
    summary(tasks) {
        const open = tasks.filter((t) => !t.completed).length,
            blocked = tasks.filter((t) => stateOf(t, this.store) === 'blocked').length;
        if (this.view === 'focus') return 'A clear view of the work that needs your attention now.';
        if (this.view === 'board')
            return `${open} open items moving through the research pipeline.`;
        if (this.view === 'schedule') return 'Deadlines and milestones across the next four weeks.';
        return `${open} open items${blocked ? ` · ${blocked} blocked by dependencies` : ''}.`;
    }
    focus() {
        const tasks = this.store.getAll(),
            available = tasks.filter((t) => !t.completed && this.store.canComplete(t.id));
        const priority = available.sort((a, b) => this.score(b) - this.score(a)).slice(0, 3),
            complete = tasks.filter((t) => t.completed).length;
        const progress = tasks.length ? Math.round((complete / tasks.length) * 100) : 0,
            blocked = tasks.filter((t) => stateOf(t, this.store) === 'blocked');
        return `<div class="focus-layout"><section class="focus-main"><div class="section-heading"><div><h2>Today’s focus</h2><p>Chosen by urgency, priority, and readiness.</p></div><span>${priority.length} items</span></div><div class="focus-stack">${priority.map((t, i) => this.focusCard(t, i)).join('') || this.empty('Everything is clear', 'Add a task when you are ready to define the next step.')}</div><div class="section-heading upcoming-heading"><div><h2>Waiting on prerequisites</h2><p>Work that unlocks when upstream research is complete.</p></div></div><div class="waiting-list">${
            blocked
                .slice(0, 4)
                .map((t) => this.compact(t))
                .join('') || '<p class="quiet-empty">No blocked work.</p>'
        }</div></section><aside class="insight-panel"><div class="insight-card progress-card"><p class="eyebrow">Study progress</p><div class="progress-number">${progress}<span>%</span></div><div class="progress-track"><i style="width:${progress}%"></i></div><p>${complete} of ${tasks.length} research items complete</p></div><div class="insight-card next-milestone"><p class="eyebrow">Next milestone</p><span class="milestone-date">Oct <strong>04</strong></span><h3>Pilot analysis review</h3><p>Share validated findings and determine whether the study advances.</p><div class="mini-people"><i>AK</i><i>XS</i><i>KL</i><span>3 collaborators</span></div></div><div class="research-note">${icon('flask', 20)}<div><strong>Research pulse</strong><p>${blocked.length} items are waiting on evidence or upstream work.</p></div></div></aside></div>`;
    }
    focusCard(t, i) {
        const [label, color] = META[t.category] || META.data;
        return `<article class="focus-card" data-id="${t.id}"><button class="task-check" data-toggle="${t.id}">${icon('check', 15)}</button><span class="focus-index">0${i + 1}</span><div class="focus-copy"><div class="task-kicker"><i style="--dot:${color}"></i>${label}<span>·</span><b class="priority-${t.priority}">${t.priority}</b></div><h3>${safe(t.text)}</h3><p>${safe(t.notes || 'No research note added yet.')}</p><div class="task-meta"><span class="date-pill ${this.overdue(t) ? 'overdue' : ''}">${dateLabel(t.dueDate, true)}</span>${t.tags
            .slice(0, 2)
            .map((x) => `<span>#${safe(x)}</span>`)
            .join('')}</div></div><button class="open-task">${icon('arrow')}</button></article>`;
    }
    allTasks(tasks) {
        return `<div class="toolbar"><label class="search-field">${icon('search', 17)}<input id="task-search" value="${safe(this.query)}" placeholder="Search titles, notes, or tags"></label><div class="view-count">${tasks.length} items</div></div><section class="task-table"><div class="table-head"><span>Research item</span><span>Area</span><span>Status</span><span>Due</span><span></span></div>${tasks.map((t) => this.row(t)).join('') || this.empty('No matching work', 'Try a different search or research area.')}</section>`;
    }
    row(t) {
        const [label, color] = META[t.category] || META.data,
            s = stateOf(t, this.store);
        return `<article class="task-row ${t.completed ? 'completed' : ''}" data-id="${t.id}"><div class="task-title-cell"><button class="task-check" data-toggle="${t.id}">${t.completed ? icon('check', 14) : ''}</button><div><strong>${safe(t.text)}</strong><small>${t.tags.map((x) => `#${safe(x)}`).join(' · ')}</small></div></div><span class="category-pill"><i style="--dot:${color}"></i>${label}</span><span class="status status-${s}">${s}</span><span class="due-date ${this.overdue(t) ? 'overdue' : ''}">${dateLabel(t.dueDate)}</span><button class="icon-button">${icon('arrow', 17)}</button></article>`;
    }
    board(tasks) {
        const cols = [
            ['planned', 'Planned', 'Ready or waiting'],
            ['active', 'In progress', 'Work underway'],
            ['review', 'In review', 'Needs validation'],
            ['complete', 'Complete', 'Evidence captured'],
        ];
        return `<div class="board">${cols
            .map(([s, l, d]) => {
                const items = tasks.filter((t) =>
                    s === 'planned'
                        ? ['planned', 'blocked'].includes(stateOf(t, this.store))
                        : stateOf(t, this.store) === s,
                );
                return `<section class="board-column"><header><div><h2>${l}</h2><p>${d}</p></div><span>${items.length}</span></header><div class="board-stack">${items.map((t) => this.boardCard(t)).join('') || '<div class="column-empty">No items</div>'}</div></section>`;
            })
            .join('')}</div>`;
    }
    boardCard(t) {
        const [label, color] = META[t.category] || META.data,
            s = stateOf(t, this.store);
        return `<article class="board-card" data-id="${t.id}"><div class="board-card-top"><span><i style="--dot:${color}"></i>${label}</span>${icon('more')}</div><h3>${safe(t.text)}</h3><div class="board-card-bottom"><span class="date-pill ${this.overdue(t) ? 'overdue' : ''}">${dateLabel(t.dueDate, true)}</span>${s === 'blocked' ? '<span class="blocked-label">Blocked</span>' : t.dependencies?.length ? `<span>${icon('link', 14)} ${t.dependencies.length}</span>` : ''}</div></article>`;
    }
    schedule(tasks) {
        const dated = tasks
                .filter((t) => t.dueDate)
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
            groups = new Map();
        dated.forEach((t) => {
            const d = new Date(`${t.dueDate}T12:00:00`),
                k = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k).push(t);
        });
        return `<div class="schedule">${[...groups].map(([m, items]) => `<section class="month-group"><h2>${m}</h2><div>${items.map((t) => this.scheduleItem(t)).join('')}</div></section>`).join('')}</div>`;
    }
    scheduleItem(t) {
        const d = new Date(`${t.dueDate}T12:00:00`),
            [label, color] = META[t.category] || META.data,
            s = stateOf(t, this.store);
        return `<article class="schedule-item ${t.completed ? 'completed' : ''}" data-id="${t.id}"><time><strong>${d.getDate()}</strong><span>${d.toLocaleDateString('en-US', { weekday: 'short' })}</span></time><i class="timeline-dot" style="--dot:${color}"></i><div><span>${label}</span><h3>${safe(t.text)}</h3></div><span class="status status-${s}">${s}</span></article>`;
    }
    compact(t) {
        const unmet = (t.dependencies || [])
            .map((id) => this.store.getById(id))
            .filter((d) => d && !d.completed);
        return `<article class="compact-task" data-id="${t.id}"><span class="lock-mark">${icon('link', 16)}</span><div><strong>${safe(t.text)}</strong><small>Waiting on ${unmet.map((d) => safe(d.text)).join(', ')}</small></div><span>${dateLabel(t.dueDate)}</span></article>`;
    }
    detail() {
        const t = this.store.getById(this.selectedId);
        if (!t) return '';
        const [label, color] = META[t.category] || META.data,
            s = stateOf(t, this.store),
            deps = (t.dependencies || []).map((id) => this.store.getById(id)).filter(Boolean);
        return `<aside class="detail-panel"><header><span>Research item</span><button class="icon-button" data-action="close-detail">${icon('close')}</button></header><div class="detail-body"><div class="detail-category"><i style="--dot:${color}"></i>${label}</div><h2>${safe(t.text)}</h2><div class="detail-actions"><button class="completion-button ${t.completed ? 'done' : ''}" data-toggle="${t.id}">${icon('check', 16)}${t.completed ? 'Completed' : 'Mark complete'}</button><button class="secondary-button" data-action="edit">Edit</button><button class="text-danger" data-action="delete">Delete</button></div><dl class="detail-properties"><div><dt>Status</dt><dd><span class="status status-${s}">${s}</span></dd></div><div><dt>Priority</dt><dd class="capitalize">${t.priority}</dd></div><div><dt>Due date</dt><dd>${dateLabel(t.dueDate, true)}</dd></div></dl><section class="detail-section"><h3>Research note</h3><p>${safe(t.notes || 'No note has been added.')}</p></section><section class="detail-section"><h3>Tags</h3><div class="tag-list">${t.tags.length ? t.tags.map((x) => `<span>#${safe(x)}</span>`).join('') : '<small>No tags</small>'}</div></section><section class="detail-section"><h3>Prerequisites <span>${deps.length}</span></h3>${deps.map((d) => `<div class="dependency"><i class="${d.completed ? 'done' : ''}">${d.completed ? icon('check', 12) : ''}</i><span>${safe(d.text)}</span></div>`).join('') || '<p>No prerequisites. This work is ready.</p>'}</section></div></aside>`;
    }
    modal() {
        const t = this.editingId ? this.store.getById(this.editingId) : null;
        return `<div class="modal-backdrop" data-action="close-modal"><section class="task-modal" data-modal><header><div><p class="eyebrow">${t ? 'Research item' : 'Quick capture'}</p><h2>${t ? 'Edit research work' : 'Add research work'}</h2></div><button class="icon-button" data-action="close-modal">${icon('close')}</button></header><form id="new-task-form"><label class="field"><span>What needs to happen?</span><input name="text" value="${safe(t?.text || '')}" maxlength="500" required autofocus placeholder="e.g. Validate benchmark results"></label><div class="field-grid"><label class="field"><span>Research area</span><select name="category">${CATEGORIES.map((c) => `<option value="${c.id}" ${t?.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label><label class="field"><span>Priority</span><select name="priority">${['normal', 'high', 'critical', 'low'].map((p) => `<option value="${p}" ${t?.priority === p ? 'selected' : ''}>${p[0].toUpperCase() + p.slice(1)}</option>`).join('')}</select></label></div><label class="field"><span>Due date</span><input type="date" name="dueDate" value="${t?.dueDate || ''}"></label><label class="field"><span>Research note</span><textarea name="notes" rows="4" placeholder="Context, acceptance criteria, or evidence to capture">${safe(t?.notes || '')}</textarea></label><footer><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button class="primary-button">${t ? 'Save changes' : 'Add to workspace'}</button></footer></form></section></div>`;
    }
    empty(a, b) {
        return `<div class="empty-state">${icon('flask', 24)}<h3>${a}</h3><p>${b}</p></div>`;
    }
    score(t) {
        return (
            ({ critical: 40, high: 30, normal: 20, low: 10 }[t.priority] || 0) +
            (this.overdue(t) ? 50 : 0)
        );
    }
    overdue(t) {
        return !t.completed && t.dueDate && new Date(`${t.dueDate}T23:59:59`) < new Date();
    }
    filtered() {
        return this.store
            .getAll()
            .filter((t) => this.category === 'all' || t.category === this.category)
            .filter(
                (t) =>
                    !this.query ||
                    `${t.text} ${t.notes} ${t.tags.join(' ')}`
                        .toLowerCase()
                        .includes(this.query.toLowerCase()),
            );
    }
    bind() {
        this.root.querySelectorAll('[data-view]').forEach(
            (b) =>
                (b.onclick = () => {
                    this.view = b.dataset.view;
                    this.mobileNavOpen = false;
                    this.render();
                }),
        );
        this.root.querySelectorAll('[data-category]').forEach(
            (b) =>
                (b.onclick = () => {
                    this.category = b.dataset.category;
                    this.view = 'tasks';
                    this.mobileNavOpen = false;
                    this.render();
                }),
        );
        this.root.querySelectorAll('[data-id]').forEach(
            (n) =>
                (n.onclick = (e) => {
                    if (e.target.closest('[data-toggle]')) return;
                    this.selectedId = n.dataset.id;
                    this.render();
                }),
        );
        this.root.querySelectorAll('[data-toggle]').forEach(
            (b) =>
                (b.onclick = (e) => {
                    e.stopPropagation();
                    this.store.toggleComplete(b.dataset.toggle);
                }),
        );
        this.root.querySelectorAll('[data-action="new"]').forEach(
            (b) =>
                (b.onclick = () => {
                    this.editingId = null;
                    this.modalOpen = true;
                    this.render();
                    setTimeout(() => this.root.querySelector('[autofocus]')?.focus());
                }),
        );
        this.root.querySelectorAll('[data-action="close-modal"]').forEach(
            (n) =>
                (n.onclick = (e) => {
                    if (n.classList.contains('modal-backdrop') && e.target.closest('[data-modal]'))
                        return;
                    this.modalOpen = false;
                    this.editingId = null;
                    this.render();
                }),
        );
        this.root.querySelector('[data-action="close-detail"]')?.addEventListener('click', () => {
            this.selectedId = null;
            this.render();
        });
        this.root.querySelector('[data-action="open-nav"]')?.addEventListener('click', () => {
            this.mobileNavOpen = true;
            this.render();
        });
        this.root.querySelectorAll('[data-action="close-nav"]').forEach(
            (n) =>
                (n.onclick = () => {
                    this.mobileNavOpen = false;
                    this.render();
                }),
        );
        this.root.querySelector('[data-action="search"]')?.addEventListener('click', () => {
            this.view = 'tasks';
            this.render();
            this.root.querySelector('#task-search')?.focus();
        });
        this.root.querySelector('#task-search')?.addEventListener('input', (e) => {
            this.query = e.target.value;
            const p = e.target.selectionStart;
            this.render();
            const i = this.root.querySelector('#task-search');
            i.focus();
            i.setSelectionRange(p, p);
        });
        this.root.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
            this.editingId = this.selectedId;
            this.modalOpen = true;
            this.render();
        });
        this.root.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
            if (window.confirm('Delete this research item?')) {
                this.store.delete(this.selectedId);
                this.selectedId = null;
                this.render();
            }
        });
        this.root
            .querySelector('[data-action="export"]')
            ?.addEventListener('click', () => ExportImportEngine.downloadWorkspaceJSON());
        this.root
            .querySelector('[data-action="import"]')
            ?.addEventListener('click', () => this.root.querySelector('#backup-file').click());
        this.root.querySelector('#backup-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!window.confirm('Replace this workspace with the selected backup?')) return;
            const result = ExportImportEngine.importWorkspaceJSON(await file.text());
            if (!result.success) window.alert(result.error);
        });
        this.root.querySelector('#new-task-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const d = Object.fromEntries(new FormData(e.currentTarget)),
                payload = { ...d, dueDate: d.dueDate || null };
            if (this.editingId) this.store.update(this.editingId, payload);
            else this.store.create(payload);
            this.modalOpen = false;
            this.editingId = null;
            this.view = 'tasks';
            this.render();
        });
    }
    bindKeys() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.view = 'tasks';
                this.render();
                this.root.querySelector('#task-search')?.focus();
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                this.modalOpen = true;
                this.render();
            }
            if (e.key === 'Escape' && (this.modalOpen || this.selectedId)) {
                this.modalOpen = false;
                this.selectedId = null;
                this.render();
            }
        });
    }
}
