/**
 * Event Repository - Audit log
 */

import { BaseRepository } from './BaseRepository.js';

export class EventRepository extends BaseRepository {
  constructor(adapter, validator) {
    super(adapter, validator, 'events', 'event');
  }

  async getByEntity(entityType, entityId) {
    const all = await this.getAll();
    return all.filter(e => e.entityType === entityType && e.entityId === entityId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async getRecent(limit = 100) {
    const all = await this.getAll();
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  async getByType(eventType) {
    const all = await this.getAll();
    return all.filter(e => e.type === eventType);
  }
}

