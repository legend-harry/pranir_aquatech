"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Database, 
  Cpu, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  Cloud,
  Wifi,
  FileText
} from 'lucide-react';

export function AIArchitectureDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stages = [
    {
      id: 'data',
      title: 'Data Ingestion',
      icon: Database,
      items: ['IoT Sensors', 'Manual Logs', 'Weather APIs', 'Market Data'],
      color: 'from-blue-500 to-cyan-500',
      delay: 0
    },
    {
      id: 'processing',
      title: 'Processing',
      icon: Cpu,
      items: ['Time-Series', 'Pattern Analysis', 'Data Cleaning', 'Feature Extraction'],
      color: 'from-violet-500 to-purple-500',
      delay: 0.2
    },
    {
      id: 'ai',
      title: 'AI Models',
      icon: Zap,
      items: ['Mortality Predict', 'Feed Optimize', 'Disease Detect', 'Risk Scoring'],
      color: 'from-orange-500 to-red-500',
      delay: 0.4
    },
    {
      id: 'output',
      title: 'Intelligence',
      icon: TrendingUp,
      items: ['Recommendations', 'Alerts', 'Forecasts', 'Insights'],
      color: 'from-emerald-500 to-teal-500',
      delay: 0.6
    }
  ];

  return (
    <div ref={ref} className="py-16 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Animated background glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">System Active · AI Models Running</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
            Powered by Predictive Intelligence
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Multi-layered AI pipeline that transforms raw data into actionable aquaculture insights
          </p>
        </motion.div>

        {/* Architecture Flow */}
        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: stage.delay }}
                className="relative"
              >
                {/* Connecting Arrow */}
                {index < stages.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: stage.delay + 0.3 }}
                    className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary origin-left z-10"
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-t-2 border-r-2 border-primary" />
                  </motion.div>
                )}

                {/* Stage Card */}
                <div className="relative group">
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(var(--primary-rgb), 0.1)',
                        '0 0 40px rgba(var(--primary-rgb), 0.2)',
                        '0 0 20px rgba(var(--primary-rgb), 0.1)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: stage.delay
                    }}
                    className="backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
                  >
                    {/* Icon */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: stage.delay
                      }}
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stage.color} p-3 mb-4 shadow-lg`}
                    >
                      <Icon className="w-full h-full text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-slate-100">
                      {stage.title}
                    </h3>

                    {/* Items */}
                    <ul className="space-y-2">
                      {stage.items.map((item, i) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ duration: 0.3, delay: stage.delay + 0.1 * i }}
                          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${stage.color}`} />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Data Flow Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400"
        >
          <Wifi className="w-5 h-5 animate-pulse" />
          <span>Real-time data flow</span>
          <span>·</span>
          <Cloud className="w-5 h-5" />
          <span>Cloud-powered processing</span>
          <span>·</span>
          <FileText className="w-5 h-5" />
          <span>Instant insights</span>
        </motion.div>
      </div>
    </div>
  );
}
