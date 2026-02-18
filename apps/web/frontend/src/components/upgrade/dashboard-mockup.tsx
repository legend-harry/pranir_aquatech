"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, TrendingDown, Activity, Droplets, Fish, AlertCircle } from 'lucide-react';

export function DashboardMockup() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-4"
      >
        {/* Browser Window Frame */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Browser Header */}
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                pranir-aquatech.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            <div className="relative space-y-4">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Farm Overview</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Real-time intelligence dashboard</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">All Systems Active</span>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Active Ponds', value: '12', trend: '+2', icon: Fish, color: 'blue' },
                  { label: 'Avg FCR', value: '1.32', trend: '-0.08', icon: TrendingDown, color: 'green' },
                  { label: 'Survival Rate', value: '91%', trend: '+3%', icon: TrendingUp, color: 'emerald' },
                  { label: 'Water Quality', value: '94', trend: '+2', icon: Droplets, color: 'cyan' },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 text-${stat.color}-500`} />
                        <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.trend}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts Section */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* FCR Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Feed Efficiency Trend</h4>
                  <div className="h-32 flex items-end gap-1">
                    {[42, 38, 45, 52, 48, 44, 40, 36, 32, 35, 31, 28].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={isInView ? { height: `${height}%` } : {}}
                        transition={{ duration: 0.5, delay: 0.8 + i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <TrendingDown className="w-3 h-3 text-green-500" />
                    <span>Improving FCR by 18% this cycle</span>
                  </div>
                </motion.div>

                {/* Alerts */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">AI Recommendations</h4>
                  <div className="space-y-2">
                    {[
                      { text: 'Pond 3: Increase aeration by 15%', severity: 'warning' },
                      { text: 'Market prices up 8% - optimal harvest window', severity: 'success' },
                      { text: 'Feed stock running low - reorder suggested', severity: 'info' },
                    ].map((alert, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                        className={`flex items-start gap-2 p-2 rounded-lg ${
                          alert.severity === 'warning' 
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' 
                            : alert.severity === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <AlertCircle className={`w-4 h-4 mt-0.5 ${
                          alert.severity === 'warning' 
                            ? 'text-yellow-600' 
                            : alert.severity === 'success'
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`} />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{alert.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* AI Insight Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="backdrop-blur-sm bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-4 border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      AI Predictive Insight
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Based on current growth patterns and water quality trends, expect harvest weight to exceed target by 7-9% in 14 days. Consider expanding buyer outreach.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
      </motion.div>
    </div>
  );
}
