# ResearchFlow Data Architecture - Constitutional Document

**Version:** 1.0.0  
**Last Updated:** October 26, 2025  
**Status:** CONSTITUTIONAL - All future development MUST adhere to this document

---

## 🎯 **Mission Statement**

ResearchFlow stores people's critical research work - papers, experiments, grants, and career-defining tasks. **Data loss is career damage.** Therefore, this data layer must be:

1. **DURABLE** - Data survives browser crashes, tab closes, system failures
2. **CONSISTENT** - Referential integrity maintained at all times
3. **AUDITABLE** - Every change is logged and reversible
4. **PERFORMANT** - Queries execute in <50ms for 10,000 tasks
5. **EVOLVABLE** - Schema changes don't break existing data
6. **RECOVERABLE** - Corruption is detected and repairable

---

## ⚖️ **Core Principles (Immutable)**

### Principle 1: Offline-First, Cloud-Ready
- All operations work without network
- Data lives in browser (IndexedDB)
- Future cloud sync is additive, not required
- Conflict resolution strategy defined upfront

### Principle 2: Event Sourcing for Critical Operations
- All mutations generate events
- Events are immutable and append-only
- Current state = projection of event log
- Undo/Redo = event replay
- Audit trail is built-in

### Principle 3: Referential Integrity is Sacred
- Foreign key constraints enforced
- Cascading deletes are explicit
- Orphaned records are impossible
- Relationship validation before commit

### Principle 4: Schema Evolution is Mandatory
- Every schema change has a migration
- Migrations are tested and reversible
- Version number stored with data
- App refuses to run on incompatible versions

### Principle 5: Zero Trust in User Input
- All data validated against JSON Schema
- Type coercion is explicit
- Default values are defined
- Invalid data rejected at boundary

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                   │
│  (TaskStore, ProjectManager, TemplateManager)        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│              DATA ACCESS LAYER (ORM)                 │
│  - Query Builder                                     │
│  - Relationship Manager                              │
│  - Transaction Coordinator                           │
│  - Cache Layer                                       │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│            STORAGE ENGINE LAYER                      │
│  - IndexedDB Adapter                                 │
│  - Schema Manager                                    │
│  - Migration Engine                                  │
│  - Validation Layer                                  │
│  - Event Log                                         │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│              PERSISTENCE LAYER                       │
│  - IndexedDB (Primary)                               │
│  - localStorage (Metadata only)                      │
│  - Export/Import (Backup)                            │
└─────────────────────────────────────────────────────┘
```

---

## 📊 **Data Model v1.0**

### Entity Definitions

#### 1. **Task Entity**
```typescript
interface Task {
  // Identity
  id: string;                    // UUID v4
  version: number;               // Optimistic locking
  
  // Core Fields
  text: string;                  // Required, 1-500 chars
  category: CategoryId;          // FK to Category
  priority: Priority;            // enum: critical|high|normal|low
  status: TaskStatus;            // enum: todo|in-progress|review|done
  completed: boolean;
  
  // Relationships
  projectId: string | null;      // FK to Project (nullable)
  dependencies: string[];        // FK[] to Task (many-to-many)
  tags: string[];                // FK[] to Tag (many-to-many)
  templateId: string | null;     // FK to Template (nullable, immutable)
  
  // Metadata
  dueDate: string | null;        // ISO 8601 date
  notes: string;                 // Markdown supported
  estimatedHours: number | null;
  actualHours: number | null;
  
  // Timestamps
  createdAt: number;             // Unix timestamp (ms)
  updatedAt: number;             // Unix timestamp (ms)
  completedAt: number | null;    // Unix timestamp (ms)
  deletedAt: number | null;      // Soft delete
  
  // Sync (future)
  syncStatus: SyncStatus;        // local|syncing|synced|conflict
  lastSyncedAt: number | null;
  syncVersion: number;
}
```

**Indexes:**
- `id` (primary key, unique)
- `projectId` (for project queries)
- `category` (for filtering)
- `priority` (for filtering)
- `dueDate` (for timeline)
- `completed` (for active/done split)
- `deletedAt` (for soft delete queries)
- `[category, priority]` (composite for common filters)

**Constraints:**
- `text.length >= 1 && text.length <= 500`
- `category IN ValidCategories`
- `projectId EXISTS IN Projects OR NULL`
- `dependencies[] NOT INCLUDES self.id` (no self-reference)
- `dependencies[] MUST FORM DAG` (no cycles)
- `completedAt` only set if `completed === true`

---

#### 2. **Project Entity**
```typescript
interface Project {
  id: string;                    // UUID v4
  version: number;
  
  name: string;                  // Required, 1-200 chars
  description: string;
  color: string;                 // Hex color code
  archived: boolean;
  
  // Metadata
  startDate: string | null;
  endDate: string | null;
  
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  
  // Sync
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  syncVersion: number;
}
```

**Indexes:**
- `id` (primary)
- `archived` (for filtering)
- `deletedAt`

**Constraints:**
- `name.length >= 1 && name.length <= 200`
- `color MATCHES /^#[0-9A-Fa-f]{6}$/`

---

#### 3. **Template Entity**
```typescript
interface Template {
  id: string;
  version: number;
  
  name: string;
  description: string;
  category: CategoryId;
  estimatedDuration: number;     // Days
  builtin: boolean;              // True for system templates
  
  // Template definition
  tasks: TemplateTask[];
  
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

interface TemplateTask {
  text: string;
  category: CategoryId;
  priority: Priority;
  daysFromStart: number;
  notes?: string;
  tags?: string[];
  dependencies?: number[];       // Indices, not IDs!
}
```

**Indexes:**
- `id` (primary)
- `builtin` (to separate system from custom)
- `category`

---

#### 4. **Tag Entity**
```typescript
interface Tag {
  id: string;
  version: number;
  
  name: string;                  // Unique
  color: string;
  
  createdAt: number;
  updatedAt: number;
}
```

**Indexes:**
- `id` (primary)
- `name` (unique)

---

#### 5. **Dependency Entity** (Junction Table)
```typescript
interface Dependency {
  id: string;
  
  taskId: string;                // FK to Task
  dependsOnId: string;           // FK to Task
  
  createdAt: number;
}
```

**Indexes:**
- `id` (primary)
- `taskId` (for forward lookup)
- `dependsOnId` (for reverse lookup)
- `[taskId, dependsOnId]` (unique composite)

**Constraints:**
- `taskId !== dependsOnId`
- `taskId EXISTS IN Tasks`
- `dependsOnId EXISTS IN Tasks`
- Graph formed by all dependencies MUST be DAG

---

#### 6. **Event Entity** (Audit Log)
```typescript
interface Event {
  id: string;                    // UUID v4
  
  type: EventType;               // create|update|delete|restore
  entityType: EntityType;        // task|project|template|tag
  entityId: string;
  
  userId: string | null;         // Future: user identification
  
  changes: {
    before: Partial<Entity> | null;
    after: Partial<Entity> | null;
  };
  
  metadata: {
    ip?: string;
    userAgent?: string;
    source: string;              // ui|api|sync|migration
  };
  
  timestamp: number;
}
```

**Indexes:**
- `id` (primary)
- `entityId` (for entity history)
- `timestamp` (for chronological queries)
- `[entityType, entityId]` (for entity-specific history)

---

#### 7. **Metadata Entity** (App Settings)
```typescript
interface Metadata {
  key: string;                   // Primary key
  value: any;                    // JSON serializable
  
  updatedAt: number;
}

// Reserved keys:
// - schema_version (current schema version)
// - last_backup (timestamp of last backup)
// - migration_history (array of applied migrations)
// - user_preferences (user settings)
// - feature_flags (experimental features)
```

---

## 🔄 **Transaction Model**

### ACID Guarantees

**Atomicity:**
- All mutations wrapped in IndexedDB transactions
- Partial failures rollback completely
- Multi-entity operations are atomic

**Consistency:**
- Validation before commit
- Referential integrity checked
- Constraint violations abort transaction

**Isolation:**
- Read committed isolation level
- Optimistic locking via version numbers
- Concurrent writes detected and rejected

**Durability:**
- IndexedDB auto-commits to disk
- Events logged immediately
- Background backup on mutation

### Transaction API

```javascript
await db.transaction(async (tx) => {
  // All operations in this block are atomic
  const task = await tx.tasks.create({ ... });
  await tx.dependencies.create({ taskId: task.id, dependsOnId: parent.id });
  await tx.events.log({ type: 'create', entityType: 'task', entityId: task.id });
  
  // If any operation fails, entire transaction rolls back
});
```

---

## 📝 **Schema Migrations**

### Migration Structure

```javascript
{
  version: 2,
  description: "Add estimatedHours to Task",
  up: async (db) => {
    // Forward migration
    await db.tasks.addColumn('estimatedHours', 'number', { nullable: true });
  },
  down: async (db) => {
    // Rollback migration
    await db.tasks.removeColumn('estimatedHours');
  },
  validate: async (db) => {
    // Verify migration succeeded
    const sample = await db.tasks.findOne();
    return 'estimatedHours' in sample;
  }
}
```

### Migration Process

1. **Backup current data** (export to JSON)
2. **Check migration chain** (no gaps)
3. **Run migrations sequentially** (v1 → v2 → v3)
4. **Validate each step**
5. **Update schema_version metadata**
6. **Log migration event**
7. **Keep backup for 24 hours**

### Migration Safety Rules

- Migrations are **never destructive by default**
- Column removals require explicit `{destructive: true}` flag
- Data transformations have fallback values
- Migrations can be retried (idempotent)
- Failed migrations restore backup

---

## 🛡️ **Validation Layer**

### JSON Schema Validation

Every entity has a JSON Schema definition:

```javascript
const TaskSchema = {
  type: 'object',
  required: ['id', 'text', 'category', 'priority'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    text: { type: 'string', minLength: 1, maxLength: 500 },
    category: { type: 'string', enum: Object.keys(CATEGORIES) },
    priority: { type: 'string', enum: ['critical', 'high', 'normal', 'low'] },
    dependencies: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      uniqueItems: true
    },
    // ... more fields
  },
  additionalProperties: false  // Reject unknown fields
};
```

### Validation Points

1. **Input Validation** - Before entering system
2. **Pre-Commit Validation** - Before transaction commit
3. **Post-Load Validation** - After loading from storage
4. **Migration Validation** - After schema changes

---

## 🔍 **Query Optimization**

### Index Strategy

- **Primary indexes** on all foreign keys
- **Composite indexes** on common filter combinations
- **Covering indexes** for frequent queries
- **Sparse indexes** on nullable columns

### Query Patterns

```javascript
// BAD: Full table scan
const tasks = db.tasks.getAll().filter(t => t.category === 'data');

// GOOD: Index-backed query
const tasks = await db.tasks.findBy('category', 'data');

// BETTER: Composite index
const tasks = await db.tasks.findBy(['category', 'priority'], ['data', 'high']);
```

### Caching Strategy

- **Hot data** cached in memory (recently accessed)
- **LRU eviction** when cache exceeds 10MB
- **Write-through** cache updates
- **Cache invalidation** on mutation

---

## 💾 **Backup & Recovery**

### Backup Strategy

1. **Auto-backup on mutation** (throttled to 1/minute)
2. **Manual backup** via Export feature
3. **Backup rotation** (keep last 10)
4. **Cloud backup** (future: encrypted sync)

### Backup Format

```json
{
  "version": "1.0.0",
  "schemaVersion": 3,
  "exportedAt": 1698345600000,
  "entities": {
    "tasks": [...],
    "projects": [...],
    "templates": [...],
    "tags": [...],
    "dependencies": [...],
    "events": [...]
  },
  "metadata": {...},
  "checksum": "sha256_hash_of_data"
}
```

### Recovery Scenarios

**Scenario 1: Corruption Detected**
1. Alert user immediately
2. Load most recent valid backup
3. Log corruption event
4. Offer manual inspection

**Scenario 2: Migration Failed**
1. Rollback transaction
2. Restore pre-migration backup
3. Log error details
4. Prevent app startup until resolved

**Scenario 3: Accidental Deletion**
1. Soft delete by default (deletedAt timestamp)
2. Restore from event log (undo)
3. Permanent delete after 30 days
4. Backup survives permanent delete

---

## 🔐 **Security & Privacy**

### Data Protection

- All data stays in browser (no external transmission)
- Future encryption: AES-256-GCM for sensitive fields
- Export files include integrity checksum
- No telemetry or analytics on user data

### Access Control (Future)

- User authentication layer
- Row-level security (tasks belong to user)
- Shared projects with permissions
- API key management for integrations

---

## 📈 **Performance Requirements**

### Benchmarks (10,000 tasks)

| Operation | Target | Maximum |
|-----------|--------|---------|
| Create task | <10ms | 50ms |
| Update task | <10ms | 50ms |
| Query by index | <20ms | 100ms |
| Full-text search | <100ms | 500ms |
| Template generation (100 tasks) | <200ms | 1s |
| Dependency validation | <50ms | 200ms |
| Export all data | <1s | 5s |
| Import all data | <2s | 10s |

### Scalability Targets

- **10,000 tasks** - Smooth performance
- **100 projects** - No degradation
- **1,000 templates** - Fast loading
- **50MB total data** - Within IndexedDB limits

---

## 🧪 **Testing Requirements**

### Unit Tests (Required)

- Every data model class
- All validation functions
- Migration scripts
- Query builders
- Transaction logic

### Integration Tests (Required)

- Multi-entity transactions
- Referential integrity enforcement
- Circular dependency detection
- Backup/restore cycles
- Migration paths

### Performance Tests (Required)

- Benchmark against 10K tasks
- Memory leak detection
- Query optimization validation
- Index effectiveness measurement

---

## 🚀 **Implementation Roadmap**

### Phase 1: Foundation (This Phase)
- [x] Document data architecture
- [ ] Build IndexedDB adapter
- [ ] Implement schema manager
- [ ] Create validation layer
- [ ] Build transaction coordinator

### Phase 2: ORM Layer
- [ ] Entity repository pattern
- [ ] Query builder
- [ ] Relationship manager
- [ ] Cache layer
- [ ] Event log

### Phase 3: Migration System
- [ ] Migration engine
- [ ] Version detection
- [ ] Auto-migration
- [ ] Rollback capability

### Phase 4: Backup & Recovery
- [ ] Auto-backup system
- [ ] Export/Import
- [ ] Corruption detection
- [ ] Recovery wizard

### Phase 5: Optimization
- [ ] Index tuning
- [ ] Query optimization
- [ ] Memory profiling
- [ ] Performance testing

---

## 📋 **Breaking Changes Policy**

### Version Compatibility

- **Major version** (v1 → v2): Breaking changes allowed, migration required
- **Minor version** (v1.1 → v1.2): Additive only, backward compatible
- **Patch version** (v1.1.1 → v1.1.2): Bug fixes only

### Deprecation Process

1. Mark field as deprecated (add to schema metadata)
2. Support for 2 major versions
3. Provide migration path in docs
4. Remove in next major version

---

## 🏛️ **Governance**

### Change Process

1. **Proposal** - Document change in GitHub issue
2. **Review** - Architecture review required
3. **Impact Analysis** - Migration plan, performance impact
4. **Approval** - Requires sign-off from maintainer
5. **Implementation** - With tests and documentation
6. **Migration** - User communication, backup strategy

### This Document

- **Immutable sections**: Principles, Mission Statement
- **Evolutionary sections**: Implementation details, performance targets
- **Change authority**: Requires unanimous approval of core team
- **Version control**: All changes tracked in git

---

## 📚 **References**

- **IndexedDB Spec**: https://www.w3.org/TR/IndexedDB/
- **Event Sourcing**: Martin Fowler's essays
- **JSON Schema**: https://json-schema.org/
- **Database Design**: C.J. Date's "An Introduction to Database Systems"

---

**Last Updated:** October 26, 2025  
**Next Review:** December 1, 2025  
**Status:** RATIFIED

This document is the constitutional foundation of ResearchFlow's data layer. All code MUST conform to these principles. Deviations require explicit architectural review and approval.

