# 🔬 ResearchFlow

An intelligent, **research-focused** todo application designed specifically for scientists, PhD students, and academic teams. Not just another task manager—it's a smart research assistant that understands the unique workflows of scientific discovery.

## ✨ Features

### Core Features (Phase 1-2 ✅)
- **Neobrutalist Neomodern UI**: High-impact, premium professional interface.
- **Interactive Force Graph**: Visualize research clusters and dependencies.
- **Smart Notebook**: Bi-directional linking with [[Task:id]] support.
- **Research-Focused Categories**: Data Analysis 📊, Experiments 🧪, Writing 📝, Funding 💰, Presentations 🎤, Literature 📚
- **Vanilla JS Architecture**: Zero build tools, pure modern ESM.
- **Persistent Storage**: Robust versioned LocalStorage engine.
- **Responsive Design**: Mobile-first architecture for lab environments.

### Coming Soon (Phase 2-4)
- Research templates (paper submission, grant proposals, experiment cycles)
- Task dependencies and blocking logic
- Kanban and timeline views
- AI-powered categorization and insights
- Voice-to-text task capture
- PWA with offline support
- Export/import functionality

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.7+ (for local development server)

### Installation & Running

```bash
# Clone or navigate to project
cd /path/to/ResearchFlow

# Start local development server
python -m http.server 8000

# Open browser
# Navigate to http://localhost:8000
```

## 📁 Project Structure

```
ResearchFlow/
├── src/
│   ├── core/                    # Business logic
│   │   ├── data-models.js       # Task & Project classes
│   │   ├── taskStore.js         # State management with observer pattern
│   │   └── storage.js           # Versioned localStorage manager
│   ├── config/                  # Configuration
│   │   ├── categories.js        # Research categories
│   │   └── priorities.js        # Priority levels
│   ├── ui/
│   │   ├── app.js               # Main application controller
│   │   └── components/          # UI components
│   │       ├── TaskForm.js      # Task creation form
│   │       ├── TaskCard.js      # Individual task display
│   │       └── ListView.js      # Task list with filtering/sorting
│   ├── utils/
│   │   └── dom.js               # DOM utilities with event delegation
│   └── features/                # Research-specific features (Phase 2+)
├── styles/
│   ├── reset.css               # Browser reset
│   ├── variables.css           # Theme variables
│   ├── layout.css              # Layout grid
│   └── components.css          # Component styles
├── public/
│   └── manifest.json           # PWA manifest
├── index.html                  # Main application
└── README.md                   # This file
```

## 🏗️ Architecture

### Observer Pattern for Reactive Updates
The application uses the **Observer Pattern** for state management:

1. **TaskStore** manages application state
2. **Components subscribe** to state changes via `subscribe(callback)`
3. **Store notifies** subscribers when data changes
4. **UI auto-updates** without manual render calls

Benefits:
- Decoupled components
- Predictable data flow
- Automatic re-renders
- No manual DOM manipulation

### Event Delegation
Components use **event delegation** at the container level instead of individual elements:

```javascript
// One listener for all buttons, not one per button
delegate(container, 'click', '.btn-delete', handleDelete);
```

Benefits:
- Better performance with large lists
- Works with dynamically added elements
- Less memory overhead

## 🎨 Design System

### Color Palette (Dark Academia Theme)
- **Primary**: `#0d1421` (Deep Navy)
- **Secondary**: `#1e293b` (Slate)
- **Accent Gold**: `#f4a261` (Warm Gold)
- **Text Light**: `#f1f5f9` (Off-white)
- **Danger**: `#ef4444` (Red)
- **Success**: `#10b981` (Emerald)

### Typography
- **Headings**: Crimson Text (serif)
- **Body**: Inter (sans-serif)
- **Mono**: JetBrains Mono (monospace)

### Spacing System
- Base unit: 0.25rem (4px)
- Modular scale: xs, sm, md, lg, xl, 2xl, 3xl

## 🧪 Testing

### Manual Testing Checklist

**Task Creation**
- [ ] Create task with all fields
- [ ] Create task with minimal fields
- [ ] Validate empty text shows error
- [ ] Test all 6 categories
- [ ] Test all 4 priority levels
- [ ] Test date picker

**Task Display**
- [ ] Category icons show correctly
- [ ] Priority badges render
- [ ] Due dates format correctly
- [ ] Overdue tasks highlight

**Actions**
- [ ] Toggle completion
- [ ] Delete with confirmation
- [ ] Permanent removal verified

**Filtering & Sorting**
- [ ] Filter All/Active/Completed
- [ ] Sort by Date/Priority/Due Date
- [ ] Empty state shows appropriately

**Data Persistence**
- [ ] Tasks save to localStorage
- [ ] Page refresh preserves tasks
- [ ] localStorage keys are versioned

**Responsive**
- [ ] Mobile (320px): Single column
- [ ] Tablet (768px): Sidebar layout
- [ ] Desktop (1024px+): Full layout

**Accessibility**
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Form labels associated
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA

## 🔧 Development Principles

1. **Read → Edit → Verify → Test**: Always read files before editing, verify changes applied, then test
2. **Observer Pattern**: Use subscribe/notify, not manual renders
3. **Event Delegation**: Attach listeners to containers, not individual elements
4. **Versioned Storage**: Use namespaced keys (rf.tasks.v1) for safe migrations
5. **Mobile-First**: Design for mobile, enhance for desktop
6. **ES6+ Syntax**: Modern JavaScript features throughout
7. **Error Handling**: Try-catch blocks for data operations
8. **Validation**: Validate all user inputs before saving

## 📊 Task Data Structure

```javascript
{
  id: "task_1699000000000_abc123def",
  text: "Analyze RNA-seq results",
  category: "data",           // data | experiment | writing | funding | presentation | literature
  priority: "high",           // critical | high | normal | low
  completed: false,
  dueDate: "2025-11-15",     // ISO date string or null
  createdAt: 1699000000000,  // Unix timestamp
  updatedAt: 1699000000000,  // Unix timestamp
  tags: [],                  // Future: Phase 2+
  notes: "",                 // Future: Phase 2+
  dependencies: [],          // Future: Phase 2+
  projectId: null            // Future: Phase 2+
}
```

## 🚀 Performance

### Targets
- Page load: < 3 seconds
- Animations: 60fps
- Memory usage: < 10MB with 100+ tasks
- Storage usage: < 1MB for 500 tasks

### Optimizations
- Vanilla JavaScript (no framework overhead)
- Event delegation (fewer listeners)
- LocalStorage caching (fast access)
- CSS animations (GPU accelerated)

## 🐛 Known Limitations & Future Work

### Phase 1 (Current)
✅ Basic CRUD operations
✅ Filtering and sorting
✅ Dark academia theme
✅ Responsive design
❌ Task editing (Phase 2)
❌ Task dependencies
❌ Advanced views (Kanban, Timeline)
❌ AI features
❌ PWA offline support
❌ Collaboration

## 📝 License

Educational project created for research workflow optimization.

## 📞 Support

For bugs or feature requests, please refer to TASKS.md for the development roadmap.

---

**Built with ❤️ for researchers**  
*Making scientific research management smarter, one task at a time.*

