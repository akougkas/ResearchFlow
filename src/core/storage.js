import { db } from '../data/Database.js';

// Versioned storage keys for safe data migration
const STORAGE_KEYS = {
  tasks: 'rf.tasks.v1',
  settings: 'rf.settings.v1',
  projects: 'rf.projects.v1'
};

class StorageManager {
  constructor() {
    this.keys = STORAGE_KEYS;
    this.version = 1;
    this.initDatabase();
  }

  async initDatabase() {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await db.open();
      }
    } catch (err) {
      console.warn('IndexedDB initialization deferred or unavailable:', err);
    }
  }

  // Save data to a specific versioned key and sync to IndexedDB
  save(key, data) {
    try {
      const storageKey = this.keys[key];
      if (!storageKey) {
        throw new Error(`Unknown storage key: ${key}`);
      }

      const payload = {
        version: this.version,
        timestamp: Date.now(),
        data: data
      };
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(payload));
      }

      // Async backup sync to IndexedDB if open
      if (db && db.isOpen) {
        if (key === 'tasks' && Array.isArray(data)) {
          Promise.all(data.map(t => db.tasks.put(t))).catch(err => console.warn('IndexedDB task sync error:', err));
        } else if (key === 'projects' && Array.isArray(data)) {
          Promise.all(data.map(p => db.projects.put(p))).catch(err => console.warn('IndexedDB project sync error:', err));
        }
      }

      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        this.handleQuotaExceeded();
      }
      console.error('Storage save failed:', error);
      return false;
    }
  }

  // Load data from a specific versioned key
  load(key) {
    try {
      const storageKey = this.keys[key];
      if (!storageKey) {
        throw new Error(`Unknown storage key: ${key}`);
      }

      if (typeof localStorage === 'undefined') return null;

      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      
      const payload = JSON.parse(raw);
      
      // Version migration logic
      if (payload.version !== this.version) {
        return this.migrate(key, payload);
      }
      
      return payload.data;
    } catch (error) {
      console.error('Storage load failed:', error);
      return null;
    }
  }

  // Remove data from a specific key
  remove(key) {
    try {
      const storageKey = this.keys[key];
      if (!storageKey) {
        throw new Error(`Unknown storage key: ${key}`);
      }
      
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
      return true;
    } catch (error) {
      console.error('Storage remove failed:', error);
      return false;
    }
  }

  // Clear all ResearchFlow data
  clearAll() {
    try {
      if (typeof localStorage !== 'undefined') {
        Object.values(this.keys).forEach(key => {
          localStorage.removeItem(key);
        });
      }
      return true;
    } catch (error) {
      console.error('Storage clear failed:', error);
      return false;
    }
  }

  // Handle data migration between versions
  migrate(key, oldPayload) {
    console.log(`Migrating ${key} from version ${oldPayload.version} to ${this.version}`);
    
    // Add migration logic here as versions change
    // Example: if (oldPayload.version === 0) { /* transform data */ }
    
    return oldPayload.data;
  }

  // Handle storage quota exceeded
  handleQuotaExceeded() {
    // Could implement cleanup strategies here
    // For now, just alert the user
    console.warn('Storage is full. Consider exporting and clearing old data.');
  }

  // Get storage size for a specific key
  getStorageSize(key) {
    const storageKey = this.keys[key];
    if (!storageKey) return 0;
    
    const data = localStorage.getItem(storageKey);
    return data ? new Blob([data]).size : 0;
  }

  // Get total storage size
  getTotalSize() {
    return Object.keys(this.keys).reduce((total, key) => {
      return total + this.getStorageSize(key);
    }, 0);
  }

  // Get storage statistics
  getStats() {
    const totalSize = this.getTotalSize();
    const maxSize = 5 * 1024 * 1024; // ~5MB typical localStorage limit
    
    return {
      totalSize,
      maxSize,
      percentUsed: ((totalSize / maxSize) * 100).toFixed(2),
      keys: Object.keys(this.keys).map(key => ({
        name: key,
        size: this.getStorageSize(key)
      }))
    };
  }
}

export const storage = new StorageManager();
export { STORAGE_KEYS };

