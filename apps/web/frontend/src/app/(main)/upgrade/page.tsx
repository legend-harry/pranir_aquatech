
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Sparkles, 
  TrendingUp,
  Shield,
  Zap,
  Cloud,
  Users,
  BarChart3,
  Brain,
  Activity,
  Database,
  Lock,
  Smartphone,
  Globe,
  ArrowRight,
  Check
} from "lucide-react";
import { useSubscription } from "@/context/subscription-context";
import { useRouter } from "next/navigation";
import { AnimatedStatCard } from "@/components/upgrade/animated-counter";
import { AIArchitectureDiagram } from "@/components/upgrade/ai-architecture-diagram";
import { InteractiveRiskMeter } from "@/components/upgrade/risk-score-meter";
import { DashboardMockup } from "@/components/upgrade/dashboard-mockup";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    description: "Perfect for getting started with personal budgeting",
    features: [
      "Unlimited transactions",
      "Interactive data visualization",
      "Categorization and budgeting",
      "Up to 3 ponds/projects",
      "Single user profile",
      "Responsive mobile experience",
      "Standard reporting",
      "Community support"
    ],
    cta: "Your Current Plan",
    popular: false,
    variant: "outline" as const
  },
  {
    name: "Pro",
    price: "₹259",
    period: "/ month",
    yearlyPrice: "₹2,499 / year",
    savings: "Save 19%",
    description: "For power users who want advanced control and AI insights",
    features: [
      "Everything in Free, plus:",
      "AI-powered spending insights",
      "Predictive analytics & forecasting",
      "Advanced data visualization",
      "Unlimited projects/ponds",
      "Up to 5 team members",
      "PDF/CSV export",
      "Offline mode",
      "WhatsApp integration",
      "Receipt OCR scanning",
      "Premium themes",
      "Priority email support",
      "36 months data retention"
    ],
    cta: "Get Pro",
    popular: true,
    variant: "default" as const
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    period: "/ month",
    description: "For large operations and multi-farm management",
    features: [
      "Everything in Pro, plus:",
      "Multi-farm management",
      "Unlimited team members",
      "API access & integrations",
      "Custom branding",
      "Lab data integration",
      "Advanced financial tools",
      "Custom reporting templates",
      "SSO & audit logs",
      "Dedicated account manager",
      "Quarterly strategy calls",
      "Priority feature requests",
      "Unlimited data retention"
    ],
    cta: "Contact Sales",
    popular: false,
    variant: "outline" as const
  }
];

const impactMetrics = [
  {
    value: 18,
    suffix: "%",
    label: "Feed Optimization",
    description: "Average cost reduction",
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    value: 12,
    suffix: "%",
    label: "Survival Improvement",
    description: "Across user farms",
    icon: <Activity className="w-6 h-6" />
  },
  {
    value: 30,
    suffix: "%",
    label: "Faster Response",
    description: "Disease detection time",
    icon: <Zap className="w-6 h-6" />
  },
  {
    value: 89,
    suffix: "%",
    label: "Model Confidence",
    description: "AI prediction accuracy",
    icon: <Brain className="w-6 h-6" />
  }
];

const enterpriseFeatures = [
  {
    icon: <Cloud className="w-6 h-6" />,
    title: "Scalable Cloud Infrastructure",
    description: "Built on Firebase with auto-scaling capabilities"
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Real-Time Analytics Pipeline",
    description: "Process millions of data points instantly"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Enterprise-Grade Security",
    description: "SOC 2 compliant with end-to-end encryption"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Role-Based Access Control",
    description: "Granular permissions for team management"
  }
];

export default function UpgradePage() {
  const { isPremium, setPremium } = useSubscription();
  const router = useRouter();
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const handleUpgrade = () => {
    setPremium();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm font-medium" variant="secondary">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI Infrastructure for Modern Aquaculture
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
              From Features to
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Predictive Intelligence
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
              Transform your aquaculture operations with AI-powered insights,
              real-time monitoring, and predictive analytics.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={handleUpgrade} className="group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/dashboard")}>
                View Live Demo
              </Button>
            </div>
          </motion.div>

          {/* Live System Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isHeroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>System Active</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse text-primary" />
              <span>AI Models Running</span>
            </div>
            <span>·</span>
            <span>12,847 farms optimized</span>
          </motion.div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Measurable Impact
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Real results from farms using our AI-powered platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactMetrics.map((metric) => (
              <AnimatedStatCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Intelligence at Your Fingertips
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Beautiful, intuitive dashboards that turn complex data into clear actions
            </p>
          </motion.div>

          <DashboardMockup />
        </div>
      </section>

      {/* AI Architecture */}
      <AIArchitectureDiagram />

      {/* Risk Meter Demo */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4" variant="secondary">
                <Brain className="w-4 h-4 mr-2 inline" />
                Predictive AI
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                Real-Time Risk Detection
              </h2>
              
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                Our AI continuously monitors water quality, feed conversion, and mortality patterns
                to predict issues before they become critical.
              </p>

              <ul className="space-y-4">
                {[
                  "Early disease outbreak detection",
                  "Water quality anomaly alerts",
                  "Feed efficiency optimization",
                  "Mortality pattern analysis"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <InteractiveRiskMeter />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Built on Scalable Cloud Infrastructure
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Enterprise-grade reliability and security
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Choose Your Intelligence Level
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              From individual farmers to enterprise operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <Card className={`flex flex-col h-full ${tier.popular ? 'border-primary border-2 shadow-2xl scale-105' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1">
                        <Sparkles className="w-3 h-3 mr-1 inline" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className={tier.popular ? 'text-primary' : ''}>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 space-y-6">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        {tier.period && <span className="text-slate-500">{tier.period}</span>}
                      </div>
                      {tier.yearlyPrice && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-slate-600">{tier.yearlyPrice}</span>
                          <Badge variant="secondary" className="text-xs">{tier.savings}</Badge>
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          {feature.startsWith('Everything') ? (
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{feature}</span>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <div className="p-6 pt-0">
                    {tier.name === "Free" ? (
                      <Button className="w-full" variant={tier.variant} disabled>
                        {tier.cta}
                      </Button>
                    ) : tier.name === "Pro" ? (
                      isPremium ? (
                        <Button className="w-full" disabled variant="outline">
                          You are a Premium User
                        </Button>
                      ) : (
                        <Button className="w-full" variant={tier.variant} onClick={handleUpgrade}>
                          {tier.cta}
                        </Button>
                      )
                    ) : (
                      <Button className="w-full" variant={tier.variant}>
                        {tier.cta}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Join thousands of farmers leveraging AI to optimize operations and maximize profits
          </p>
          <Button size="lg" onClick={handleUpgrade} className="group">
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
