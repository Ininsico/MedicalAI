"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white' | 'dark';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-[0.98]",
            secondary: "bg-teal-50 text-teal-700 hover:bg-teal-100 active:scale-[0.98]",
            outline: "border-2 border-slate-200 bg-transparent hover:border-teal-600 hover:text-teal-600 active:scale-[0.98]",
            ghost: "hover:bg-slate-50 text-slate-600 hover:text-slate-900 active:scale-[0.98]",
            white: "bg-white text-slate-900 shadow-xl hover:bg-slate-50 active:scale-[0.98]",
            dark: "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]",
        };

        const sizes = {
            sm: "px-4 py-2 text-sm rounded-xl",
            md: "px-6 py-3 text-base rounded-2xl font-semibold",
            lg: "px-8 py-4 text-lg rounded-2xl font-bold",
            icon: "p-3 rounded-xl",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "relative inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && children}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
