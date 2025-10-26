/**
 * Base Repository - Abstract class for all repositories
 * Provides common CRUD operations with validation
 */

export class BaseRepository {
  constructor(adapter, validator, storeName, entityType) {
    this.adapter = adapter;
    this.validator = validator;
    this.storeName = storeName;
    this.entityType = entityType;
    this.subscribers = [];
    this.cache = new Map();
    this.cacheEnabled = true;
    this.maxCacheSize = 1000;
  }

  /**
   * Generate entity ID
   */
  generateId() {
    return `${this.entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create new entity
   */
  async create(data) {
    // Apply defaults and add metadata
    const entity = {
      id: this.generateId(),
      version: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...this.validator.applyDefaults(this.entityType, data),
      ...data
    };

    // Validate
    this.validator.validateOrThrow(this.entityType, entity);

    // Save to database
    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    await tx.store(this.storeName).add(entity);
    await tx.complete();

    // Update cache
    this.cacheSet(entity.id, entity);

    // Notify subscribers
    this.notify('create', entity);

    return entity;
  }

  /**
   * Get entity by ID
   */
  async getById(id) {
    // Check cache first
    if (this.cacheEnabled && this.cache.has(id)) {
      return this.cache.get(id);
    }

    const tx = this.adapter.transaction(this.storeName, 'readonly');
    const entity = await tx.store(this.storeName).get(id);

    if (entity) {
      this.cacheSet(id, entity);
    }

    return entity || null;
  }

  /**
   * Get all entities (excluding soft-deleted)
   */
  async getAll(includeDeleted = false) {
    const tx = this.adapter.transaction(this.storeName, 'readonly');
    const all = await tx.store(this.storeName).getAll();

    // Filter out soft-deleted unless requested
    const filtered = includeDeleted 
      ? all 
      : all.filter(e => !e.deletedAt);

    return filtered;
  }

  /**
   * Update entity
   */
  async update(id, updates) {
    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    const store = tx.store(this.storeName);
    
    // Get current entity
    const current = await store.get(id);
    if (!current) {
      throw new Error(`${this.entityType} not found: ${id}`);
    }

    // Optimistic locking check
    if (updates.version !== undefined && updates.version !== current.version) {
      throw new Error(`Version conflict: expected ${current.version}, got ${updates.version}`);
    }

    // Merge updates
    const updated = {
      ...current,
      ...updates,
      version: current.version + 1,
      updatedAt: Date.now()
    };

    // Validate
    this.validator.validateOrThrow(this.entityType, updated);

    // Save
    await store.put(updated);
    await tx.complete();

    // Update cache
    this.cacheSet(id, updated);

    // Notify subscribers
    this.notify('update', updated, current);

    return updated;
  }

  /**
   * Delete entity (soft delete by default)
   */
  async delete(id, soft = true) {
    if (soft) {
      return await this.update(id, { deletedAt: Date.now() });
    }

    // Hard delete
    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    const store = tx.store(this.storeName);
    
    const entity = await store.get(id);
    if (!entity) {
      throw new Error(`${this.entityType} not found: ${id}`);
    }

    await store.delete(id);
    await tx.complete();

    // Remove from cache
    this.cache.delete(id);

    // Notify subscribers
    this.notify('delete', entity);

    return entity;
  }

  /**
   * Restore soft-deleted entity
   */
  async restore(id) {
    return await this.update(id, { deletedAt: null });
  }

  /**
   * Find by index
   */
  async findBy(indexName, value) {
    const tx = this.adapter.transaction(this.storeName, 'readonly');
    const store = tx.store(this.storeName);
    
    // Get index
    const index = store.index(indexName);
    const results = await index.getAll(value);

    // Filter out soft-deleted
    return results.filter(e => !e.deletedAt);
  }

  /**
   * Query with filters
   */
  async query(filter) {
    const all = await this.getAll();
    
    return all.filter(entity => {
      return Object.entries(filter).every(([key, value]) => {
        if (typeof value === 'function') {
          return value(entity[key]);
        }
        return entity[key] === value;
      });
    });
  }

  /**
   * Count entities
   */
  async count(includeDeleted = false) {
    const all = await this.getAll(includeDeleted);
    return all.length;
  }

  /**
   * Cache management
   */
  cacheSet(id, entity) {
    if (!this.cacheEnabled) return;
    
    // Evict oldest if cache is full (LRU)
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(id, entity);
  }

  cacheClear() {
    this.cache.clear();
  }

  /**
   * Observer pattern - subscribe to changes
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(action, entity, oldEntity = null) {
    this.subscribers.forEach(callback => {
      try {
        callback({ action, entity, oldEntity });
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  /**
   * Batch operations
   */
  async createMany(entities) {
    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    const store = tx.store(this.storeName);
    
    const created = [];
    for (const data of entities) {
      const entity = {
        id: this.generateId(),
        version: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...this.validator.applyDefaults(this.entityType, data),
        ...data
      };

      this.validator.validateOrThrow(this.entityType, entity);
      await store.add(entity);
      created.push(entity);
    }

    await tx.complete();

    // Update cache and notify
    created.forEach(entity => {
      this.cacheSet(entity.id, entity);
      this.notify('create', entity);
    });

    return created;
  }

  async updateMany(updates) {
    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    const store = tx.store(this.storeName);
    
    const updated = [];
    for (const { id, data } of updates) {
      const current = await store.get(id);
      if (!current) continue;

      const entity = {
        ...current,
        ...data,
        version: current.version + 1,
        updatedAt: Date.now()
      };

      this.validator.validateOrThrow(this.entityType, entity);
      await store.put(entity);
      updated.push(entity);
    }

    await tx.complete();

    updated.forEach(entity => {
      this.cacheSet(entity.id, entity);
      this.notify('update', entity);
    });

    return updated;
  }

  async deleteMany(ids, soft = true) {
    if (soft) {
      const updates = ids.map(id => ({ id, data: { deletedAt: Date.now() } }));
      return await this.updateMany(updates);
    }

    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    const store = tx.store(this.storeName);
    
    for (const id of ids) {
      await store.delete(id);
      this.cache.delete(id);
    }

    await tx.complete();

    ids.forEach(id => this.notify('delete', { id }));
  }
}

