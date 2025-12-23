# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ResearchFlow is a vanilla JavaScript research task manager with a neobrutalist/cyberpunk UI. It uses zero build tools—pure ES6 modules served directly via a local HTTP server.

## Development Commands

```bash
# Start development server
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

No npm, no bundler, no build step. Files are served directly.

## Architecture

### State Management (Observer Pattern)
The app uses a custom observer pattern centered on `taskStore`:

```javascript
// Components subscribe to state changes
const unsubscribe = taskStore.subscribe((tasks) => this.render());

// Store notifies all subscribers on changes
taskStore.save();  // triggers notify() → all subscribers re-render
```

Key files:
- `src/core/taskStore.js` - Central state with CRUD, filtering, sorting, dependency validation
- `src/core/storage.js` - Versioned localStorage wrapper (keys prefixed `rf.`)
- `src/core/data-models.js` - Task and Project classes with validation

### UI Layer
- `src/ui/app.js` - Entry point, manages LANDING/DASHBOARD states, imports template registry
- `src/ui/components/TriptychLayout.js` - Main dashboard with 3-pane layout (nav, workspace, context)
- `src/ui/components/TaskMatrix.js` - Primary task grid with row actions (toggle, edit, delete)
- `src/ui/components/TaskModal.js` - Modal for creating/editing tasks
- `src/ui/components/ContextPanel.js` - Side panel for stats and selected task details
- `src/ui/components/TemplateModal.js` - Modal for applying workflow templates
- `src/ui/components/Navigation.js` - Left navigation
- `src/ui/components/QueryBuilder.js` - Filter controls

### Data Layer (IndexedDB - Not Yet Integrated)
- `src/data/Database.js` - Main orchestrator with migration support
- `src/data/db/IndexedDBAdapter.js` - Low-level IndexedDB wrapper
- `src/data/repositories/` - Repository pattern for each entity type

Note: The IndexedDB data layer is defined but not yet integrated. The app currently uses localStorage via `src/core/storage.js`.

### Research Templates
Pre-built workflow templates in `src/features/templates/`:
- `index.js` - Registry that auto-registers built-in templates on import
- `template-engine.js` - Template class and TemplateManager
- `paper-submission.js` - 18-task paper workflow (40 days)
- `grant-proposal.js` - 31-task grant workflow (90 days)
- `experiment-cycle.js` - 30-task experiment workflow (30 days)

Templates are registered automatically when `src/ui/app.js` imports the template index.

### Event Delegation Pattern
UI uses event delegation via `src/utils/dom.js`:

```javascript
import { delegate } from '../utils/dom.js';
delegate(container, 'click', '.btn-delete', (event, target) => {
    const taskId = target.closest('.task-card').dataset.taskId;
    // handle delete
});
```

## Task Dependencies

Tasks support dependencies with circular dependency detection:
- `task.dependencies` - Array of task IDs this task depends on
- `taskStore.canComplete(taskId)` - Check if all dependencies are met
- `taskStore.getBlockedTasks()` - Get tasks with incomplete dependencies
- `taskStore.createFromTemplate(tasks)` - Bulk create with dependency resolution
- Bi-directional linking via `[[Task:task_id]]` in notes

## Configuration

- `src/config/categories.js` - Research categories (data, experiment, writing, funding, presentation, literature)
- `src/config/priorities.js` - Priority levels (critical, high, normal, low) with urgency scores

## CSS Architecture

Styles in `styles/` directory (load order matters in index.html):
1. `variables.css` - CSS custom properties (colors, spacing, typography)
2. `reset.css` - Browser normalization
3. `utils.css` - Utility classes (flex, text, spacing, etc.)
4. `layout.css` - Landing page, triptych layout, glitch effects
5. `components.css` - Component styles (matrix, modal, buttons, forms)
6. `responsive.css` - Media queries for tablet/mobile

Theme colors (cyberpunk neobrutalist):
- Primary: `#F3F91A` (neon yellow)
- Secondary: `#00F0FF` (electric cyan)
- Alert: `#FF2A2A` (error red)
- Success: `#39FF14` (terminal green)
- Background: `#050505` to `#0A0A0A` (deep black)

## Key Patterns

1. **No manual re-renders**: Components subscribe to store; notify() handles updates
2. **Versioned storage**: Keys like `rf.tasks.v1` for safe migrations
3. **Validation on save**: All task data validated before persistence
4. **Mobile-first responsive**: CSS designed for mobile, enhanced for desktop
5. **Event delegation**: Attach listeners to containers, not individual elements
6. **Keyboard shortcuts**: Ctrl/Cmd+N for new task, Escape to close modals
