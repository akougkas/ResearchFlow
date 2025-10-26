/**
 * Schema Manager - Handles database versioning and migrations
 * Ensures data integrity across schema changes
 */

export class SchemaManager {
  constructor() {
    this.currentVersion = 1;
    this.migrations = [];
    this.schema = null;
  }

  /**
   * Define current schema
   */
  defineSchema(version, schema) {
    this.currentVersion = version;
    this.schema = schema;
    return this;
  }

  /**
   * Register a migration
   */
  addMigration(migration) {
    if (!migration.version || !migration.up) {
      throw new Error('Migration must have version and up() function');
    }
    
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
    
    return this;
  }

  /**
   * Get migrations needed from oldVersion to currentVersion
   */
  getMigrationsToRun(fromVersion) {
    return this.migrations.filter(m => 
      m.version > fromVersion && m.version <= this.currentVersion
    );
  }

  /**
   * Validate migration chain has no gaps
   */
  validateMigrationChain() {
    for (let i = 0; i < this.migrations.length - 1; i++) {
      const current = this.migrations[i].version;
      const next = this.migrations[i + 1].version;
      
      if (next - current > 1) {
        throw new Error(`Migration gap detected: v${current} → v${next}`);
      }
    }
    return true;
  }

  /**
   * Get schema definition for IndexedDB
   */
  getIndexedDBSchema() {
    return this.schema;
  }
}

/**
 * Current Schema Definition (v1)
 */
export const SCHEMA_V1 = {
  version: 1,
  stores: {
    tasks: {
      keyPath: 'id',
      indexes: [
        { keyPath: 'projectId' },
        { keyPath: 'category' },
        { keyPath: 'priority' },
        { keyPath: 'status' },
        { keyPath: 'completed' },
        { keyPath: 'dueDate' },
        { keyPath: 'deletedAt' },
        { keyPath: ['category', 'priority'], unique: false }, // Composite
        { keyPath: 'createdAt' },
        { keyPath: 'updatedAt' }
      ]
    },
    
    projects: {
      keyPath: 'id',
      indexes: [
        { keyPath: 'archived' },
        { keyPath: 'deletedAt' },
        { keyPath: 'createdAt' }
      ]
    },
    
    templates: {
      keyPath: 'id',
      indexes: [
        { keyPath: 'builtin' },
        { keyPath: 'category' },
        { keyPath: 'deletedAt' }
      ]
    },
    
    tags: {
      keyPath: 'id',
      indexes: [
        { keyPath: 'name', unique: true }
      ]
    },
    
    dependencies: {
      keyPath: 'id',
      indexes: [
        { keyPath: 'taskId' },
        { keyPath: 'dependsOnId' },
        { keyPath: ['taskId', 'dependsOnId'], unique: true }
      ]
    },
    
    events: {
      keyPath: 'id',
      indexes: [
        { keyPath: 'entityId' },
        { keyPath: 'entityType' },
        { keyPath: 'timestamp' },
        { keyPath: ['entityType', 'entityId'] }
      ]
    },
    
    metadata: {
      keyPath: 'key'
    }
  }
};

/**
 * Initialize schema manager with current schema
 */
export function createSchemaManager() {
  const manager = new SchemaManager();
  manager.defineSchema(1, SCHEMA_V1);
  
  // Register migrations here (none yet for v1)
  
  return manager;
}

/**
 * Example Migration (v1 → v2)
 * Uncomment and modify when needed
 */
/*
const MIGRATION_V2 = {
  version: 2,
  description: 'Add estimatedHours to tasks',
  
  async up(db) {
    // IndexedDB doesn't support ALTER TABLE
    // We need to read all records, transform, and write back
    const tx = db.transaction(['tasks'], 'readwrite');
    const store = tx.store('tasks');
    
    const tasks = await store.getAll();
    
    for (const task of tasks) {
      task.estimatedHours = null; // Add new field
      await store.put(task);
    }
    
    await tx.complete();
  },
  
  async down(db) {
    const tx = db.transaction(['tasks'], 'readwrite');
    const store = tx.store('tasks');
    
    const tasks = await store.getAll();
    
    for (const task of tasks) {
      delete task.estimatedHours;
      await store.put(task);
    }
    
    await tx.complete();
  },
  
  async validate(db) {
    const tx = db.transaction(['tasks'], 'readonly');
    const store = tx.store('tasks');
    
    const sample = await store.get(await store.getAllKeys()[0]);
    return sample && ('estimatedHours' in sample);
  }
};
*/

