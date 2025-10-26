/**
 * Template Repository
 */

import { BaseRepository } from './BaseRepository.js';

export class TemplateRepository extends BaseRepository {
  constructor(adapter, validator) {
    super(adapter, validator, 'templates', 'template');
  }

  async getBuiltin() {
    return await this.findBy('builtin', true);
  }

  async getCustom() {
    return await this.findBy('builtin', false);
  }

  async getByCategory(category) {
    return await this.findBy('category', category);
  }
}

