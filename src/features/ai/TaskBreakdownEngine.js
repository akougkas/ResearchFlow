/**
 * TaskBreakdownEngine - AI-powered research task decomposition & template synthesis
 * Parses natural language research goals into structured task graphs with dependencies.
 */

import { CATEGORIES } from '../../config/categories.js';

export class TaskBreakdownEngine {
    /**
     * Pre-defined scientific breakdown templates for common academic workflows
     */
    static TEMPLATES = [
        {
            id: 'manuscript_prep',
            title: 'Paper Manuscript Preparation',
            icon: '📝',
            description: 'Decompose manuscript drafting into figures, methods, results, abstract, and peer review prep.',
            category: 'writing',
            tasks: [
                { text: 'Compile raw figures and generate high-resolution plots', category: 'data', priority: 'high', offsetDays: 2 },
                { text: 'Write Methods & Materials section', category: 'writing', priority: 'normal', offsetDays: 5, dependsOnPrev: true },
                { text: 'Draft Results section with statistical significance', category: 'writing', priority: 'high', offsetDays: 10, dependsOnPrev: true },
                { text: 'Draft Introduction & Discussion sections', category: 'writing', priority: 'normal', offsetDays: 15, dependsOnPrev: true },
                { text: 'Finalize Abstract & Keywords', category: 'writing', priority: 'high', offsetDays: 18, dependsOnPrev: true },
                { text: 'Internal co-author review & revision incorporation', category: 'writing', priority: 'critical', offsetDays: 25, dependsOnPrev: true },
                { text: 'Format references & submit to target journal portal', category: 'presentation', priority: 'critical', offsetDays: 30, dependsOnPrev: true }
            ]
        },
        {
            id: 'grant_application',
            title: 'Research Grant / NIH R01 Proposal',
            icon: '💰',
            description: 'Structured 45-day workflow for grant proposal drafting, budgeting, and institutional approval.',
            category: 'funding',
            tasks: [
                { text: 'Formulate Specific Aims & Core Hypothesis', category: 'writing', priority: 'critical', offsetDays: 3 },
                { text: 'Conduct comprehensive Literature Review for preliminary rationale', category: 'literature', priority: 'high', offsetDays: 7 },
                { text: 'Gather Preliminary Data figures & validation experiments', category: 'data', priority: 'critical', offsetDays: 14, dependsOnPrev: true },
                { text: 'Draft Research Strategy (Significance & Innovation)', category: 'writing', priority: 'high', offsetDays: 24, dependsOnPrev: true },
                { text: 'Draft Detailed Methods & Experimental Approach', category: 'experiment', priority: 'high', offsetDays: 32, dependsOnPrev: true },
                { text: 'Prepare Budget Justification & Equipment lists', category: 'funding', priority: 'normal', offsetDays: 38 },
                { text: 'Submit to Institutional Sponsored Research office for sign-off', category: 'funding', priority: 'critical', offsetDays: 45, dependsOnPrev: true }
            ]
        },
        {
            id: 'experiment_protocol',
            title: 'Lab Experiment & Assay Execution',
            icon: '🧪',
            description: 'End-to-end experiment pipeline: design, sample prep, assay run, and data extraction.',
            category: 'experiment',
            tasks: [
                { text: 'Finalize experimental design & control groups', category: 'experiment', priority: 'high', offsetDays: 1 },
                { text: 'Reagent procurement & inventory check', category: 'experiment', priority: 'normal', offsetDays: 3, dependsOnPrev: true },
                { text: 'Prepare biological samples & culture media', category: 'experiment', priority: 'high', offsetDays: 5, dependsOnPrev: true },
                { text: 'Execute assay / instrument run & record raw telemetry', category: 'experiment', priority: 'critical', offsetDays: 7, dependsOnPrev: true },
                { text: 'Perform primary data cleaning & quality assessment', category: 'data', priority: 'high', offsetDays: 9, dependsOnPrev: true },
                { text: 'Statistical analysis & hypothesis testing', category: 'data', priority: 'critical', offsetDays: 12, dependsOnPrev: true }
            ]
        },
        {
            id: 'literature_systematic',
            title: 'Systematic Literature Review',
            icon: '📚',
            description: 'PRISMA-compliant literature search, screening, data extraction, and meta-analysis synthesis.',
            category: 'literature',
            tasks: [
                { text: 'Define inclusion/exclusion criteria & search queries', category: 'literature', priority: 'high', offsetDays: 2 },
                { text: 'Execute search across PubMed, IEEE, Scopus & Web of Science', category: 'literature', priority: 'normal', offsetDays: 5, dependsOnPrev: true },
                { text: 'Screen titles and abstracts for relevance', category: 'literature', priority: 'high', offsetDays: 10, dependsOnPrev: true },
                { text: 'Full-text review of candidate papers & quality assessment', category: 'literature', priority: 'high', offsetDays: 18, dependsOnPrev: true },
                { text: 'Extract key parameters into matrix table', category: 'data', priority: 'normal', offsetDays: 24, dependsOnPrev: true },
                { text: 'Synthesize findings & draft review paper', category: 'writing', priority: 'critical', offsetDays: 30, dependsOnPrev: true }
            ]
        }
    ];

    /**
     * Synthesize tasks dynamically from a natural language prompt
     * @param {string} prompt 
     * @returns {Array} List of task draft objects with text, category, priority, offsetDays, dependencies
     */
    static parsePrompt(prompt) {
        if (!prompt || typeof prompt !== 'string') return [];

        const lower = prompt.toLowerCase();
        
        // 1. Determine dominant category based on keyword matching
        let category = 'data';
        if (lower.includes('experiment') || lower.includes('assay') || lower.includes('lab') || lower.includes('test')) {
            category = 'experiment';
        } else if (lower.includes('paper') || lower.includes('write') || lower.includes('manuscript') || lower.includes('draft')) {
            category = 'writing';
        } else if (lower.includes('grant') || lower.includes('fund') || lower.includes('proposal') || lower.includes('budget')) {
            category = 'funding';
        } else if (lower.includes('present') || lower.includes('talk') || lower.includes('slides') || lower.includes('poster')) {
            category = 'presentation';
        } else if (lower.includes('read') || lower.includes('paper') || lower.includes('literature') || lower.includes('review')) {
            category = 'literature';
        }

        // 2. Synthesize structured breakdown steps
        const cleanTitle = prompt.trim().replace(/^(create|generate|plan|build|run|make|do)\s+/i, '');
        const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

        const generatedTasks = [
            {
                text: `Define scope & objectives for: ${capitalizedTitle}`,
                category: category,
                priority: 'high',
                offsetDays: 2,
                dependsOnPrev: false,
                notes: `Initiated via AI Task Breakdown for: "${prompt}"`
            },
            {
                text: `Gather baseline data & literature background for ${capitalizedTitle}`,
                category: 'literature',
                priority: 'normal',
                offsetDays: 5,
                dependsOnPrev: true,
                notes: 'Prerequisite data collection step.'
            },
            {
                text: `Execute main analysis / methodology phase: ${capitalizedTitle}`,
                category: category === 'writing' ? 'writing' : 'data',
                priority: 'critical',
                offsetDays: 12,
                dependsOnPrev: true,
                notes: 'Core execution milestone.'
            },
            {
                text: `Quality assurance & peer validation for ${capitalizedTitle}`,
                category: 'experiment',
                priority: 'high',
                offsetDays: 16,
                dependsOnPrev: true,
                notes: 'Validation phase.'
            },
            {
                text: `Synthesize findings & document results for ${capitalizedTitle}`,
                category: 'presentation',
                priority: 'critical',
                offsetDays: 20,
                dependsOnPrev: true,
                notes: 'Final delivery step.'
            }
        ];

        return generatedTasks;
    }
}
