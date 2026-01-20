export const ponds = [
  {
    id: 'A1',
    name: 'Pond A1',
    phase: 'operation',
    day: 45,
    stock: 120000,
    survival: 0.91,
    fcr: 1.4,
    temperature: 30,
    ammonia: 0.6,
    dissolvedOxygen: 4.8,
    lastAlert: 'ammonia',
    weather: { temp: 31, humidity: 78, wind: 6 },
  },
  {
    id: 'B3',
    name: 'Pond B3',
    phase: 'stocking',
    day: 6,
    stock: 80000,
    survival: 0.96,
    fcr: 1.2,
    temperature: 27,
    ammonia: 0.2,
    dissolvedOxygen: 5.8,
    lastAlert: 'none',
    weather: { temp: 28, humidity: 72, wind: 4 },
  },
  {
    id: 'C2',
    name: 'Pond C2',
    phase: 'harvest',
    day: 95,
    stock: 70000,
    survival: 0.88,
    fcr: 1.5,
    temperature: 29,
    ammonia: 0.4,
    dissolvedOxygen: 5.1,
    lastAlert: 'do',
    weather: { temp: 30, humidity: 80, wind: 5 },
  },
];

export const alerts = [
  { id: 'al1', pondId: 'A1', type: 'critical', title: 'Ammonia trending high', action: 'Change 20% water and retest in 2h' },
  { id: 'al2', pondId: 'C2', type: 'high', title: 'DO dip expected at 2 PM', action: 'Inspect aerators; schedule 15 min run' },
  { id: 'al3', pondId: 'B3', type: 'info', title: 'Feeding on track', action: 'No action required' },
];

export const goals = [
  'Cost reduction',
  'Yield improvement',
  'Water quality',
];

export const knowledgeArticles = [
  { id: 'k1', trigger: 'ammonia>0.5', title: 'Managing Ammonia Spikes', summary: 'How to lower ammonia quickly without stressing shrimp.' },
  { id: 'k2', trigger: 'day>40', title: 'Mid-Cycle Disease Prevention', summary: 'Check biosecurity, siphon sludge, monitor DO closely.' },
  { id: 'k3', trigger: 'do<5', title: 'Avoiding DO Crashes', summary: 'Stagger aeration and reduce feed temporarily.' },
];

export const weatherToday = { temp: 31, humidity: 76, wind: 7, cloudCover: 40 };
