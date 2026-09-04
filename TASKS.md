# Gnosis Tasks roadmap

This roadmap tracks product work that belongs in this repository. Ecosystem-wide decisions belong
in `grc-iit/gnosis-toolkit`.

## MVP — local research workspace

- [x] Focus view based on urgency, priority, and dependency readiness
- [x] Research work list with search and area filters
- [x] Dependency-aware board and schedule
- [x] Create, edit, complete, and delete research work
- [x] Atomic workspace backup import and export
- [x] Local persistence, responsive layout, PWA shell, and CI
- [ ] Add dependency selection to the create/edit form
- [ ] Add project creation and project switching
- [ ] Add acceptance criteria and evidence attachments

## Self-hosted team edition

- [ ] Define the API and tenancy boundary before implementation
- [ ] Add institutional authentication and role-based access
- [ ] Persist projects, members, tasks, and audit events server-side
- [ ] Add comments, assignment, notifications, and conflict-safe synchronization
- [ ] Package a supported container deployment for `tasks.gnosis.run`

## Gnosis intelligence

- [ ] Design a citation-preserving contract between Gnosis Tasks and GnosisAI
- [ ] Suggest task decomposition only when grounded in project context
- [ ] Link claims, papers, datasets, experiments, and resulting evidence
- [ ] Keep model inference optional and visibly distinguish suggestions from recorded facts

## Explicitly out of scope for this MVP

- Simulated AI generation
- Voice capture without a validated research workflow
- Theme collections
- Social or gamification mechanics
- Silent cloud synchronization
