"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Brain,
    Building2,
    CheckCircle2,
    ChevronDown,
    Clock,
    Database,
    FileCheck,
    Globe2,
    LayoutDashboard,
    Lock,
    Network,
    Scale,
    ShieldCheck,
    Stethoscope,
    Workflow,
    ArrowRight,
    Server
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900">
            <Navbar />

            {/* 1. Hero Section: Corporate & Clinical */}
            <section className="pt-48 pb-24 px-6 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-8">
                                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                <span>Enterprise Grade AI</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
                                The Operating System for <br />
                                <span className="text-teal-600">Neurology Departments.</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-2xl">
                                ParkiTrack isn't just an app. It's a full-stack clinical infrastructure that integrates with Epic, Cerner, and Allscripts to automate patient monitoring at scale.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" className="h-14 px-8 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-lg">
                                    Book Platform Demo
                                </Button>
                                <Button size="lg" variant="ghost" className="h-14 px-8 text-lg border-2 border-slate-200 text-slate-700 hover:border-slate-300 rounded-lg">
                                    Calculate ROI
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Abstract Visualization of "Order from Chaos" */}
                    <div className="lg:w-1/2 relative">
                        <div className="relative aspect-square max-w-lg mx-auto">
                            {/* Central Node */}
                            <div className="absolute inset-0 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center">
                                <div className="w-2/3 h-2/3 bg-white rounded-full shadow-2xl flex items-center justify-center border border-slate-100 z-20">
                                    <Activity size={64} className="text-teal-600" />
                                </div>
                                {/* Satellite Nodes */}
                                <NodeIcon icon={<Database size={24} />} angle={0} />
                                <NodeIcon icon={<Network size={24} />} angle={60} />
                                <NodeIcon icon={<Lock size={24} />} angle={120} />
                                <NodeIcon icon={<Globe2 size={24} />} angle={180} />
                                <NodeIcon icon={<Brain size={24} />} angle={240} />
                                <NodeIcon icon={<Server size={24} />} angle={300} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. The Core Problem: Standardization */}
            <section className="py-24 px-6 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Replacing Subjectivity with Data.</h2>
                    <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
                        Traditional neurology relies on episodic observation. We provide continuous, objective quantification of motor symptoms.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
                    <ComparisonBox
                        title="Current Standard of Care"
                        items={[
                            "Subjective 15-min observation",
                            "Self-reported patient diaries (unreliable)",
                            "Manual data entry into EHR",
                            "Reactive medication adjustments"
                        ]}
                        isNegative
                    />
                    <ComparisonBox
                        title="The ParkiTrack Standard"
                        items={[
                            "Continuous 24/7 passive monitoring",
                            "Objective sensor-based quantification",
                            "Automated HL7/FHIR Data Sync",
                            "Proactive AI-driven alerts"
                        ]}
                    />
                </div>
            </section>

            {/* 3. Integration Ecosystem (New) */}
            <section className="py-32 px-6 border-b border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="md:w-1/2">
                            <span className="text-teal-600 font-bold uppercase tracking-widest text-sm mb-2 block">Interoperability First</span>
                            <h2 className="text-4xl font-black text-slate-900 mb-6">Seamless EHR Integration.</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                We know that adding another portal creates fatigue. That's why ParkiTrack lives inside your existing workflow.
                                We support bi-directional data sync via FHIR R4 resources.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center text-slate-700 font-medium">
                                    <CheckCircle2 className="text-teal-600 mr-3" size={20} />
                                    Single Sign-On (SSO) with Active Directory
                                </li>
                                <li className="flex items-center text-slate-700 font-medium">
                                    <CheckCircle2 className="text-teal-600 mr-3" size={20} />
                                    SMART on FHIR Launch Support
                                </li>
                                <li className="flex items-center text-slate-700 font-medium">
                                    <CheckCircle2 className="text-teal-600 mr-3" size={20} />
                                    Automated CPT Code Billing Generation
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-2 gap-4">
                            {/* Mock Logos for EHR systems - using text placeholders to remain generic but realistic */}
                            <EhrCard name="Epic Systems" status="Verified Partner" />
                            <EhrCard name="Oracle Cerner" status="Compatible" />
                            <EhrCard name="Allscripts" status="Compatible" />
                            <EhrCard name="AthenaHealth" status="In Review" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. The AI Triage Workflow (New) */}
            <section className="py-32 px-6 bg-slate-50 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Intelligent Triage Pipeline</h2>
                        <p className="text-slate-500">How our agents process millions of data points to surface only what matters.</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[2.25rem] left-0 w-full h-1 bg-slate-200 -z-10" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <WorkflowStep
                                phase="01. Ingestion"
                                title="Raw Signal"
                                desc="Gyroscope & Accelerometer data collected at 60Hz from patient devices."
                                icon={<Activity />}
                            />
                            <WorkflowStep
                                phase="02. Processing"
                                title="Noise Reduction"
                                desc="Bandpass filtering removes non-tremor voluntary movements and artifacts."
                                icon={<Scale />}
                            />
                            <WorkflowStep
                                phase="03. Inference"
                                title="Neural Analysis"
                                desc="CNN assigns UPDRS-equivalent severity score with 98% confidence."
                                icon={<Brain />}
                            />
                            <WorkflowStep
                                phase="04. Action"
                                title="Clinical Alert"
                                desc="Abnormal deviations trigger a 'Red Flag' in the physician's inbox."
                                icon={<FileCheck />}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Enterprise Security (New) */}
            <section className="py-24 px-6 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2">
                        <ShieldCheck className="w-16 h-16 text-teal-500 mb-8" />
                        <h2 className="text-4xl font-bold mb-6">Defense-Grade Data Security.</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            We exceed HIPAA requirements with a Zero-Trust architecture. Your patient data is never decrypted
                            except on authorized clinical devices.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3 text-sm font-bold text-slate-300">
                                <Lock size={16} className="text-teal-500" /> <span>SOC 2 Type II Certified</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm font-bold text-slate-300">
                                <Lock size={16} className="text-teal-500" /> <span>AES-256 Encryption</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm font-bold text-slate-300">
                                <Lock size={16} className="text-teal-500" /> <span>GDPR Compliant</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm font-bold text-slate-300">
                                <Lock size={16} className="text-teal-500" /> <span>BAA Available</span>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-4">Compliance Audit Log</h3>
                        <div className="space-y-4 font-mono text-sm text-slate-400">
                            <div className="flex justify-between">
                                <span>[2024-01-29 10:42:01]</span>
                                <span className="text-teal-500">ENCRYPTION_KEY_ROTATION_SUCCESS</span>
                            </div>
                            <div className="flex justify-between">
                                <span>[2024-01-29 10:42:05]</span>
                                <span className="text-teal-500">PENETRATION_TEST_PASSED</span>
                            </div>
                            <div className="flex justify-between">
                                <span>[2024-01-29 10:45:12]</span>
                                <span className="text-teal-500">HIPAA_POLICY_CHECK_OK</span>
                            </div>
                            <div className="flex justify-between">
                                <span>[2024-01-29 10:48:33]</span>
                                <span className="text-teal-500">ACCESS_CONTROL_VERIFIED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Implementation Timeline (New) */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-teal-600 font-bold uppercase tracking-widest text-sm">Deployment Roadmap</span>
                        <h2 className="text-4xl font-black text-slate-900 mt-2">Live in 4 Weeks.</h2>
                    </div>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        <TimelineItem
                            week="Week 1"
                            title="Technical Discovery"
                            desc="We map your existing EHR workflows and establish secure VPN tunnels."
                        />
                        <TimelineItem
                            week="Week 2"
                            title="Pilot Configuration"
                            desc="Setting up department-specific thresholds and physician dashboards."
                        />
                        <TimelineItem
                            week="Week 3"
                            title="Staff Training"
                            desc="On-site workshops for nurses and neurologists. (Typically takes <4 hours)."
                        />
                        <TimelineItem
                            week="Week 4"
                            title="Go Live"
                            desc="Full department rollout with 24/7 dedicated support standby."
                            isFinal
                        />
                    </div>
                </div>
            </section>

            {/* 7. FAQ Section (New) */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <FaqItem
                            q="Is FDA clearance required for internal research use?"
                            a="For purely research purposes in controlled studies, standard IRB approval is sufficient. For clinical decision support, we operate under the SaMD (Software as a Medical Device) framework."
                        />
                        <FaqItem
                            q="Can we export the raw accelerometer data?"
                            a="Yes. Unlike competitors, we provide full access to raw CSV/JSON dumps for your data science teams to run their own models on."
                        />
                        <FaqItem
                            q="How does billing work for Remote Patient Monitoring (RPM)?"
                            a="ParkiTrack automatically logs time spent reviewing data, generating audit-ready reports for CPT codes 99453, 99454, and 99457."
                        />
                    </div>
                </div>
            </section>

            {/* 8. Final CTA */}
            <section className="py-32 px-6 bg-slate-900 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                        Ready to modernize your Neurology Department?
                    </h2>
                    <p className="text-xl text-slate-400 mb-12">
                        Join 200+ forward-thinking clinics using ParkiTrack.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/contact">
                            <Button size="lg" className="h-16 px-12 text-lg font-bold bg-teal-500 hover:bg-teal-400 text-white rounded-lg w-full sm:w-auto">
                                Schedule Consultation
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="lg" variant="ghost" className="h-16 px-12 text-lg font-bold border-2 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg w-full sm:w-auto">
                                View Technical Docs
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

// --- Subcomponents ---

function NodeIcon({ icon, angle }: { icon: any, angle: number }) {
    // Positioning logic for circular layout
    const radius = 140; // distance from center
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return (
        <div
            className="absolute w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-600"
            style={{
                transform: `translate(${x}px, ${y}px)`,
            }}
        >
            {icon}
        </div>
    )
}

function ComparisonBox({ title, items, isNegative = false }: any) {
    return (
        <div className={cn("p-12", isNegative ? "bg-slate-800/50" : "bg-slate-800")}>
            <h3 className={cn("text-xl font-bold mb-8", isNegative ? "text-slate-400" : "text-teal-400")}>
                {title}
            </h3>
            <ul className="space-y-6">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start">
                        {isNegative ? (
                            <span className="mt-1 w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center mr-4 text-xs text-slate-600">✕</span>
                        ) : (
                            <CheckCircle2 className="w-6 h-6 text-teal-500 mr-4 shrink-0" />
                        )}
                        <span className={cn("text-lg", isNegative ? "text-slate-500 line-through decoration-slate-600" : "text-slate-200")}>
                            {item}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function EhrCard({ name, status }: any) {
    return (
        <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-slate-700">{name}</span>
            <span className="text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded text-slate-500">
                {status}
            </span>
        </div>
    )
}

function WorkflowStep({ phase, title, desc, icon }: any) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                {React.cloneElement(icon, { size: 28 })}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{phase}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
                {desc}
            </p>
        </div>
    )
}

function TimelineItem({ week, title, desc, isFinal }: any) {
    return (
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Dot */}
            <div className="absolute left-0 w-10 h-10 bg-white border-4 border-teal-500 rounded-full md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-10">
                {isFinal && <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />}
            </div>

            {/* Content */}
            <div className="ml-16 md:ml-0 md:w-[45%] p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors">
                <span className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-1 block">{week}</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500">{desc}</p>
            </div>
        </div>
    )
}

function FaqItem({ q, a }: any) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50 transition-colors"
            >
                <span className="font-bold text-slate-900 text-lg">{q}</span>
                <ChevronDown className={cn("transition-transform text-slate-400", isOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100">
                            {a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
