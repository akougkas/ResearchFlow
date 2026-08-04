/**
 * Export & Import Engine for ResearchFlow
 * Handles JSON workspace backup/restore and Markdown summary exports.
 */

import { taskStore } from './taskStore.js';

export class ExportImportEngine {
    /**
     * Export full workspace state as a JSON string
     */
    static exportWorkspaceJSON() {
        const tasks = taskStore.getAll();
        const stats = taskStore.getStats();
        
        const payload = {
            version: '1.0.0',
            app: 'ResearchFlow',
            exportedAt: new Date().toISOString(),
            stats: stats,
            tasks: tasks
        };

        return JSON.stringify(payload, null, 2);
    }

    /**
     * Trigger browser download for the JSON export
     */
    static downloadWorkspaceJSON() {
        const jsonStr = this.exportWorkspaceJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `researchflow_workspace_${dateStr}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Export workspace as a human-readable Markdown Research Notebook summary
     */
    static exportNotebookMarkdown() {
        const tasks = taskStore.getAll();
        const stats = taskStore.getStats();
        const dateStr = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        let md = `# 🔬 ResearchFlow - Notebook Export\n`;
        md += `**Generated**: ${dateStr}  \n`;
        md += `**Summary**: ${stats.total} total protocols (${stats.completed} completed, ${stats.pending} active, ${stats.overdue} overdue)\n\n`;

        md += `---\n\n`;
        md += `## 📊 Active Research Protocols\n\n`;

        const categories = {};
        tasks.forEach(t => {
            if (!categories[t.category]) categories[t.category] = [];
            categories[t.category].push(t);
        });

        for (const [cat, catTasks] of Object.entries(categories)) {
            md += `### ${cat.toUpperCase()} (${catTasks.length})\n`;
            catTasks.forEach(t => {
                const statusSymbol = t.completed ? '✅' : '⏳';
                const due = t.dueDate ? ` *(Due: ${t.dueDate})*` : '';
                const prio = `[Priority: ${t.priority.toUpperCase()}]`;
                md += `- ${statusSymbol} **${t.text}** ${prio}${due}\n`;
                if (t.notes) {
                    md += `  > ${t.notes.replace(/\n/g, '\n  > ')}\n`;
                }
                if (t.dependencies && t.dependencies.length > 0) {
                    md += `  - *Prerequisites*: ${t.dependencies.join(', ')}\n`;
                }
            });
            md += `\n`;
        }

        return md;
    }

    /**
     * Trigger browser download for Markdown summary
     */
    static downloadNotebookMarkdown() {
        const mdContent = this.exportNotebookMarkdown();
        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `research_summary_${dateStr}.md`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Validate and import workspace JSON file content
     * @param {string} jsonString 
     * @param {boolean} merge - If true, merges with current tasks; if false, overwrites.
     */
    static importWorkspaceJSON(jsonString, merge = false) {
        try {
            const data = JSON.parse(jsonString);
            if (!data || !Array.isArray(data.tasks)) {
                throw new Error('Invalid ResearchFlow backup format: missing tasks array.');
            }

            const validTasks = data.tasks.filter(t => t.id && t.text);

            if (!merge) {
                // Clear existing tasks safely
                const current = taskStore.getAll();
                current.forEach(t => taskStore.delete(t.id));
            }

            // Create/update imported tasks
            let importedCount = 0;
            validTasks.forEach(t => {
                taskStore.create({
                    id: t.id,
                    text: t.text,
                    category: t.category || 'data',
                    priority: t.priority || 'normal',
                    completed: Boolean(t.completed),
                    dueDate: t.dueDate || null,
                    notes: t.notes || '',
                    dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
                    projectId: t.projectId || null,
                    tags: Array.isArray(t.tags) ? t.tags : []
                });
                importedCount++;
            });

            return { success: true, count: importedCount };
        } catch (err) {
            console.error('Import failed:', err);
            return { success: false, error: err.message };
        }
    }
}
