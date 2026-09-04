export const CATEGORIES = [
    {
        id: 'data',
        name: 'Data Analysis',
        icon: '📊',
        color: '#3b82f6',
        description: 'Statistical analysis, data processing, visualizations',
    },
    {
        id: 'experiment',
        name: 'Experiments',
        icon: '🧪',
        color: '#8b5cf6',
        description: 'Lab work, measurements, protocols',
    },
    {
        id: 'writing',
        name: 'Writing',
        icon: '📝',
        color: '#f4a261',
        description: 'Papers, reports, documentation',
    },
    {
        id: 'funding',
        name: 'Funding',
        icon: '💰',
        color: '#10b981',
        description: 'Grants, proposals, budgets',
    },
    {
        id: 'presentation',
        name: 'Presentations',
        icon: '🎤',
        color: '#ef4444',
        description: 'Talks, posters, lab meetings',
    },
    {
        id: 'literature',
        name: 'Literature',
        icon: '📚',
        color: '#6366f1',
        description: 'Reading papers, reviews, citations',
    },
];

export const getCategoryById = (id) => {
    return CATEGORIES.find((cat) => cat.id === id);
};
