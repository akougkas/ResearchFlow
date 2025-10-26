/**
 * Validation Layer - Validates data against JSON schemas
 * Uses Ajv for JSON Schema validation
 */

import { SCHEMAS } from './schemas.js';

export class Validator {
  constructor() {
    this.schemas = SCHEMAS;
    this.cache = new Map();
  }

  /**
   * Validate data against a schema
   * @param {string} schemaName - Name of schema (task, project, etc.)
   * @param {Object} data - Data to validate
   * @param {boolean} partial - Allow partial objects (for updates)
   * @returns {Object} { valid: boolean, errors: array }
   */
  validate(schemaName, data, partial = false) {
    const schema = this.schemas[schemaName];
    
    if (!schema) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    try {
      const result = this._validateAgainstSchema(schema, data, partial);
      return { valid: result.valid, errors: result.errors || [] };
    } catch (error) {
      return {
        valid: false,
        errors: [{ message: error.message, path: null }]
      };
    }
  }

  /**
   * Validate and throw if invalid
   */
  validateOrThrow(schemaName, data, partial = false) {
    const result = this.validate(schemaName, data, partial);
    
    if (!result.valid) {
      const errorMessages = result.errors
        .map(e => `${e.path ? e.path + ': ' : ''}${e.message}`)
        .join(', ');
      throw new ValidationError(`Validation failed: ${errorMessages}`, result.errors);
    }
    
    return true;
  }

  /**
   * Apply defaults from schema
   */
  applyDefaults(schemaName, data) {
    const schema = this.schemas[schemaName];
    const result = { ...data };
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        if (result[key] === undefined && 'default' in prop) {
          result[key] = typeof prop.default === 'function' 
            ? prop.default() 
            : prop.default;
        }
      });
    }
    
    return result;
  }

  /**
   * Simple schema validation implementation
   * (In production, use Ajv or similar library)
   */
  _validateAgainstSchema(schema, data, partial = false) {
    const errors = [];
    
    // Check type
    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      if (schema.type !== actualType && data !== null) {
        errors.push({
          path: '',
          message: `Expected type ${schema.type}, got ${actualType}`
        });
        return { valid: false, errors };
      }
    }

    // Check required fields (skip if partial)
    if (!partial && schema.required) {
      schema.required.forEach(field => {
        if (!(field in data)) {
          errors.push({
            path: field,
            message: `Required field '${field}' is missing`
          });
        }
      });
    }

    // Check properties
    if (schema.properties) {
      Object.entries(data).forEach(([key, value]) => {
        const propSchema = schema.properties[key];
        
        // Unknown property check
        if (!propSchema && schema.additionalProperties === false) {
          errors.push({
            path: key,
            message: `Unknown property '${key}'`
          });
          return;
        }
        
        if (propSchema) {
          // Nullable check
          if (value === null) {
            if (!propSchema.nullable) {
              errors.push({
                path: key,
                message: `'${key}' cannot be null`
              });
            }
            return; // Skip other checks for null
          }

          // Type check
          if (propSchema.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (propSchema.type !== actualType && value !== undefined) {
              errors.push({
                path: key,
                message: `'${key}' expected type ${propSchema.type}, got ${actualType}`
              });
              return;
            }
          }

          // String validations
          if (propSchema.type === 'string' && typeof value === 'string') {
            if (propSchema.minLength && value.length < propSchema.minLength) {
              errors.push({
                path: key,
                message: `'${key}' must be at least ${propSchema.minLength} characters`
              });
            }
            if (propSchema.maxLength && value.length > propSchema.maxLength) {
              errors.push({
                path: key,
                message: `'${key}' must be at most ${propSchema.maxLength} characters`
              });
            }
            if (propSchema.pattern && !new RegExp(propSchema.pattern).test(value)) {
              errors.push({
                path: key,
                message: `'${key}' does not match required pattern`
              });
            }
            if (propSchema.enum && !propSchema.enum.includes(value)) {
              errors.push({
                path: key,
                message: `'${key}' must be one of: ${propSchema.enum.join(', ')}`
              });
            }
          }

          // Number validations
          if (propSchema.type === 'number' || propSchema.type === 'integer') {
            if (typeof value === 'number') {
              if (propSchema.minimum !== undefined && value < propSchema.minimum) {
                errors.push({
                  path: key,
                  message: `'${key}' must be >= ${propSchema.minimum}`
                });
              }
              if (propSchema.maximum !== undefined && value > propSchema.maximum) {
                errors.push({
                  path: key,
                  message: `'${key}' must be <= ${propSchema.maximum}`
                });
              }
              if (propSchema.type === 'integer' && !Number.isInteger(value)) {
                errors.push({
                  path: key,
                  message: `'${key}' must be an integer`
                });
              }
            }
          }

          // Array validations
          if (propSchema.type === 'array' && Array.isArray(value)) {
            if (propSchema.minItems && value.length < propSchema.minItems) {
              errors.push({
                path: key,
                message: `'${key}' must have at least ${propSchema.minItems} items`
              });
            }
            if (propSchema.maxItems && value.length > propSchema.maxItems) {
              errors.push({
                path: key,
                message: `'${key}' must have at most ${propSchema.maxItems} items`
              });
            }
            if (propSchema.uniqueItems) {
              const unique = new Set(value.map(v => JSON.stringify(v)));
              if (unique.size !== value.length) {
                errors.push({
                  path: key,
                  message: `'${key}' must have unique items`
                });
              }
            }
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Singleton instance
export const validator = new Validator();

