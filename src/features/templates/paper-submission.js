/**
 * Paper Submission Template
 * Typical workflow for submitting a research paper to a journal/conference
 * ~40 days from initial draft to submission
 */

import { Template } from './template-engine.js';

export const PaperSubmissionTemplate = new Template({
  name: 'Paper Submission',
  description: 'Complete workflow for submitting a research paper to a journal or conference',
  category: 'writing',
  estimatedDuration: 40,
  tasks: [
    {
      text: 'Write paper outline and structure',
      category: 'writing',
      priority: 'high',
      daysFromStart: 0,
      notes: 'Create detailed outline with main sections and key points',
      tags: ['paper', 'writing']
    },
    {
      text: 'Write introduction and literature review',
      category: 'writing',
      priority: 'high',
      daysFromStart: 2,
      notes: 'Establish context and cite relevant literature',
      dependencies: [0]
    },
    {
      text: 'Write methods section',
      category: 'writing',
      priority: 'high',
      daysFromStart: 5,
      notes: 'Describe experimental/computational methods clearly',
      dependencies: [0]
    },
    {
      text: 'Write results and analysis',
      category: 'writing',
      priority: 'high',
      daysFromStart: 8,
      notes: 'Present findings with figures and tables',
      dependencies: [2]
    },
    {
      text: 'Write discussion and conclusions',
      category: 'writing',
      priority: 'high',
      daysFromStart: 12,
      notes: 'Interpret results and suggest future work',
      dependencies: [3]
    },
    {
      text: 'Create figures and visualizations',
      category: 'data',
      priority: 'high',
      daysFromStart: 10,
      notes: 'Generate high-quality publication-ready figures',
      dependencies: [3]
    },
    {
      text: 'First draft review (self)',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 15,
      notes: 'Read through entire draft for coherence and clarity',
      dependencies: [1, 4, 5]
    },
    {
      text: 'Send to co-authors for feedback',
      category: 'writing',
      priority: 'high',
      daysFromStart: 16,
      notes: 'Share draft and request comments',
      dependencies: [6]
    },
    {
      text: 'Revise based on co-author feedback',
      category: 'writing',
      priority: 'high',
      daysFromStart: 22,
      notes: 'Incorporate feedback and improve manuscript',
      dependencies: [7]
    },
    {
      text: 'Format references and bibliography',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 25,
      notes: 'Ensure all citations follow journal guidelines',
      dependencies: [8]
    },
    {
      text: 'Proofread and grammar check',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 27,
      notes: 'Check spelling, grammar, and formatting',
      dependencies: [9]
    },
    {
      text: 'Select target journal/conference',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 3,
      notes: 'Choose venue and note submission requirements',
      dependencies: [0]
    },
    {
      text: 'Prepare abstract and keywords',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 28,
      notes: 'Write concise abstract following journal guidelines',
      dependencies: [10]
    },
    {
      text: 'Prepare cover letter',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 30,
      notes: 'Write professional cover letter to editor',
      dependencies: [12]
    },
    {
      text: 'Compile supplementary materials',
      category: 'writing',
      priority: 'low',
      daysFromStart: 32,
      notes: 'Organize any supplementary data, code, or files',
      dependencies: [10]
    },
    {
      text: 'Final quality check',
      category: 'writing',
      priority: 'high',
      daysFromStart: 35,
      notes: 'Final review of all materials before submission',
      dependencies: [10, 13, 14]
    },
    {
      text: 'Submit manuscript',
      category: 'writing',
      priority: 'critical',
      daysFromStart: 37,
      notes: 'Submit to journal/conference portal',
      dependencies: [15]
    },
    {
      text: 'Track submission status',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 38,
      notes: 'Monitor submission and watch for editorial requests',
      dependencies: [16]
    }
  ]
});

export default PaperSubmissionTemplate;
