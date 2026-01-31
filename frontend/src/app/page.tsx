
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
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
  Quote,
  Github
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const dummyData = [
  { time: '08:00', tremor: 2, stiffness: 1 },
  { time: '10:00', tremor: 4, stiffness: 3 },
  { time: '12:00', tremor: 3, stiffness: 2 },
  { time: '14:00', tremor: 6, stiffness: 4 },
  { time: '16:00', tremor: 5, stiffness: 3 },
  { time: '18:00', tremor: 3, stiffness: 2 },
  { time: '20:00', tremor: 2, stiffness: 1 },
];

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
              <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Open Source Healthcare Initiative</span>
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
              <Link href="https://github.com/Ininsico/MedicalAI" target="_blank">
                <Button variant="white" size="lg" className="w-full sm:w-auto border border-slate-100">
                  <Github size={20} className="mr-2" /> Contribute to Core
                </Button>
              </Link>
            </motion.div>

            {/* Dashboard Mockup with Interactive Graph */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="relative w-full max-w-5xl pt-12"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-teal-500/10 blur-[150px] -z-10 rounded-full" />
              <div className="glass-panel rounded-[40px] p-2 shadow-2xl border-white/50 backdrop-blur-3xl overflow-hidden aspect-[16/9] relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />
                <div className="w-full h-full bg-slate-900 rounded-[32px] border border-white/10 flex flex-col overflow-hidden relative">

                  {/* Mock Window Controls */}
                  <div className="h-12 border-b border-white/10 flex items-center px-6 space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <div className="ml-4 px-3 py-1 bg-white/5 rounded-md text-[10px] font-mono text-slate-500">
                      user_dashboard_v4.2.tsx
                    </div>
                  </div>

                  {/* Graph Area */}
                  <div className="flex-1 p-8 relative">
                    <div className="absolute top-8 left-8 z-10">
                      <h3 className="text-white font-bold text-lg">Live Tremor Analysis</h3>
                      <p className="text-slate-400 text-sm">Real-time sensor fusion data</p>
                    </div>
                    <div className="w-full h-full pt-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dummyData}>
                          <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="stiffnessColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="tremor"
                            stroke="#14b8a6"
                            strokeWidth={3}
                            fill="url(#splitColor)"
                            animationDuration={2000}
                          />
                          <Area
                            type="monotone"
                            dataKey="stiffness"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fill="url(#stiffnessColor)"
                            animationDuration={2500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Mock Stats */}
                  <div className="h-24 border-t border-white/10 grid grid-cols-3 divide-x divide-white/10">
                    <div className="flex flex-col items-center justify-center p-4">
                      <span className="text-2xl font-black text-white">98.2%</span>
                      <span className="text-[10px] uppercase tracking-widest text-teal-500">Accuracy</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                      <span className="text-2xl font-black text-white">0.4s</span>
                      <span className="text-[10px] uppercase tracking-widest text-indigo-500">Latency</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                      <span className="text-2xl font-black text-white">AES-256</span>
                      <span className="text-[10px] uppercase tracking-widest text-emerald-500">Encryption</span>
                    </div>
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

      {/* Testimonials Section */}
      <section className="py-32 px-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-100/30 skew-x-12" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
              Trusted by the Community
            </h2>
            <p className="text-slate-500 text-lg">
              Hear from the patients, caregivers, and neurologists who rely on our open-source tools daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The tremor-safe sliders are a game changer. I can actually log my symptoms on bad days without frustration."
              author="Sarah Jenkins"
              role="Patient since 2023"
            />
            <TestimonialCard
              quote="Seeing the longitudinal data helped my neurologist adjust my levodopa dosage precisely. It's invaluable."
              author="Michael Chen"
              role="Patient"
            />
            <TestimonialCard
              quote="Finally, an app that focuses on the clinical data we actually need. The PDF exports are comprehensive."
              author="Dr. Emily Weiss"
              role="Neurologist"
            />
          </div>
        </div>
      </section>

      {/* Collaboration / Attribution Section */}
      <section className="py-24 px-6 bg-white border-t border-slate-100 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 text-teal-600 font-bold uppercase tracking-widest text-xs mb-8">
            <Sparkles size={14} />
            <span>Academic Collaboration</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12">
            Built with precision by <span className="text-teal-600">Arslan Rathore</span> <br />
            in collaboration with
          </h2>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block p-8 bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100"
          >
            <Image
              src="/Comsats.png"
              alt="COMSATS University Logo"
              width={180}
              height={180}
              className="mx-auto"
            />
            <p className="mt-6 font-serif italic text-slate-500 text-lg">COMSATS University Islamabad,<br /> Abbottabad Campus</p>
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
            SSI delivers on that promise with elegance."
          </h2>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-xl tracking-wide uppercase">Mr. Arslan Rathore</span>
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
          <p className="mt-10 text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">OPEN SOURCE • FREE FOREVER • PRIVACY FIRST</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Activity size={22} className="text-teal-500" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">SSI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-bold text-sm text-slate-400 uppercase tracking-widest">
            <Link href="https://github.com/Ininsico/MedicalAI" className="hover:text-teal-600 transition-all flex items-center"><Github size={16} className="mr-2" /> Source Code</Link>
            <Link href="#" className="hover:text-teal-600 transition-all">Neuro-Ethics</Link>
            <Link href="#" className="hover:text-teal-600 transition-all">Privacy Labs</Link>
          </div>
          <div className="text-slate-400 font-bold text-sm">© 2024 Arslan Rathore & COMSATS.</div>
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

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <Card className="p-8 border-none bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
      <Quote className="absolute top-8 right-8 text-teal-100 w-12 h-12 -rotate-12 group-hover:scale-110 transition-transform" />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <p className="text-slate-600 text-lg font-medium italic leading-relaxed mb-8">"{quote}"</p>
        <div>
          <h4 className="font-black text-slate-900 text-lg">{author}</h4>
          <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">{role}</span>
        </div>
      </div>
    </Card>
  );
}
