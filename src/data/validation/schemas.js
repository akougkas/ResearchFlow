/**
 * JSON Schema Definitions for Data Validation
 * Every entity has strict schema validation
 */

/**
 * Task Schema
 */
export const TaskSchema = {
  type: 'object',
  required: ['id', 'text', 'category', 'priority', 'completed', 'createdAt', 'updatedAt'],
  properties: {
    // Identity
    id: {
      type: 'string',
      pattern: '^task_[0-9]+_[a-z0-9]+$'
    },
    version: {
      type: 'integer',
      minimum: 0,
      default: 0
    },
    
    // Core fields
    text: {
      type: 'string',
      minLength: 1,
      maxLength: 500
    },
    category: {
      type: 'string',
      enum: ['data', 'experiment', 'writing', 'funding', 'presentation', 'literature']
    },
    priority: {
      type: 'string',
      enum: ['critical', 'high', 'normal', 'low']
    },
    status: {
      type: 'string',
      enum: ['in-progress', 'review'],
      nullable: true
    },
    completed: {
      type: 'boolean'
    },
    
    // Relationships
    projectId: {
      type: 'string',
      pattern: '^project_[0-9]+_[a-z0-9]+$',
      nullable: true
    },
    dependencies: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^task_[0-9]+_[a-z0-9]+$'
      },
      uniqueItems: true,
      default: []
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      default: []
    },
    templateId: {
      type: 'string',
      pattern: '^template_[0-9]+_[a-z0-9]+$',
      nullable: true
    },
    
    // Metadata
    dueDate: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$', // YYYY-MM-DD
      nullable: true
    },
    notes: {
      type: 'string',
      maxLength: 10000,
      default: ''
    },
    estimatedHours: {
      type: 'number',
      minimum: 0,
      maximum: 1000,
      nullable: true
    },
    actualHours: {
      type: 'number',
      minimum: 0,
      maximum: 1000,
      nullable: true
    },
    
    // Timestamps
    createdAt: {
      type: 'integer',
      minimum: 0
    },
    updatedAt: {
      type: 'integer',
      minimum: 0
    },
    completedAt: {
      type: 'integer',
      minimum: 0,
      nullable: true
    },
    deletedAt: {
      type: 'integer',
      minimum: 0,
      nullable: true
    },
    
    // Sync (future)
    syncStatus: {
      type: 'string',
      enum: ['local', 'syncing', 'synced', 'conflict'],
      default: 'local'
    },
    lastSyncedAt: {
      type: 'integer',
      minimum: 0,
      nullable: true
    },
    syncVersion: {
      type: 'integer',
      minimum: 0,
      default: 0
    }
  },
  additionalProperties: false
};

/**
 * Project Schema
 */
export const ProjectSchema = {
  type: 'object',
  required: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
  properties: {
    id: {
      type: 'string',
      pattern: '^project_[0-9]+_[a-z0-9]+$'
    },
    version: {
      type: 'integer',
      minimum: 0,
      default: 0
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    description: {
      type: 'string',
      maxLength: 5000,
      default: ''
    },
    color: {
      type: 'string',
      pattern: '^#[0-9A-Fa-f]{6}$'
    },
    archived: {
      type: 'boolean',
      default: false
    },
    startDate: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      nullable: true
    },
    endDate: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      nullable: true
    },
    createdAt: {
      type: 'integer',
      minimum: 0
    },
    updatedAt: {
      type: 'integer',
      minimum: 0
    },
    deletedAt: {
      type: 'integer',
      minimum: 0,
      nullable: true
    },
    syncStatus: {
      type: 'string',
      enum: ['local', 'syncing', 'synced', 'conflict'],
      default: 'local'
    },
    lastSyncedAt: {
      type: 'integer',
      minimum: 0,
      nullable: true
    },
    syncVersion: {
      type: 'integer',
      minimum: 0,
      default: 0
    }
  },
  additionalProperties: false
};

/**
 * Template Schema
 */
export const TemplateSchema = {
  type: 'object',
  required: ['id', 'name', 'category', 'tasks', 'createdAt', 'updatedAt'],
  properties: {
    id: {
      type: 'string',
      pattern: '^template_[0-9]+_[a-z0-9]+$'
    },
    version: {
      type: 'integer',
      minimum: 0,
      default: 0
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    description: {
      type: 'string',
      maxLength: 1000,
      default: ''
    },
    category: {
      type: 'string',
      enum: ['data', 'experiment', 'writing', 'funding', 'presentation', 'literature']
    },
    estimatedDuration: {
      type: 'integer',
      minimum: 1,
      maximum: 365
    },
    builtin: {
      type: 'boolean',
      default: false
    },
    tasks: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['text', 'category', 'priority', 'daysFromStart'],
        properties: {
          text: { type: 'string', minLength: 1, maxLength: 500 },
          category: { type: 'string' },
          priority: { type: 'string', enum: ['critical', 'high', 'normal', 'low'] },
          daysFromStart: { type: 'integer', minimum: 0 },
          notes: { type: 'string', maxLength: 10000 },
          tags: { type: 'array', items: { type: 'string' } },
          dependencies: { 
            type: 'array',
            items: { type: 'integer', minimum: 0 }
          }
        }
      }
    },
    createdAt: {
      type: 'integer',
      minimum: 0
    },
    updatedAt: {
      type: 'integer',
      minimum: 0
    },
    deletedAt: {
      type: 'integer',
      minimum: 0,
      nullable: true
    }
  },
  additionalProperties: false
};

/**
 * Tag Schema
 */
export const TagSchema = {
  type: 'object',
  required: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
  properties: {
    id: {
      type: 'string',
      pattern: '^tag_[0-9]+_[a-z0-9]+$'
    },
    version: {
      type: 'integer',
      minimum: 0,
      default: 0
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50
    },
    color: {
      type: 'string',
      pattern: '^#[0-9A-Fa-f]{6}$'
    },
    createdAt: {
      type: 'integer',
      minimum: 0
    },
    updatedAt: {
      type: 'integer',
      minimum: 0
    }
  },
  additionalProperties: false
};

/**
 * Dependency Schema
 */
export const DependencySchema = {
  type: 'object',
  required: ['id', 'taskId', 'dependsOnId', 'createdAt'],
  properties: {
    id: {
      type: 'string',
      pattern: '^dep_[0-9]+_[a-z0-9]+$'
    },
    taskId: {
      type: 'string',
      pattern: '^task_[0-9]+_[a-z0-9]+$'
    },
    dependsOnId: {
      type: 'string',
      pattern: '^task_[0-9]+_[a-z0-9]+$'
    },
    createdAt: {
      type: 'integer',
      minimum: 0
    }
  },
  additionalProperties: false
};

/**
 * Event Schema
 */
export const EventSchema = {
  type: 'object',
  required: ['id', 'type', 'entityType', 'entityId', 'timestamp'],
  properties: {
    id: {
      type: 'string',
      pattern: '^event_[0-9]+_[a-z0-9]+$'
    },
    type: {
      type: 'string',
      enum: ['create', 'update', 'delete', 'restore']
    },
    entityType: {
      type: 'string',
      enum: ['task', 'project', 'template', 'tag', 'dependency']
    },
    entityId: {
      type: 'string'
    },
    userId: {
      type: 'string',
      nullable: true
    },
    changes: {
      type: 'object',
      properties: {
        before: { type: 'object', nullable: true },
        after: { type: 'object', nullable: true }
      }
    },
    metadata: {
      type: 'object',
      properties: {
        ip: { type: 'string' },
        userAgent: { type: 'string' },
        source: {
          type: 'string',
          enum: ['ui', 'api', 'sync', 'migration']
        }
      }
    },
    timestamp: {
      type: 'integer',
      minimum: 0
    }
  },
  additionalProperties: false
};

/**
 * Schema registry
 */
export const SCHEMAS = {
  task: TaskSchema,
  project: ProjectSchema,
  template: TemplateSchema,
  tag: TagSchema,
  dependency: DependencySchema,
  event: EventSchema
};

