const DAY = 24 * 60 * 60 * 1000;

function dateFromToday(offset) {
    return new Date(Date.now() + offset * DAY).toISOString().split('T')[0];
}

export function createDemoWorkspace() {
    return [
        {
            id: 'task_demo_literature',
            text: 'Complete systematic review of spatial transcriptomics methods',
            category: 'literature',
            priority: 'high',
            completed: true,
            dueDate: dateFromToday(-10),
            tags: ['transcriptomics', 'review'],
            notes: 'Summarize benchmark datasets and unresolved normalization questions.'
        },
        {
            id: 'task_demo_hypothesis',
            text: 'Finalize hypoxia-response hypothesis and preregistration',
            category: 'writing',
            priority: 'critical',
            completed: true,
            dueDate: dateFromToday(-5),
            dependencies: ['task_demo_literature'],
            tags: ['preregistration', 'hypoxia'],
            notes: 'Derived from [[Task:task_demo_literature]]. Primary endpoint: HIF1A neighborhood enrichment.'
        },
        {
            id: 'task_demo_samples',
            text: 'Prepare twelve tissue sections for pilot sequencing run',
            category: 'experiment',
            priority: 'critical',
            completed: false,
            status: 'in-progress',
            dueDate: dateFromToday(2),
            dependencies: ['task_demo_hypothesis'],
            tags: ['wet-lab', 'pilot'],
            notes: 'Six control and six hypoxia-treated sections. Record RIN and imaging QC.'
        },
        {
            id: 'task_demo_pipeline',
            text: 'Validate preprocessing pipeline on public benchmark dataset',
            category: 'data',
            priority: 'high',
            completed: false,
            status: 'review',
            dueDate: dateFromToday(4),
            dependencies: ['task_demo_literature'],
            tags: ['python', 'quality-control'],
            notes: 'Compare filtering thresholds before processing the pilot tissue sections.'
        },
        {
            id: 'task_demo_analysis',
            text: 'Run differential neighborhood and pathway enrichment analysis',
            category: 'data',
            priority: 'high',
            completed: false,
            dueDate: dateFromToday(8),
            dependencies: ['task_demo_samples', 'task_demo_pipeline'],
            tags: ['statistics', 'pathways'],
            notes: 'Blocked until the pilot data and validated pipeline are available.'
        },
        {
            id: 'task_demo_figures',
            text: 'Build reproducible figure set for lab review',
            category: 'presentation',
            priority: 'normal',
            completed: false,
            dueDate: dateFromToday(12),
            dependencies: ['task_demo_analysis'],
            tags: ['figures', 'lab-meeting'],
            notes: 'Include sample QC, spatial clusters, effect sizes, and sensitivity analysis.'
        },
        {
            id: 'task_demo_methods',
            text: 'Draft methods and reproducibility statement',
            category: 'writing',
            priority: 'normal',
            completed: false,
            status: 'in-progress',
            dueDate: dateFromToday(14),
            dependencies: ['task_demo_pipeline'],
            tags: ['manuscript', 'reproducibility'],
            notes: 'Document environment, parameters, exclusions, and data provenance.'
        },
        {
            id: 'task_demo_manuscript',
            text: 'Assemble first manuscript draft for coauthor review',
            category: 'writing',
            priority: 'high',
            completed: false,
            dueDate: dateFromToday(21),
            dependencies: ['task_demo_figures', 'task_demo_methods'],
            tags: ['manuscript', 'collaboration'],
            notes: 'Integrate the reproducible figures and finalized methods into one narrative.'
        },
        {
            id: 'task_demo_budget',
            text: 'Update sequencing budget and data-management costs',
            category: 'funding',
            priority: 'normal',
            completed: false,
            dueDate: dateFromToday(6),
            tags: ['budget', 'grant'],
            notes: 'Request updated core-facility quote and include long-term archive costs.'
        },
        {
            id: 'task_demo_grant',
            text: 'Submit pilot findings for translational research seed grant',
            category: 'funding',
            priority: 'critical',
            completed: false,
            dueDate: dateFromToday(30),
            dependencies: ['task_demo_analysis', 'task_demo_budget'],
            tags: ['grant', 'deadline'],
            notes: 'Use preliminary results and the validated analysis plan as feasibility evidence.'
        },
        {
            id: 'task_demo_overdue',
            text: 'Archive signed sample provenance forms',
            category: 'experiment',
            priority: 'low',
            completed: false,
            dueDate: dateFromToday(-2),
            tags: ['documentation', 'overdue'],
            notes: 'Intentionally overdue demo item for analytics and timeline views.'
        }
    ];
}

export function seedDemoWorkspace(taskStore) {
    if (taskStore.getAll().length > 0) return false;
    taskStore.importTasks(createDemoWorkspace());
    return true;
}
