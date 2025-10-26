/**
 * IndexedDB Adapter - Low-level database interface
 * Wraps IndexedDB API with Promises and error handling
 */

export class IndexedDBAdapter {
  constructor(dbName, version) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.stores = new Map();
  }

  /**
   * Open database connection
   * @param {Object} schema - Database schema definition
   */
  async open(schema) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        
        // Handle unexpected close
        this.db.onversionchange = () => {
          this.db.close();
          console.warn('Database version changed. Please reload the page.');
        };
        
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.handleUpgrade(db, schema, event.oldVersion, event.newVersion, event);
      };
    });
  }

  /**
   * Handle database upgrade (schema changes)
   */
  handleUpgrade(db, schema, oldVersion, newVersion, event) {
    console.log(`Upgrading database from v${oldVersion} to v${newVersion}`);

    // Create object stores from schema
    Object.entries(schema.stores).forEach(([storeName, storeConfig]) => {
      let store;
      
      // Create store if it doesn't exist
      if (!db.objectStoreNames.contains(storeName)) {
        store = db.createObjectStore(storeName, {
          keyPath: storeConfig.keyPath || 'id',
          autoIncrement: storeConfig.autoIncrement || false
        });
      } else {
        // Store exists, get it from transaction
        store = event.target.transaction.objectStore(storeName);
      }

      // Create indexes
      if (storeConfig.indexes) {
        storeConfig.indexes.forEach(indexConfig => {
          const indexName = Array.isArray(indexConfig.keyPath)
            ? indexConfig.keyPath.join('_')
            : indexConfig.keyPath;
            
          if (!store.indexNames.contains(indexName)) {
            store.createIndex(indexName, indexConfig.keyPath, {
              unique: indexConfig.unique || false,
              multiEntry: indexConfig.multiEntry || false
            });
          }
        });
      }
    });
  }

  /**
   * Start a transaction
   * @param {string|string[]} storeNames - Store names to include
   * @param {string} mode - 'readonly' or 'readwrite'
   */
  transaction(storeNames, mode = 'readonly') {
    if (!this.db) {
      throw new Error('Database not opened');
    }

    const stores = Array.isArray(storeNames) ? storeNames : [storeNames];
    const tx = this.db.transaction(stores, mode);
    
    return new Transaction(tx, stores);
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Delete database completely
   */
  static async deleteDatabase(dbName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Transaction wrapper - provides clean API for ACID operations
 */
export class Transaction {
  constructor(tx, storeNames) {
    this.tx = tx;
    this.storeNames = storeNames;
    this.stores = new Map();
    
    // Create store accessors
    storeNames.forEach(name => {
      this.stores.set(name, new StoreAccessor(tx.objectStore(name)));
    });
  }

  /**
   * Get store accessor
   */
  store(name) {
    if (!this.stores.has(name)) {
      throw new Error(`Store '${name}' not in transaction`);
    }
    return this.stores.get(name);
  }

  /**
   * Wait for transaction to complete
   */
  async complete() {
    return new Promise((resolve, reject) => {
      this.tx.oncomplete = () => resolve();
      this.tx.onerror = () => reject(this.tx.error);
      this.tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  /**
   * Abort transaction
   */
  abort() {
    this.tx.abort();
  }
}

/**
 * Store accessor - provides CRUD operations on a single store
 */
class StoreAccessor {
  constructor(store) {
    this.store = store;
  }

  /**
   * Get single item by key
   */
  async get(key) {
    return this._promisify(this.store.get(key));
  }

  /**
   * Get all items
   */
  async getAll(query = null, count = null) {
    return this._promisify(this.store.getAll(query, count));
  }

  /**
   * Add new item (fails if key exists)
   */
  async add(value) {
    return this._promisify(this.store.add(value));
  }

  /**
   * Put item (upsert - add or update)
   */
  async put(value) {
    return this._promisify(this.store.put(value));
  }

  /**
   * Delete item by key
   */
  async delete(key) {
    return this._promisify(this.store.delete(key));
  }

  /**
   * Clear all items
   */
  async clear() {
    return this._promisify(this.store.clear());
  }

  /**
   * Count items
   */
  async count(query = null) {
    return this._promisify(this.store.count(query));
  }

  /**
   * Get all keys
   */
  async getAllKeys(query = null, count = null) {
    return this._promisify(this.store.getAllKeys(query, count));
  }

  /**
   * Get index accessor
   */
  index(name) {
    return new IndexAccessor(this.store.index(name));
  }

  /**
   * Open cursor for iteration
   */
  async openCursor(query = null, direction = 'next') {
    return this.store.openCursor(query, direction);
  }

  /**
   * Convert IDBRequest to Promise
   */
  _promisify(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Index accessor - for indexed queries
 */
class IndexAccessor {
  constructor(index) {
    this.index = index;
  }

  async get(key) {
    return this._promisify(this.index.get(key));
  }

  async getAll(query = null, count = null) {
    return this._promisify(this.index.getAll(query, count));
  }

  async getAllKeys(query = null, count = null) {
    return this._promisify(this.index.getAllKeys(query, count));
  }

  async count(query = null) {
    return this._promisify(this.index.count(query));
  }

  async openCursor(query = null, direction = 'next') {
    return this.index.openCursor(query, direction);
  }

  _promisify(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

