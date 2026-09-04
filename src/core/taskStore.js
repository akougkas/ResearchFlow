import { Task } from './data-models.js';
import { storage } from './storage.js';

class TaskStore {
    constructor() {
        this.tasks = [];
        this.subscribers = []; // Observer pattern: list of callbacks
        this.load();
    }

    // Observer pattern: subscribe to state changes
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            // Return unsubscribe function
            this.subscribers = this.subscribers.filter((cb) => cb !== callback);
        };
    }

    // Notify all subscribers of state changes
    notify() {
        this.subscribers.forEach((callback) => {
            try {
                callback(this.tasks);
            } catch (error) {
                console.error('Subscriber callback error:', error);
            }
        });
    }

    load() {
        const data = storage.load('tasks');
        if (data && Array.isArray(data)) {
            this.tasks = data.map((t) => Task.fromJSON(t));
            this.notify(); // Notify after initial load
        }
    }

    save() {
        const success = storage.save(
            'tasks',
            this.tasks.map((t) => t.toJSON()),
        );
        if (success) {
            this.notify(); // Notify observers after save
        }
        return success;
    }

    create(taskData) {
        const task = new Task(taskData);
        task.validate();
        this.validateDependencies(task); // Check for circular dependencies
        this.resolveLinks(task); // Resolve [[Task:id]] links from notes
        this.tasks.push(task);
        this.updateBacklinks(task); // Update inward links for other tasks
        this.save();
        return task;
    }

    /**
     * Create multiple tasks from template with dependency resolution
     * Maps template task indices to actual task IDs
     */
    createFromTemplate(generatedTasks) {
        const createdTasks = [];
        const indexToIdMap = {}; // Maps original index to created task ID

        try {
            // First pass: Create all tasks with empty dependencies
            generatedTasks.forEach((taskData, index) => {
                const task = new Task({
                    ...taskData,
                    dependencies: [], // Start with no dependencies
                });
                task.validate();
                this.tasks.push(task);
                indexToIdMap[index] = task.id;
                createdTasks.push(task);
            });

            // Second pass: Resolve and update dependencies
            generatedTasks.forEach((taskData, index) => {
                const createdTask = createdTasks[index];
                if (taskData.dependencies && Array.isArray(taskData.dependencies)) {
                    // Convert indices to actual task IDs
                    createdTask.dependencies = taskData.dependencies
                        .map((depIndex) => indexToIdMap[depIndex])
                        .filter((id) => id !== undefined);

                    // Validate final dependencies
                    this.validateDependencies(createdTask);
                }
            });

            this.save();
            return createdTasks;
        } catch (error) {
            // Rollback: remove all created tasks if any validation fails
            createdTasks.forEach((task) => {
                const idx = this.tasks.indexOf(task);
                if (idx !== -1) {
                    this.tasks.splice(idx, 1);
                }
            });
            throw error;
        }
    }

    getAll() {
        return [...this.tasks];
    }

    getById(id) {
        return this.tasks.find((t) => t.id === id);
    }

    update(id, updates) {
        const task = this.getById(id);
        if (!task) throw new Error('Task not found');

        const oldLinks = [...(task.links || [])];
        const candidate = new Task({
            ...task.toJSON(),
            ...updates,
            id: task.id,
            updatedAt: Date.now(),
        });
        candidate.validate();

        // If dependencies changed, validate them
        if (updates.dependencies !== undefined) {
            this.validateDependencies(candidate);
        }

        Object.assign(task, candidate.toJSON());

        // Refresh links if notes or text changed
        if (updates.notes !== undefined || updates.text !== undefined) {
            this.resolveLinks(task);
            this.updateBacklinks(task, oldLinks);
        }

        this.save();
        return task;
    }

    /**
     * Atomically replace or merge workspace tasks.
     * The candidate graph is fully validated before live state is changed.
     */
    importTasks(taskData, { merge = false } = {}) {
        if (!Array.isArray(taskData)) throw new Error('Tasks must be an array');

        const existing = merge ? this.tasks.map((task) => task.toJSON()) : [];
        const candidates = [...existing, ...taskData].map((data) => new Task(data));
        const ids = new Set();

        candidates.forEach((task) => {
            task.validate();
            if (ids.has(task.id)) throw new Error(`Duplicate task ID: ${task.id}`);
            ids.add(task.id);
        });

        candidates.forEach((task) => {
            for (const dependencyId of task.dependencies || []) {
                if (dependencyId === task.id) throw new Error('Task cannot depend on itself');
                if (!ids.has(dependencyId))
                    throw new Error(`Dependency not found: ${dependencyId}`);
            }
        });

        const byId = new Map(candidates.map((task) => [task.id, task]));
        const visited = new Set();
        const active = new Set();
        const visit = (task) => {
            if (active.has(task.id)) {
                throw new Error('Circular dependency detected. Task dependencies form a cycle.');
            }
            if (visited.has(task.id)) return;
            active.add(task.id);
            (task.dependencies || []).forEach((id) => visit(byId.get(id)));
            active.delete(task.id);
            visited.add(task.id);
        };
        candidates.forEach(visit);

        // Rebuild wiki links and backlinks against the complete imported set.
        candidates.forEach((task) => {
            task.links = [];
            task.backlinks = [];
        });
        candidates.forEach((task) => {
            const content = `${task.text} ${task.notes || ''}`;
            const matches = [...content.matchAll(/\[\[Task:(task_[^\]]+)\]\]/g)];
            task.links = [...new Set(matches.map((match) => match[1]))].filter((id) =>
                byId.has(id),
            );
            task.links.forEach((id) => byId.get(id).backlinks.push(task.id));
        });

        const previous = this.tasks;
        this.tasks = candidates;
        if (!this.save()) {
            this.tasks = previous;
            throw new Error('Unable to persist imported workspace');
        }
        return taskData.length;
    }

    delete(id) {
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index === -1) throw new Error('Task not found');

        // Remove this task from other tasks' dependencies and backlinks
        this.tasks.forEach((task) => {
            if (task.dependencies.includes(id)) {
                task.dependencies = task.dependencies.filter((depId) => depId !== id);
            }
            if (task.links && task.links.includes(id)) {
                task.links = task.links.filter((linkId) => linkId !== id);
            }
            if (task.backlinks && task.backlinks.includes(id)) {
                task.backlinks = task.backlinks.filter((linkId) => linkId !== id);
            }
        });

        const deleted = this.tasks.splice(index, 1)[0];
        this.save();
        return deleted;
    }

    toggleComplete(id) {
        const task = this.getById(id);
        if (!task) throw new Error('Task not found');

        task.toggleComplete();
        this.save();
        return task;
    }

    /**
     * Check if a task can be completed (all dependencies are completed)
     */
    canComplete(taskId) {
        const task = this.getById(taskId);
        if (!task) return false;

        if (!task.dependencies || task.dependencies.length === 0) {
            return true;
        }

        return task.dependencies.every((depId) => {
            const depTask = this.getById(depId);
            return depTask && depTask.completed;
        });
    }

    /**
     * Get tasks that depend on a given task
     */
    getDependentTasks(taskId) {
        return this.tasks.filter((task) => task.dependencies && task.dependencies.includes(taskId));
    }

    /**
     * Get all unblocked tasks (tasks with all dependencies completed or no dependencies)
     */
    getUnblockedTasks() {
        return this.tasks.filter((task) => this.canComplete(task.id));
    }

    /**
     * Get all blocked tasks (tasks with incomplete dependencies)
     */
    getBlockedTasks() {
        return this.tasks.filter((task) => !this.canComplete(task.id) && !task.completed);
    }

    /**
     * Validate dependencies for a task
     * Checks for circular dependencies and invalid task references
     */
    validateDependencies(task) {
        if (!task.dependencies || task.dependencies.length === 0) {
            return true;
        }

        // Check for self-dependency
        if (task.dependencies.includes(task.id)) {
            throw new Error('Task cannot depend on itself');
        }

        // Check all dependencies exist
        task.dependencies.forEach((depId) => {
            if (!this.getById(depId)) {
                throw new Error(`Dependency not found: ${depId}`);
            }
        });

        // Check for circular dependencies
        const getTask = (id) => (id === task.id ? task : this.getById(id));
        const visited = new Set();
        const recursionStack = new Set();

        const hasCycle = (taskId) => {
            visited.add(taskId);
            recursionStack.add(taskId);

            const currentTask = getTask(taskId);
            if (currentTask && currentTask.dependencies) {
                for (const depId of currentTask.dependencies) {
                    if (!visited.has(depId)) {
                        if (hasCycle(depId)) {
                            return true;
                        }
                    } else if (recursionStack.has(depId)) {
                        return true; // Found a cycle
                    }
                }
            }

            recursionStack.delete(taskId);
            return false;
        };

        if (hasCycle(task.id)) {
            throw new Error('Circular dependency detected. Task dependencies form a cycle.');
        }

        return true;
    }

    /**
     * Parse notes/text for [[Task:id]] format
     */
    resolveLinks(task) {
        const combinedContent = `${task.text} ${task.notes || ''}`;
        const regex = /\[\[Task:(task_[^\]]+)\]\]/g;
        const matches = [...combinedContent.matchAll(regex)];

        const linkedIds = [...new Set(matches.map((m) => m[1]))];
        task.links = linkedIds.filter((id) => this.getById(id));
    }

    /**
     * Update backlinks in target tasks
     */
    updateBacklinks(task, oldLinks = []) {
        // New links to add backlink to
        const toAdd = task.links.filter((id) => !oldLinks.includes(id));
        // Old links to remove backlink from
        const toRemove = oldLinks.filter((id) => !task.links.includes(id));

        toAdd.forEach((id) => {
            const target = this.getById(id);
            if (target) {
                if (!target.backlinks) target.backlinks = [];
                if (!target.backlinks.includes(task.id)) {
                    target.backlinks.push(task.id);
                }
            }
        });

        toRemove.forEach((id) => {
            const target = this.getById(id);
            if (target && target.backlinks) {
                target.backlinks = target.backlinks.filter((bid) => bid !== task.id);
            }
        });
    }

    // Filtering methods
    filterByCategory(category) {
        return this.tasks.filter((t) => t.category === category);
    }

    filterByPriority(priority) {
        return this.tasks.filter((t) => t.priority === priority);
    }

    filterByCompleted(completed = true) {
        return this.tasks.filter((t) => t.completed === completed);
    }

    filterByDueDate(startDate, endDate) {
        return this.tasks.filter((t) => {
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            return due >= startDate && due <= endDate;
        });
    }

    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.tasks.filter(
            (t) =>
                t.text.toLowerCase().includes(lowerQuery) ||
                t.notes.toLowerCase().includes(lowerQuery) ||
                t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
        );
    }

    // Sorting methods
    sortByDate(ascending = false) {
        return [...this.tasks].sort((a, b) => {
            return ascending ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
        });
    }

    sortByPriority() {
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        return [...this.tasks].sort((a, b) => {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    sortByDueDate() {
        return [...this.tasks].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }

    // Statistics
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter((t) => t.completed).length;
        const overdue = this.tasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed,
        ).length;
        const blocked = this.getBlockedTasks().length;

        return {
            total,
            completed,
            pending: total - completed,
            overdue,
            blocked,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
        };
    }
}

export const taskStore = new TaskStore();
