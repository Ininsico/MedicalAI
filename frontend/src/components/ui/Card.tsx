"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'white' | 'glass' | 'teal' | 'outline';
    hover?: boolean;
}

export const Card = ({ children, className, variant = 'white', hover = true }: CardProps) => {
    const variants = {
        white: "bg-white shadow-premium",
        glass: "glass-panel border-white/50 shadow-xl",
        teal: "bg-teal-600 text-white shadow-lg shadow-teal-600/20",
        outline: "border-2 border-slate-100 bg-transparent",
    };

    return (
        <motion.div
            whileHover={hover ? { y: -5, scale: 1.01 } : {}}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "rounded-[32px] p-8",
                variants[variant],
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("mb-6", className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={cn("text-xl font-bold text-slate-900 tracking-tight", className)}>{children}</h3>
);
