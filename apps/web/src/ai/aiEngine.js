// Rule-based "AI" stubs to simulate guidance and predictions
import { knowledgeArticles } from '../data/mockData.js';

export const inferOnboardingProfile = ({ role, goal, experience, pondCount }) => {
  const persona = role === 'manager' ? 'strategic' : role === 'worker' ? 'field' : 'owner';
  const intensity = experience === 'advanced' ? 'pro' : experience === 'beginner' ? 'guided' : 'balanced';
  const ponds = Number(pondCount || 0);
  return {
    persona,
    intensity,
    recommendedFeatures: [
      goal === 'Water quality' ? 'parameterInsights' : 'costOptimizer',
      ponds > 5 ? 'batchForms' : 'singleEntry',
      'alerts',
    ],
  };
};

export const predictiveAlerts = (ponds, weather) => {
  const list = [];
  ponds.forEach((p) => {
    if (p.ammonia > 0.5) {
      list.push({
        pondId: p.id,
        severity: 'critical',
        message: `${p.name} ammonia trending high; plan 20% water exchange today.`,
        eta: 'in 3 days',
      });
    }
    if (p.dissolvedOxygen < 5 || weather?.temp > 32) {
      list.push({
        pondId: p.id,
        severity: 'high',
        message: `${p.name} DO risk window at 2 PM; schedule aeration.`,
        eta: 'in 3 days',
      });
    }
  });
  return list;
};

export const whatsNext = (ponds) => ponds.map((p) => ({
  pondId: p.id,
  actions: [
    p.phase === 'stocking' ? 'Confirm acclimation logs' : 'Review feed table',
    p.ammonia > 0.5 ? 'Retest ammonia and reduce feed' : 'Log parameters',
  ],
}));

export const parameterTrends = (ponds) => ponds.map((p) => ({
  pondId: p.id,
  predictions: [
    { metric: 'DO', value: (p.dissolvedOxygen - 0.4).toFixed(1), horizon: '24h', note: 'DO expected to dip in afternoon' },
    { metric: 'Ammonia', value: (p.ammonia + 0.1).toFixed(2), horizon: '24h', note: 'Slight increase expected' },
  ],
  anomalies: p.ammonia > 0.5 ? ['Ammonia above safe band'] : [],
  missingLogs: ['temperature'],
}));

export const knowledgeMatches = (ponds) => {
  const matches = [];
  ponds.forEach((p) => {
    if (p.ammonia > 0.5) matches.push(knowledgeArticles.find((k) => k.trigger === 'ammonia>0.5'));
    if (p.dissolvedOxygen < 5) matches.push(knowledgeArticles.find((k) => k.trigger === 'do<5'));
    if (p.day > 40) matches.push(knowledgeArticles.find((k) => k.trigger === 'day>40'));
  });
  return matches.filter(Boolean);
};

export const roleBasedView = (role) => {
  if (role === 'worker') return ['tasks', 'checklists', 'alerts'];
  if (role === 'manager') return ['analytics', 'reports', 'alerts'];
  return ['overview', 'roi', 'alerts'];
};

export const successScore = (ponds) => {
  const base = 90;
  const penalty = ponds.reduce((acc, p) => acc + (p.ammonia > 0.5 ? 5 : 0) + (p.dissolvedOxygen < 5 ? 5 : 0), 0);
  return Math.max(0, Math.min(100, Math.round(base - penalty)));
};

export const comparePerformance = (ponds) => ponds.map((p) => ({
  pondId: p.id,
  delta: p.fcr < 1.4 ? '+8% vs avg' : '-5% vs avg',
  insight: p.fcr < 1.4 ? 'Feeding efficiency above peers' : 'Review feed density',
}));

export const bestPracticeSuggestions = (ponds) => ponds.flatMap((p) => [
  {
    pondId: p.id,
    title: 'Aeration cadence',
    detail: 'Run paddlewheel 15 mins/hour from 1-4 PM to pre-empt DO dips.',
    costBenefit: 'Costs ₹1,000/day, avoids ₹12,500 losses/day',
  },
  {
    pondId: p.id,
    title: 'Siphon schedule',
    detail: 'Light siphon every other day to control ammonia rise.',
    costBenefit: '30 mins labor, reduces ammonia by 0.2 ppm',
  },
]);
