"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Activity,
  Zap,
  ShieldCheck,
  Users,
  Sparkles,
  BarChart3,
  Stethoscope,
  Heart,
  ChevronRight,
  Plus
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { staggerChildren: 0.1 }
  };

  return (
    <div className="relative min-h-screen bg-mesh-premium selection:bg-teal-100 selection:text-teal-900 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-12">

            {/* Badge */}
            <motion.div
              {...fadeIn}
              className="inline-flex items-center space-x-2 bg-white/50 border border-white px-5 py-2 rounded-full shadow-premium"
            >
              <span className="p-1 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Intelligent Healthcare Assistant</span>
            </motion.div>

            {/* Title */}
            <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-8">
                Simplified <br />
                <span className="text-gradient">Symptom Intelligence.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-500 font-medium leading-relaxed">
                Empowering Parkinson's management through effortless tracking
                and precision AI clinical insights.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto shadow-glow">
                  Sign Up for Free <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Button variant="white" size="lg" className="w-full sm:w-auto border border-slate-100">
                View Scientific Methodology
              </Button>
            </motion.div>

            {/* Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="relative w-full max-w-6xl pt-12"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-teal-500/10 blur-[150px] -z-10 rounded-full" />
              <div className="glass-panel rounded-[40px] p-4 shadow-2xl border-white/50 backdrop-blur-3xl overflow-hidden aspect-video relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />
                <div className="w-full h-full bg-slate-900/5 rounded-[32px] flex items-center justify-center border border-white/20">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                      <Activity className="text-teal-600 w-10 h-10" />
                    </div>
                    <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Live Interactive Dashboard</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-none">
                Clinical Precision. <br />
                <span className="text-teal-600 italic font-serif text-5xl md:text-7xl">Patient Simplicity.</span>
              </h2>
              <div className="h-1.5 w-24 bg-teal-600 rounded-full" />
            </div>
            <p className="max-w-md text-slate-500 text-lg font-medium">
              We've redesigned medical tracking from the ground up, focusing on
              accessibility for those with motor challenges.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              title="60s Rapid Check-in"
              description="Proprietary 'Tremor-Safe' sliders allow for accurate data entry even during periods of high motor activity."
              accent="bg-teal-500"
            />
            <FeatureCard
              icon={<Sparkles className="w-7 h-7" />}
              title="Predictive AI Insights"
              description="Pattern recognition models monitor your 7-day baseline to predict and alert you to potential symptom spikes."
              accent="bg-cyan-500"
            />
            <FeatureCard
              icon={<BarChart3 className="w-7 h-7" />}
              title="Doctor-Ready Analytics"
              description="Beautifully formatted PDF reports that provide clinicians with high-density data on your daily progress."
              accent="bg-emerald-500"
            />
            <FeatureCard
              icon={<ShieldCheck className="w-7 h-7" />}
              title="End-to-End Privacy"
              description="Your data is encrypted and controlled strictly by you. Share only what you want, when you want."
              accent="bg-indigo-500"
            />
            <FeatureCard
              icon={<Users className="w-7 h-7" />}
              title="Collaborative Care"
              description="Dedicated caregiver interface with real-time sync, ensuring your support system stays informed."
              accent="bg-rose-500"
            />
            <FeatureCard
              icon={<Heart className="w-7 h-7" />}
              title="Holistic Monitoring"
              description="Beyond motor symptoms, track sleep quality, mood fluctuations, and medication adherence in one place."
              accent="bg-pink-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-premium opacity-[0.03] grayscale" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <Stethoscope className="text-teal-500 w-16 h-16 mx-auto mb-10 opacity-50" />
          <h2 className="text-3xl md:text-5xl font-serif text-white italic leading-relaxed mb-12">
            "Technology should be the bridge, not the barrier, in neurological care.
            ParkiTrack deliveres on that promise with elegance."
          </h2>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-xl tracking-wide uppercase">Dr. Arslan Abdullah</span>
            <span className="text-teal-500 font-bold text-xs tracking-[0.3em] uppercase mt-2">Chief Medical Advisor</span>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-48 px-6 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[150%] bg-teal-500/5 blur-[120px] rounded-full -z-10" />
        <motion.div {...fadeIn}>
          <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-10 leading-none">
            Start Your Journey <br />
            <span className="italic font-serif font-light text-slate-400">Toward Better Health.</span>
          </h2>
          <Link href="/signup">
            <Button size="lg" className="px-16 py-8 text-2xl rounded-[32px] shadow-glow">
              Initialize Free Account <ArrowRight size={32} className="ml-4" />
            </Button>
          </Link>
          <p className="mt-10 text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">JOIN 2,400+ PATIENTS ALREADY ONBOARDED</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Activity size={22} className="text-teal-500" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">ParkiTrack</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-bold text-sm text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-teal-600 transition-all">Neuro-Ethics</Link>
            <Link href="#" className="hover:text-teal-600 transition-all">Clinical Data</Link>
            <Link href="#" className="hover:text-teal-600 transition-all">Privacy Labs</Link>
            <Link href="#" className="hover:text-teal-600 transition-all">Connect</Link>
          </div>
          <div className="text-slate-400 font-bold text-sm">© 2024 NEURODYNAMIC SYSTEMS.</div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, accent }: { icon: React.ReactNode, title: string, description: string, accent: string }) {
  return (
    <Card className="group border border-slate-50">
      <div className={cn("w-16 h-16 rounded-[24px] mb-8 flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6", accent)}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed mb-6">{description}</p>
      <div className="flex items-center text-teal-600 font-bold text-sm group-hover:gap-2 transition-all cursor-pointer">
        Explore Module <ChevronRight size={16} />
      </div>
    </Card>
  );
}
