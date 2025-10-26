export const PRIORITIES = [
  {
    level: 'critical',
    name: 'Critical',
    icon: '🔥',
    color: '#ef4444',
    urgency: 4,
    description: 'Immediate attention required'
  },
  {
    level: 'high',
    name: 'High',
    icon: '⚡',
    color: '#f59e0b',
    urgency: 3,
    description: 'Important, schedule soon'
  },
  {
    level: 'normal',
    name: 'Normal',
    icon: '📌',
    color: '#3b82f6',
    urgency: 2,
    description: 'Standard priority'
  },
  {
    level: 'low',
    name: 'Low',
    icon: '💤',
    color: '#94a3b8',
    urgency: 1,
    description: 'When time permits'
  }
];

export const getPriorityByLevel = (level) => {
  return PRIORITIES.find(p => p.level === level);
};

