# Gnosis Tasks

A calm, local-first workspace for ambitious research. Gnosis Tasks turns research plans into
visible, dependency-aware work without forcing a laboratory into generic project-management
software.

This is the task application in the Gnosis Research Center toolkit. It is designed to run
independently at `tasks.gnosis.run`; the `grc-iit/gnosis-toolkit` repository remains the portfolio
and shared-conventions home for the broader collection.

## Product principles

- Research work has prerequisites, evidence, and milestones—not just checkboxes.
- The most useful screen answers “what can I move forward today?”
- Local-first is the default. Workspace data stays in the browser and can be exported as JSON.
- AI must earn its place. There are no simulated AI features in this MVP.
- The interface should be quiet enough to live in all day.

## Run locally

Requires Node.js 20 or newer. The application uses browser-native ES modules and has no build step.

```bash
npm ci
npm run check
python3 -m http.server 8000
```

Open `http://localhost:8000`. To seed an empty browser with the Atlas research demo, open
`http://localhost:8000/?demo=1`.

## Verification

```bash
npm run check       # unit, integrity, lint, and formatting gates
npm run test:e2e    # browser journey; expects a server on port 8000
```

GitHub Actions runs both verification paths on every pull request and every push to `main`.

## Current MVP

- Focus view prioritizing urgent, ready-to-start work
- Searchable and filterable research work list
- Dependency-aware research pipeline board
- Deadline schedule grouped by month
- Task creation, editing, completion, and deletion
- Research areas, priority, due date, tags, notes, and prerequisites
- Atomic JSON backup import and export
- Versioned localStorage persistence with legacy-data migration
- Installable PWA shell with runtime offline caching
- Responsive desktop and mobile layouts

## Data and deployment

Browser data is not stored in Git. Export a workspace backup before moving browsers or machines.
Import validates the complete dependency graph before replacing live data.

For a single-user deployment, serve this directory as static files behind the
`tasks.gnosis.run` reverse proxy. A future collaborative deployment should introduce an API,
authentication, and server-side storage as a separate architecture phase rather than weakening
the local-first implementation with partial synchronization.

## Gnosis ecosystem

- `grc-iit/gnosis-toolkit` — toolkit registry, product map, and shared conventions
- `grc-iit/gnosisAI` — private corpus and model experimentation; not deployment-ready
- `chat.gnosis.run` — future evidence-grounded Gnosis knowledge interface
- `tasks.gnosis.run` — this application

Gnosis Tasks is developed for the
[Gnosis Research Center](https://grc.iit.edu/) at Illinois Institute of Technology.
