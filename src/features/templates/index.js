/**
 * Template Registry - Initializes and registers all built-in templates
 * Import this file early in app initialization to make templates available
 */

import { templateManager } from './template-engine.js';
import { PaperSubmissionTemplate } from './paper-submission.js';
import { GrantProposalTemplate } from './grant-proposal.js';
import { ExperimentCycleTemplate } from './experiment-cycle.js';

// Register all built-in templates
function initializeTemplates() {
    try {
        templateManager.registerTemplate(PaperSubmissionTemplate);
        console.log('✓ Registered: Paper Submission Template');
    } catch (err) {
        console.error('Failed to register Paper Submission Template:', err);
    }

    try {
        templateManager.registerTemplate(GrantProposalTemplate);
        console.log('✓ Registered: Grant Proposal Template');
    } catch (err) {
        console.error('Failed to register Grant Proposal Template:', err);
    }

    try {
        templateManager.registerTemplate(ExperimentCycleTemplate);
        console.log('✓ Registered: Experiment Cycle Template');
    } catch (err) {
        console.error('Failed to register Experiment Cycle Template:', err);
    }

    console.log(`📋 Template Registry: ${templateManager.getAll().length} templates available`);
}

// Run initialization
initializeTemplates();

// Export for use elsewhere
export { templateManager };
