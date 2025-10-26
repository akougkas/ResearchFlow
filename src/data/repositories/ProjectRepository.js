/**
 * Project Repository
 */

import { BaseRepository } from './BaseRepository.js';

export class ProjectRepository extends BaseRepository {
  constructor(adapter, validator) {
    super(adapter, validator, 'projects', 'project');
  }

  async getArchived() {
    return await this.findBy('archived', true);
  }

  async getActive() {
    return await this.findBy('archived', false);
  }

  async archive(id) {
    return await this.update(id, { archived: true });
  }

  async unarchive(id) {
    return await this.update(id, { archived: false });
  }
}

