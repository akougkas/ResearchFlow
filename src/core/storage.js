const STORAGE_KEYS = Object.freeze({
    tasks: 'gnosis.tasks.v1',
    settings: 'gnosis.settings.v1',
    projects: 'gnosis.projects.v1',
});

const LEGACY_KEYS = Object.freeze({
    tasks: 'rf.tasks.v1',
    settings: 'rf.settings.v1',
    projects: 'rf.projects.v1',
});

class StorageManager {
    constructor(storage = globalThis.localStorage) {
        this.storage = storage;
        this.version = 1;
    }

    resolveKey(name) {
        const key = STORAGE_KEYS[name];
        if (!key) throw new Error(`Unknown storage collection: ${name}`);
        return key;
    }

    save(name, data) {
        if (!this.storage) return false;
        try {
            this.storage.setItem(
                this.resolveKey(name),
                JSON.stringify({ version: this.version, savedAt: new Date().toISOString(), data }),
            );
            return true;
        } catch (error) {
            console.error('Unable to save workspace:', error);
            return false;
        }
    }

    load(name) {
        if (!this.storage) return null;
        try {
            const key = this.resolveKey(name);
            const raw = this.storage.getItem(key) ?? this.storage.getItem(LEGACY_KEYS[name]);
            if (!raw) return null;
            const payload = JSON.parse(raw);
            if (!payload || payload.version !== this.version || !('data' in payload)) return null;

            // Migrate a valid legacy payload once, without deleting its recovery copy.
            if (!this.storage.getItem(key)) this.save(name, payload.data);
            return payload.data;
        } catch (error) {
            console.error('Unable to load workspace:', error);
            return null;
        }
    }

    remove(name) {
        if (!this.storage) return false;
        this.storage.removeItem(this.resolveKey(name));
        return true;
    }

    clearAll() {
        if (!this.storage) return false;
        Object.values(STORAGE_KEYS).forEach((key) => this.storage.removeItem(key));
        return true;
    }

    getStats() {
        if (!this.storage) return { totalSize: 0, keys: [] };
        const keys = Object.entries(STORAGE_KEYS).map(([name, key]) => ({
            name,
            size: new Blob([this.storage.getItem(key) || '']).size,
        }));
        return { totalSize: keys.reduce((sum, entry) => sum + entry.size, 0), keys };
    }
}

export const storage = new StorageManager();
export { LEGACY_KEYS, STORAGE_KEYS, StorageManager };
