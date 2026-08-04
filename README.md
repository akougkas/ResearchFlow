# 🔬 ResearchFlow (v1.0 Beta)

An intelligent, **research-focused** task manager designed specifically for scientists, PhD students, and academic teams. Not just another task manager—it's a smart research assistant that understands the unique workflows of scientific discovery.

## ✨ Features (Beta Release ✅)

- 🕸️ **Interactive Force Graph**: Canvas-based physics graph visualizing research clusters, node search, and bi-directional relationships.
- 📋 **Kanban Board & Timeline Views**: Dynamic workflow pipeline and chronological task management.
- 🔗 **Bi-Directional Wiki Notebook**: Clickable `[[Task:id]]` links with automatic backlinking and navigation.
- 🔒 **Task Dependency & Blocking Engine**: Multi-task dependency selection with circular dependency detection and blocked protocol indicators.
- 🎙️ **Voice-to-Text Research Capture**: Hands-free lab dictation with auto-categorization based on scientific keywords.
- ⚡ **Command Palette & Global Shortcuts**: Instant search and navigation with `Cmd+K` / `/` and `1-4` view keys.
- 🤖 **AI Task Breakdown Generator**: Natural language task breakdown engine with academic presets (Paper submission, Grant proposal, Experiment cycle).
- 💾 **IndexedDB + LocalStorage Sync Engine**: Quota-safe storage with versioning, JSON workspace backup/restore, and Markdown notebook generation.
- ⚡ **Offline PWA Service Worker**: Lab-ready PWA with offline caching.

## 🚀 Quick Start

### Development Server

```bash
# Navigate to project
cd /home/akougkas/projects/ResearchFlow

# Start local development server
python -m http.server 8000

# Open browser
# Navigate to http://localhost:8000
```

### Running Automated Test Suite

```bash
# Run 21-test unit & integration suite
node tests/run-tests.js
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Cmd+K` / `Ctrl+K` or `/` | Open Command Palette & Global Search |
| `Cmd+N` / `Ctrl+N` | Create New Research Protocol |
| `1` | Switch to Matrix Grid |
| `2` | Switch to Kanban Board |
| `3` | Switch to Timeline View |
| `4` | Switch to Force Graph |
| `ESC` | Close Modals / Command Palette |

## 📁 Project Structure

```
ResearchFlow/
├── src/
│   ├── core/                    # Business logic
│   │   ├── data-models.js       # Task & Project classes
│   │   ├── taskStore.js         # Observer-pattern central state store
│   │   ├── storage.js           # LocalStorage + IndexedDB sync manager
│   │   ├── exportImport.js      # JSON & Markdown export engine
│   │   └── graph/GraphEngine.js # Force-directed Canvas physics graph
│   ├── data/                    # IndexedDB repository layer
│   │   ├── Database.js          # IndexedDB orchestrator
│   │   └── repositories/        # Repository pattern entities
│   ├── features/                # AI, Templates, & Voice Dictation
│   │   ├── ai/TaskBreakdownEngine.js
│   │   ├── voice-capture.js    # SpeechRecognition dictation engine
│   │   └── templates/           # Pre-built academic workflows
│   ├── ui/
│   │   ├── app.js               # Application entry point
│   │   └── components/          # Neobrutalist UI components
│   │       ├── TriptychLayout.js
│   │       ├── TaskMatrix.js
│   │       ├── KanbanView.js
│   │       ├── TimelineView.js
│   │       ├── GraphView.js
│   │       ├── ContextPanel.js
│   │       ├── TaskModal.js
│   │       ├── AITaskModal.js
│   │       ├── VoiceCaptureModal.js
│   │       ├── CommandPaletteModal.js
│   │       └── SystemMenu.js
│   └── config/                  # Categories & Priorities constants
├── tests/
│   └── run-tests.js             # Automated unit & integration test runner
├── public/
│   ├── sw.js                    # PWA Service Worker
│   └── manifest.json            # PWA manifest
├── index.html                   # Main application
└── README.md
```

## 🧪 Testing

Execute unit and integration tests covering data models, taskStore dependencies, bi-directional linking, JSON/Markdown export, and voice auto-categorization:

```bash
node tests/run-tests.js
```

---

**Built with ❤️ for researchers**  
*Making scientific research management smarter, one protocol at a time.*


