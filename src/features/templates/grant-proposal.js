/**
 * Grant Proposal Template
 * Complete workflow for preparing and submitting a research grant proposal
 * ~90 days from planning to submission
 */

import { Template } from './template-engine.js';

export const GrantProposalTemplate = new Template({
  name: 'Grant Proposal',
  description: 'Comprehensive workflow for preparing and submitting a competitive research grant proposal',
  category: 'funding',
  estimatedDuration: 90,
  tasks: [
    // Planning Phase (Days 0-5)
    {
      text: 'Identify funding agencies and deadlines',
      category: 'funding',
      priority: 'high',
      daysFromStart: 0,
      notes: 'Research appropriate funding agencies and note deadline dates',
      tags: ['grant', 'planning']
    },
    {
      text: 'Review grant guidelines and eligibility',
      category: 'funding',
      priority: 'high',
      daysFromStart: 1,
      notes: 'Read funding requirements, eligible activities, and budget limits',
      dependencies: [0]
    },
    {
      text: 'Assemble grant team',
      category: 'funding',
      priority: 'normal',
      daysFromStart: 2,
      notes: 'Identify co-investigators, collaborators, and institutional support',
      dependencies: [0]
    },
    {
      text: 'Develop project concept and aims',
      category: 'funding',
      priority: 'high',
      daysFromStart: 3,
      notes: 'Define research problem, innovative approach, and specific aims',
      dependencies: [1]
    },
    {
      text: 'Literature review and preliminary data',
      category: 'literature',
      priority: 'high',
      daysFromStart: 5,
      notes: 'Gather supporting research and prepare preliminary results',
      dependencies: [3]
    },

    // Background & Significance Phase (Days 8-20)
    {
      text: 'Write background and significance section',
      category: 'writing',
      priority: 'high',
      daysFromStart: 8,
      notes: 'Establish research context and justify importance',
      dependencies: [4]
    },
    {
      text: 'Write specific aims and hypotheses',
      category: 'writing',
      priority: 'high',
      daysFromStart: 10,
      notes: 'Clearly state research objectives and testable hypotheses',
      dependencies: [3]
    },
    {
      text: 'Develop theoretical framework',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 12,
      notes: 'Outline conceptual model underlying the research',
      dependencies: [5]
    },

    // Methods & Feasibility Phase (Days 15-35)
    {
      text: 'Write research methods section',
      category: 'writing',
      priority: 'high',
      daysFromStart: 15,
      notes: 'Describe experimental design, methodology, and analyses',
      dependencies: [6]
    },
    {
      text: 'Develop timeline and milestones',
      category: 'writing',
      priority: 'high',
      daysFromStart: 18,
      notes: 'Create project schedule with key milestones',
      dependencies: [8]
    },
    {
      text: 'Prepare evaluation plan',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 20,
      notes: 'Outline how success will be measured',
      dependencies: [8]
    },
    {
      text: 'Prepare dissemination plan',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 22,
      notes: 'Plan for publication, presentations, and broader impact',
      dependencies: [8]
    },
    {
      text: 'Develop preliminary data presentation',
      category: 'data',
      priority: 'high',
      daysFromStart: 25,
      notes: 'Create figures and tables showing preliminary results',
      dependencies: [4]
    },
    {
      text: 'Address feasibility and institutional support',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 28,
      notes: 'Justify that project is feasible with available resources',
      dependencies: [8, 9]
    },

    // Budget Phase (Days 30-45)
    {
      text: 'Develop detailed project budget',
      category: 'funding',
      priority: 'high',
      daysFromStart: 30,
      notes: 'Calculate personnel, equipment, supplies, and indirect costs',
      dependencies: [8, 9]
    },
    {
      text: 'Justify budget items',
      category: 'funding',
      priority: 'high',
      daysFromStart: 32,
      notes: 'Write budget justification with rationale for expenses',
      dependencies: [15]
    },
    {
      text: 'Get institutional approvals and commitments',
      category: 'funding',
      priority: 'high',
      daysFromStart: 35,
      notes: 'Secure department and institution letters of support',
      dependencies: [15, 16]
    },
    {
      text: 'Prepare facilities and resources documentation',
      category: 'funding',
      priority: 'normal',
      daysFromStart: 38,
      notes: 'Document available facilities and core resources',
      dependencies: [17]
    },

    // Integration & Review Phase (Days 45-70)
    {
      text: 'Compile complete first draft',
      category: 'writing',
      priority: 'high',
      daysFromStart: 45,
      notes: 'Combine all sections into coherent proposal document',
      dependencies: [5, 6, 7, 11, 12, 13, 18]
    },
    {
      text: 'Internal team review',
      category: 'writing',
      priority: 'high',
      daysFromStart: 50,
      notes: 'Co-investigators review and provide feedback',
      dependencies: [19]
    },
    {
      text: 'Seek external reviewer feedback',
      category: 'writing',
      priority: 'high',
      daysFromStart: 55,
      notes: 'Invite external expert to review and critique proposal',
      dependencies: [19]
    },
    {
      text: 'Revise based on internal feedback',
      category: 'writing',
      priority: 'high',
      daysFromStart: 58,
      notes: 'Incorporate co-investigator suggestions',
      dependencies: [20]
    },
    {
      text: 'Revise based on external feedback',
      category: 'writing',
      priority: 'high',
      daysFromStart: 62,
      notes: 'Address external reviewer comments',
      dependencies: [21, 22]
    },
    {
      text: 'Final proofreading and formatting',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 70,
      notes: 'Check grammar, formatting, and compliance with guidelines',
      dependencies: [22, 23]
    },

    // Submission Phase (Days 75-90)
    {
      text: 'Prepare supplementary materials',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 75,
      notes: 'Organize CVs, letters of support, and other documents',
      dependencies: [24]
    },
    {
      text: 'Create institutional proposal folder',
      category: 'writing',
      priority: 'normal',
      daysFromStart: 78,
      notes: 'Organize all proposal documents in submission portal',
      dependencies: [25]
    },
    {
      text: 'Get final institutional approvals',
      category: 'funding',
      priority: 'high',
      daysFromStart: 80,
      notes: 'Obtain final signatures from authorized institutional officials',
      dependencies: [25, 26]
    },
    {
      text: 'Final compliance check',
      category: 'funding',
      priority: 'high',
      daysFromStart: 82,
      notes: 'Verify all requirements met: page limits, formatting, budget',
      dependencies: [24, 27]
    },
    {
      text: 'Submit proposal',
      category: 'funding',
      priority: 'critical',
      daysFromStart: 85,
      notes: 'Submit proposal through funding agency portal',
      dependencies: [28]
    },
    {
      text: 'Document submission and confirm receipt',
      category: 'funding',
      priority: 'normal',
      daysFromStart: 86,
      notes: 'Save confirmation number and monitor for agency receipt',
      dependencies: [29]
    }
  ]
});

export default GrantProposalTemplate;
