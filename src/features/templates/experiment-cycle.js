/**
 * Experiment Cycle Template
 * Complete workflow for planning, executing, and analyzing a laboratory experiment
 * ~21-30 days from planning to final analysis
 */

import { Template } from './template-engine.js';

export const ExperimentCycleTemplate = new Template({
  name: 'Experiment Cycle',
  description: 'Complete workflow for planning, executing, and analyzing a research experiment in the lab',
  category: 'experiment',
  estimatedDuration: 30,
  tasks: [
    // Planning Phase (Days 0-3)
    {
      text: 'Define experimental hypothesis',
      category: 'experiment',
      priority: 'high',
      daysFromStart: 0,
      notes: 'Clearly state what you expect to discover and why',
      tags: ['experiment', 'planning']
    },
    {
      text: 'Design experimental protocol',
      category: 'experiment',
      priority: 'high',
      daysFromStart: 1,
      notes: 'Detailed step-by-step procedures including controls',
      dependencies: [0]
    },
    {
      text: 'Review safety requirements',
      category: 'experiment',
      priority: 'high',
      daysFromStart: 1,
      notes: 'Check SDS, hazard classifications, and safety precautions',
      dependencies: [1]
    },
    {
      text: 'Prepare equipment checklist',
      category: 'experiment',
      priority: 'normal',
      daysFromStart: 2,
      notes: 'List all required instruments, reagents, and materials',
      dependencies: [1]
    },
    {
      text: 'Calibrate instruments',
      category: 'experiment',
      priority: 'high',
      daysFromStart: 3,
      notes: 'Ensure all equipment is calibrated and functioning',
      dependencies: [3]
    },
    {
      text: 'Prepare reagents and samples',
      category: 'experiment',
      priority: 'high',
      daysFromStart: 3,
      notes: 'Prepare all solutions, samples, and stock reagents',
      dependencies: [4]
    },

    // Pre-Experiment Phase (Days 4-5)
    {
      text: 'Set up experimental workspace',
      category: 'experiment',
      priority: 'normal',
      daysFromStart: 4,
      notes: 'Clean workspace, organize equipment, prepare workbench',
      dependencies: [5, 6]
    },
    {
      text: 'Review protocol one final time',
      category: 'experiment',
      priority: 'high',
      daysFromStart: 4,
      notes: 'Walk through procedure mentally before starting',
      dependencies: [1]
    },
    {
      text: 'Create data collection sheet',
      category: 'data',
      priority: 'normal',
      daysFromStart: 5,
      notes: 'Prepare forms or notebook for recording observations',
      dependencies: [1]
    },

    // Execution Phase (Days 6-10)
    {
      text: 'Execute experiment - Control group',
      category: 'experiment',
      priority: 'critical',
      daysFromStart: 6,
      notes: 'Run control conditions following protocol exactly',
      dependencies: [7, 8]
    },
    {
      text: 'Execute experiment - Treatment group(s)',
      category: 'experiment',
      priority: 'critical',
      daysFromStart: 7,
      notes: 'Run experimental conditions with all replicates',
      dependencies: [10]
    },
    {
      text: 'Document observations and issues',
      category: 'data',
      priority: 'high',
      daysFromStart: 6,
      notes: 'Record all observations, anomalies, and deviations',
      dependencies: [10]
    },
    {
      text: 'Collect raw data',
      category: 'data',
      priority: 'high',
      daysFromStart: 8,
      notes: 'Measure and record all experimental outcomes',
      dependencies: [11, 12]
    },
    {
      text: 'Store samples for future analysis (if needed)',
      category: 'experiment',
      priority: 'normal',
      daysFromStart: 10,
      notes: 'Properly preserve samples for later use',
      dependencies: [13]
    },
    {
      text: 'Preliminary data review',
      category: 'data',
      priority: 'normal',
      daysFromStart: 10,
      notes: 'Quick check for anomalies or data quality issues',
      dependencies: [12, 13]
    },

    // Analysis Phase (Days 12-20)
    {
      text: 'Clean and organize raw data',
      category: 'data',
      priority: 'high',
      daysFromStart: 12,
      notes: 'Format data, remove errors, prepare for analysis',
      dependencies: [13]
    },
    {
      text: 'Calculate descriptive statistics',
      category: 'data',
      priority: 'high',
      daysFromStart: 13,
      notes: 'Mean, SD, SEM, and other descriptive measures',
      dependencies: [16]
    },
    {
      text: 'Perform statistical analysis',
      category: 'data',
      priority: 'high',
      daysFromStart: 15,
      notes: 'Run appropriate statistical tests (t-test, ANOVA, etc.)',
      dependencies: [17]
    },
    {
      text: 'Create data visualizations',
      category: 'data',
      priority: 'normal',
      daysFromStart: 16,
      notes: 'Generate graphs, plots, and figures',
      dependencies: [17]
    },
    {
      text: 'Verify results and repeatability',
      category: 'data',
      priority: 'high',
      daysFromStart: 17,
      notes: 'Check results make sense and are reproducible',
      dependencies: [18]
    },

    // Interpretation Phase (Days 18-24)
    {
      text: 'Interpret results relative to hypothesis',
      category: 'writing',
      priority: 'high',
      daysFromStart: 18,
      notes: 'Did results support or refute your hypothesis?',
      dependencies: [20, 19]
    },
    {
      text: 'Compare with expected outcomes',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 19,
      notes: 'How do results compare to literature/prior experiments?',
      dependencies: [21]
    },
    {
      text: 'Identify sources of error or variation',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 20,
      notes: 'Discuss limitations and potential improvements',
      dependencies: [21]
    },
    {
      text: 'Plan follow-up experiments (if needed)',
      category: 'experiment',
      priority: 'normal',
      daysFromStart: 22,
      notes: 'Design experiments to clarify or extend findings',
      dependencies: [22]
    },

    // Documentation Phase (Days 22-30)
    {
      text: 'Write experimental summary/report',
      category: 'writing',
      priority: 'high',
      daysFromStart: 22,
      notes: 'Document hypothesis, methods, results, and conclusions',
      dependencies: [21]
    },
    {
      text: 'Archive experiment data',
      category: 'data',
      priority: 'high',
      daysFromStart: 25,
      notes: 'Save all raw and processed data with metadata',
      dependencies: [16]
    },
    {
      text: 'Document reagent batch numbers and dates',
      category: 'experiment',
      priority: 'normal',
      daysFromStart: 26,
      notes: 'Record details for reproducibility and troubleshooting',
      dependencies: [25]
    },
    {
      text: 'Update lab notebook and protocols',
      category: 'experiment',
      priority: 'normal',
      daysFromStart: 27,
      notes: 'Record lessons learned and protocol modifications',
      dependencies: [25]
    },
    {
      text: 'Share results with collaborators/advisors',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 28,
      notes: 'Present findings and gather feedback',
      dependencies: [25]
    },
    {
      text: 'Plan next experimental cycle',
      category: 'experiment',
      priority: 'normal',
      daysFromStart: 30,
      notes: 'Use insights from this experiment for next iteration',
      dependencies: [24, 29]
    }
  ]
});

export default ExperimentCycleTemplate;
