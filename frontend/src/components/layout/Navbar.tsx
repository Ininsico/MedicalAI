"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const navLinks = [
        { name: 'Product', href: '/product' },
        { name: 'Solutions', href: '/solutions' },
        { name: 'Research', href: '/#research' },
        { name: 'Company', href: '/#company' },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-[100] transition-all duration-500",
                scrolled ? "py-4" : "py-8"
            )}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div
                    className={cn(
                        "relative flex justify-between items-center px-8 py-4 rounded-[24px] transition-all duration-500",
                        scrolled ? "glass-nav shadow-2xl border-white/20" : "bg-transparent"
                    )}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-teal-600/20">
                            <Activity size={22} className="text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-teal-600 transition-colors">
                            ParkiTrack
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center space-x-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors tracking-tight"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-2 mr-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </Link>
                        </div>
                        <Link href="/signup">
                            <Button variant="dark" size="sm" className="hidden md:flex">
                                Start Free <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Link>
                        <button
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-900 bg-slate-100 rounded-xl"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="lg:hidden absolute top-full left-0 w-full p-6"
                    >
                        <div className="glass-panel rounded-[32px] p-8 shadow-2xl border border-slate-200/50 flex flex-col space-y-6">
                            {navLinks.map((link) => (
                                <Link key={link.name} href={link.href} className="text-xl font-bold text-slate-900">{link.name}</Link>
                            ))}
                            <hr className="border-slate-100" />
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Link href="/login" className="w-full">
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link href="/signup" className="w-full">
                                    <Button variant="primary" className="w-full">Sign Up</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
