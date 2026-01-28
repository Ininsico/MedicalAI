"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className={`relative flex justify-between items-center px-6 py-3 rounded-2xl transition-all duration-300 ${scrolled ? 'glass-morphism shadow-lg border-teal-500/10' : 'bg-transparent'
                    }`}>
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-teal-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-teal-600/20">
                            <Activity size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                            Parki<span className="text-teal-600">Track</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['About', 'Features', 'Community', 'Research'].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-[15px] font-medium text-gray-600 hover:text-teal-600 transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                            <Link href="/login" className="text-[15px] font-semibold text-teal-600 hover:text-teal-700">
                                Sign In
                            </Link>
                            <Link href="/signup">
                                <button className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/20 active:scale-95 transition-all">
                                    Join Free
                                </button>
                            </Link>
                        </div>
                    </div>

                    <button
                        className="md:hidden text-gray-900 p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-0 w-full p-6"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl border border-teal-50 p-8 flex flex-col space-y-6">
                            {['About', 'Features', 'Community', 'Research'].map((item) => (
                                <Link key={item} href="#" className="text-lg font-bold text-gray-900">{item}</Link>
                            ))}
                            <div className="h-px bg-gray-100 w-full" />
                            <Link href="/login" className="text-lg font-bold text-teal-600">Sign In</Link>
                            <Link href="/signup">
                                <button className="w-full bg-teal-600 text-white py-4 rounded-2xl text-lg font-bold">
                                    Start Tracking
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
