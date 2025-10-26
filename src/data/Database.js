/**
 * Database - Main database orchestrator
 * Coordinates IndexedDB, schema, validation, and repositories
 */

import { IndexedDBAdapter } from './db/IndexedDBAdapter.js';
import { createSchemaManager } from './db/SchemaManager.js';
import { validator } from './validation/Validator.js';
import { TaskRepository } from './repositories/TaskRepository.js';
import { ProjectRepository } from './repositories/ProjectRepository.js';
import { TemplateRepository } from './repositories/TemplateRepository.js';
import { EventRepository } from './repositories/EventRepository.js';
import { MetadataRepository } from './repositories/MetadataRepository.js';

const DB_NAME = 'ResearchFlowDB';
const METADATA_KEY_SCHEMA_VERSION = 'schema_version';

export class Database {
  constructor() {
    this.adapter = null;
    this.schemaManager = createSchemaManager();
    this.validator = validator;
    this.isOpen = false;
    
    // Repositories
    this.tasks = null;
    this.projects = null;
    this.templates = null;
    this.events = null;
    this.metadata = null;
  }

  /**
   * Initialize and open database
   */
  async open() {
    if (this.isOpen) {
      return;
    }

    try {
      // Get current schema version
      const currentVersion = this.schemaManager.currentVersion;
      
      // Create adapter
      this.adapter = new IndexedDBAdapter(DB_NAME, currentVersion);
      
      // Open database with schema
      const schema = this.schemaManager.getIndexedDBSchema();
      await this.adapter.open(schema);
      
      // Initialize repositories
      this.tasks = new TaskRepository(this.adapter, this.validator);
      this.projects = new ProjectRepository(this.adapter, this.validator);
      this.templates = new TemplateRepository(this.adapter, this.validator);
      this.events = new EventRepository(this.adapter, this.validator);
      this.metadata = new MetadataRepository(this.adapter, this.validator);
      
      // Check for migrations
      await this.checkAndRunMigrations();
      
      this.isOpen = true;
      console.log(`✅ Database opened (v${currentVersion})`);
    } catch (error) {
      console.error('Failed to open database:', error);
      throw error;
    }
  }

  /**
   * Check if migrations are needed and run them
   */
  async checkAndRunMigrations() {
    const storedVersion = await this.metadata.get(METADATA_KEY_SCHEMA_VERSION);
    const currentVersion = this.schemaManager.currentVersion;
    
    if (!storedVersion) {
      // First time setup
      await this.metadata.set(METADATA_KEY_SCHEMA_VERSION, currentVersion);
      console.log('✅ Database initialized at version', currentVersion);
      return;
    }

    if (storedVersion.value < currentVersion) {
      console.log(`🔄 Migrating database from v${storedVersion.value} to v${currentVersion}`);
      await this.runMigrations(storedVersion.value, currentVersion);
    } else if (storedVersion.value > currentVersion) {
      throw new Error(
        `Database version (v${storedVersion.value}) is newer than app version (v${currentVersion}). ` +
        'Please update the application.'
      );
    }
  }

  /**
   * Run migrations from oldVersion to current version
   */
  async runMigrations(fromVersion, toVersion) {
    const migrations = this.schemaManager.getMigrationsToRun(fromVersion);
    
    if (migrations.length === 0) {
      return;
    }

    // Validate migration chain
    this.schemaManager.validateMigrationChain();
    
    // Backup data before migrations
    console.log('📦 Creating backup before migration...');
    await this.exportBackup(`pre-migration-v${toVersion}`);
    
    // Run each migration
    for (const migration of migrations) {
      console.log(`  Running migration v${migration.version}: ${migration.description}`);
      
      try {
        await migration.up(this.adapter);
        
        // Validate migration if validation function provided
        if (migration.validate) {
          const valid = await migration.validate(this.adapter);
          if (!valid) {
            throw new Error(`Migration v${migration.version} validation failed`);
          }
        }
        
        // Log migration event
        await this.events.create({
          type: 'migration',
          entityType: 'database',
          entityId: DB_NAME,
          metadata: {
            fromVersion,
            toVersion: migration.version,
            description: migration.description,
            source: 'migration'
          }
        });
        
        console.log(`  ✅ Migration v${migration.version} complete`);
      } catch (error) {
        console.error(`  ❌ Migration v${migration.version} failed:`, error);
        
        // Attempt rollback if possible
        if (migration.down) {
          console.log('  🔄 Rolling back migration...');
          try {
            await migration.down(this.adapter);
            console.log('  ✅ Rollback successful');
          } catch (rollbackError) {
            console.error('  ❌ Rollback failed:', rollbackError);
          }
        }
        
        throw new Error(`Migration failed at v${migration.version}: ${error.message}`);
      }
    }
    
    // Update schema version
    await this.metadata.set(METADATA_KEY_SCHEMA_VERSION, toVersion);
    console.log(`✅ Database migrated to v${toVersion}`);
  }

  /**
   * Export database to JSON (for backup)
   */
  async exportBackup(label = 'backup') {
    const data = {
      version: '1.0.0',
      schemaVersion: this.schemaManager.currentVersion,
      exportedAt: Date.now(),
      label,
      entities: {
        tasks: await this.tasks.getAll(),
        projects: await this.projects.getAll(),
        templates: await this.templates.getAll(),
        events: await this.events.getAll(),
        metadata: await this.metadata.getAll()
      }
    };
    
    // Calculate checksum
    const json = JSON.stringify(data.entities);
    data.checksum = await this.calculateChecksum(json);
    
    return data;
  }

  /**
   * Import database from JSON backup
   */
  async importBackup(backupData, options = {}) {
    const { validate = true, clearExisting = false } = options;
    
    // Validate backup
    if (validate) {
      const json = JSON.stringify(backupData.entities);
      const checksum = await this.calculateChecksum(json);
      
      if (checksum !== backupData.checksum) {
        throw new Error('Backup checksum mismatch - data may be corrupted');
      }
    }
    
    // Check version compatibility
    if (backupData.schemaVersion > this.schemaManager.currentVersion) {
      throw new Error('Backup is from a newer version - cannot import');
    }
    
    // Clear existing data if requested
    if (clearExisting) {
      await this.clear();
    }
    
    // Import entities
    const tx = this.adapter.transaction(
      ['tasks', 'projects', 'templates', 'events', 'metadata'],
      'readwrite'
    );
    
    try {
      // Import in dependency order
      for (const task of backupData.entities.tasks || []) {
        await tx.store('tasks').put(task);
      }
      for (const project of backupData.entities.projects || []) {
        await tx.store('projects').put(project);
      }
      for (const template of backupData.entities.templates || []) {
        await tx.store('templates').put(template);
      }
      for (const event of backupData.entities.events || []) {
        await tx.store('events').put(event);
      }
      for (const meta of backupData.entities.metadata || []) {
        await tx.store('metadata').put(meta);
      }
      
      await tx.complete();
      
      console.log('✅ Backup imported successfully');
    } catch (error) {
      tx.abort();
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Calculate SHA-256 checksum
   */
  async calculateChecksum(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clear all data (dangerous!)
   */
  async clear() {
    const tx = this.adapter.transaction(
      ['tasks', 'projects', 'templates', 'events', 'metadata'],
      'readwrite'
    );
    
    await tx.store('tasks').clear();
    await tx.store('projects').clear();
    await tx.store('templates').clear();
    await tx.store('events').clear();
    await tx.store('metadata').clear();
    
    await tx.complete();
    
    console.log('⚠️ Database cleared');
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const tx = this.adapter.transaction(
      ['tasks', 'projects', 'templates', 'events'],
      'readonly'
    );
    
    return {
      tasks: await tx.store('tasks').count(),
      projects: await tx.store('projects').count(),
      templates: await tx.store('templates').count(),
      events: await tx.store('events').count(),
      schemaVersion: this.schemaManager.currentVersion,
      isOpen: this.isOpen
    };
  }

  /**
   * Close database
   */
  close() {
    if (this.adapter) {
      this.adapter.close();
      this.isOpen = false;
      console.log('Database closed');
    }
  }

  /**
   * Delete database completely (dangerous!)
   */
  static async deleteDatabase() {
    await IndexedDBAdapter.deleteDatabase(DB_NAME);
    console.log('⚠️ Database deleted');
  }
}

// Singleton instance
export const db = new Database();

