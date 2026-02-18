"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface RiskScoreMeterProps {
  score: number; // 0-100
  label?: string;
  showDetails?: boolean;
}

export function RiskScoreMeter({ score, label = "Risk Score", showDetails = true }: RiskScoreMeterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const duration = 2000; // 2 seconds

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = easedProgress * score;
      
      setAnimatedScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, score]);

  // Calculate rotation angle (-90 to 90 degrees)
  const rotation = (animatedScore / 100) * 180 - 90;
  
  // Determine color based on score
  const getColor = () => {
    if (score < 30) return { from: 'from-green-500', to: 'to-emerald-500', text: 'text-green-600', bg: 'bg-green-500' };
    if (score < 70) return { from: 'from-yellow-500', to: 'to-orange-500', text: 'text-yellow-600', bg: 'bg-yellow-500' };
    return { from: 'from-red-500', to: 'to-rose-500', text: 'text-red-600', bg: 'bg-red-500' };
  };

  const color = getColor();

  const getStatus = () => {
    if (score < 30) return { text: 'Low Risk', icon: CheckCircle, desc: 'Farm conditions optimal' };
    if (score < 70) return { text: 'Medium Risk', icon: AlertTriangle, desc: 'Monitor closely' };
    return { text: 'High Risk', icon: AlertTriangle, desc: 'Immediate attention required' };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div ref={ref} className="relative">
      {/* Card Container */}
      <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {label}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time monitoring
          </p>
        </div>

        {/* Gauge Container */}
        <div className="relative w-64 h-32 mx-auto mb-6">
          {/* Background Arc */}
          <svg className="w-full h-full" viewBox="0 0 200 100">
            {/* Background track */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className="text-slate-200 dark:text-slate-700"
            />
            
            {/* Animated progress arc */}
            <motion.path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              className={`bg-gradient-to-r ${color.from} ${color.to}`}
              stroke="url(#gradient)"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: animatedScore / 100 } : {}}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className="text-green-500" stopColor="currentColor" />
                <stop offset="50%" className="text-yellow-500" stopColor="currentColor" />
                <stop offset="100%" className="text-red-500" stopColor="currentColor" />
              </linearGradient>
            </defs>

            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const angle = (tick / 100) * 180 - 90;
              const radian = (angle * Math.PI) / 180;
              const x1 = 100 + 70 * Math.cos(radian);
              const y1 = 80 + 70 * Math.sin(radian);
              const x2 = 100 + 80 * Math.cos(radian);
              const y2 = 80 + 80 * Math.sin(radian);
              
              return (
                <line
                  key={tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-400 dark:text-slate-600"
                />
              );
            })}
          </svg>

          {/* Needle */}
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 origin-bottom"
            style={{ height: '60px', width: '4px' }}
            initial={{ rotate: -90 }}
            animate={isInView ? { rotate: rotation } : {}}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <div className={`w-full h-full ${color.bg} rounded-full shadow-lg`}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 rounded-full border-2 border-current shadow-lg" 
                   style={{ color: `rgb(var(--${color.bg.replace('bg-', '')}-rgb, 107 114 128))` }} />
            </div>
          </motion.div>

          {/* Center circle */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg border-4 border-slate-200 dark:border-slate-700" />
        </div>

        {/* Score Display */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center mb-6"
        >
          <div className={`text-5xl font-bold ${color.text} mb-2`}>
            {Math.round(animatedScore)}
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
            <StatusIcon className="w-5 h-5" />
            <span className="font-semibold">{status.text}</span>
          </div>
        </motion.div>

        {/* Details */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700"
          >
            <div className="text-center">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Water Quality</div>
              <div className="text-lg font-bold text-green-600">92%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">FCR</div>
              <div className="text-lg font-bold text-yellow-600">1.4</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Survival</div>
              <div className="text-lg font-bold text-green-600">89%</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface InteractiveRiskMeterProps {
  ponds?: Array<{ id: string; name: string; risk: number }>;
}

export function InteractiveRiskMeter({ ponds }: InteractiveRiskMeterProps) {
  const [selectedPond, setSelectedPond] = useState(0);
  
  const defaultPonds = [
    { id: '1', name: 'Pond 1', risk: 25 },
    { id: '2', name: 'Pond 2', risk: 45 },
    { id: '3', name: 'Pond 3', risk: 72 },
  ];

  const pondData = ponds || defaultPonds;

  return (
    <div className="space-y-6">
      <RiskScoreMeter score={pondData[selectedPond].risk} label={pondData[selectedPond].name} />
      
      <div className="flex gap-2 justify-center">
        {pondData.map((pond, index) => (
          <button
            key={pond.id}
            onClick={() => setSelectedPond(index)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedPond === index
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {pond.name}
          </button>
        ))}
      </div>
    </div>
  );
}
