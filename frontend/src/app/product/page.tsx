"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Cpu,
    Database,
    Shield,
    Smartphone,
    Zap,
    Share2,
    Code2,
    Github,
    ArrowRight,
    Play
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProductPage() {
    return (
        <div className="min-h-screen bg-white selection:bg-teal-100 selection:text-teal-900">
            <Navbar />

            {/* Header / Hero */}
            <section className="pt-48 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-mesh-premium opacity-50 skew-y-12 translate-x-1/4 -z-10" />
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-teal-600 font-black text-xs uppercase tracking-[0.3em] mb-4 inline-block">AI-Powered Diagnostic Engine</span>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 max-w-5xl mx-auto leading-none">
                            Automating the Future of <br />
                            <span className="text-gradient">Medical Diagnosis.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
                            ParkiTrack leverages advanced neural networks to detect early-stage Parkinson's markers.
                            Autonomous, precise, and continuously learning from every interaction.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="https://github.com/Ininsico/MedicalAI" target="_blank">
                                <Button size="lg" variant="dark" className="px-10 h-16 rounded-[24px] text-lg">
                                    <Github className="mr-3" size={24} /> View AI Models
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button size="lg" variant="white" className="px-10 h-16 rounded-[24px] text-lg border border-slate-200">
                                    Live Demo <Play className="ml-3" size={20} />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PillarCard
                            icon={<Cpu size={32} />}
                            title="Neural Sensor Fusion"
                            description="Our AI fuses data from accelerometers and gyroscopes, using Deep Learning to quantify tremor severity with clinical precision."
                            color="text-teal-500"
                        />
                        <PillarCard
                            icon={<Shield size={32} />}
                            title="Automated Triage"
                            description="AI algorithms analyze patient inputs in real-time, automatically flagging high-risk cases for immediate medical review."
                            color="text-indigo-500"
                        />
                        <PillarCard
                            icon={<Database size={32} />}
                            title="Predictive Analytics"
                            description="Machine learning models forecast symptom progression, allowing doctors to intervene before severe motor degradation occurs."
                            color="text-rose-500"
                        />
                    </div>
                </div>
            </section>

            {/* Technical Deep Dive */}
            <section className="py-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">
                                Built on Cutting-Edge AI Infrastructure.
                            </h2>
                            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                                We've replaced manual diagnostic heuristics with a scalable, automated AI pipeline.
                                Designed for high-throughput analysis and seamless integration with hospital systems.
                            </p>

                            <ul className="space-y-6">
                                <TechItem title="Inference Engine" desc="ONNX Runtime running quantized models on the edge" />
                                <TechItem title="Backend Processing" desc="Python (FastAPI) microservices for heavy ML lifting" />
                                <TechItem title="Data Pipeline" desc="Real-time stream processing with Apache Kafka & Supabase" />
                                <TechItem title="Security" desc="Federated Learning capable & HIPAA compliant architecture" />
                            </ul>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 blur-[100px] opacity-20 rounded-full" />
                            <div className="relative bg-slate-900 rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/10 text-white font-mono text-sm leading-relaxed overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-10 bg-white/5 border-b border-white/5 flex items-center px-4 space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    <span className="ml-4 opacity-50">data_processor.ts</span>
                                </div>
                                <div className="mt-8 text-slate-400 group-hover:text-slate-300 transition-colors">
                                    <span className="text-purple-400">interface</span> <span className="text-yellow-400">TremorData</span> {'{'} <br />
                                    &nbsp;&nbsp;frequency: <span className="text-teal-400">number</span>;<br />
                                    &nbsp;&nbsp;amplitude: <span className="text-teal-400">number</span>;<br />
                                    &nbsp;&nbsp;confidence: <span className="text-teal-400">number</span>;<br />
                                    {'}'}<br /><br />

                                    <span className="text-blue-400">const</span> analyzeMovement = <span className="text-blue-400">async</span> (raw: <span className="text-teal-400">SensorStream</span>) =&gt; {'{'}<br />
                                    &nbsp;&nbsp;<span className="text-slate-500">// FFT processing for noise reduction</span><br />
                                    &nbsp;&nbsp;<span className="text-blue-400">const</span> clean = signal.filter(raw, <span className="text-red-400">NOISE_THRESHOLD</span>);<br />
                                    &nbsp;&nbsp;<span className="text-pink-400">return</span> MLModel.predict(clean);<br />
                                    {'}'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Source CTA */}
            <section className="py-24 bg-slate-900 text-center px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <Code2 className="w-16 h-16 text-teal-500 mx-auto mb-8" />
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
                        Free. Open. Yours.
                    </h2>
                    <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                        We believe healthcare algorithms should be transparent. That's why ParkiTrack is MIT Licensed.
                        Fork it, modify it, deploy it for your clinic without paying a cent.
                    </p>
                    <Link href="https://github.com/Ininsico/MedicalAI" target="_blank">
                        <Button size="lg" className="h-16 px-12 text-xl rounded-full shadow-glow">
                            Fork Repository <Share2 size={24} className="ml-3" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

function PillarCard({ icon, title, description, color }: any) {
    return (
        <Card className="p-10 border-none shadow-premium hover:shadow-2xl transition-all duration-300">
            <div className={cn("inline-flex p-4 rounded-2xl bg-slate-50 mb-6", color)}>
                {icon}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
        </Card>
    );
}

function TechItem({ title, desc }: any) {
    return (
        <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mr-4">
                <Zap size={20} />
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-lg">{title}</h4>
                <p className="text-slate-500">{desc}</p>
            </div>
        </div>
    )
}
