/**
 * Metadata Repository - Key-value store for app settings
 */

export class MetadataRepository {
  constructor(adapter, validator) {
    this.adapter = adapter;
    this.validator = validator;
    this.storeName = 'metadata';
  }

  async get(key) {
    const tx = this.adapter.transaction(this.storeName, 'readonly');
    const result = await tx.store(this.storeName).get(key);
    return result || null;
  }

  async set(key, value) {
    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    const metadata = {
      key,
      value,
      updatedAt: Date.now()
    };
    
    await tx.store(this.storeName).put(metadata);
    await tx.complete();
    
    return metadata;
  }

  async delete(key) {
    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    await tx.store(this.storeName).delete(key);
    await tx.complete();
  }

  async getAll() {
    const tx = this.adapter.transaction(this.storeName, 'readonly');
    return await tx.store(this.storeName).getAll();
  }

  async clear() {
    const tx = this.adapter.transaction(this.storeName, 'readwrite');
    await tx.store(this.storeName).clear();
    await tx.complete();
  }
}

