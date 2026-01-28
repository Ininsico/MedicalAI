"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center rounded-2xl font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 overflow-hidden group";

    const variants = {
        primary: "bg-gray-900 text-white shadow-xl shadow-gray-900/10 hover:bg-teal-600 hover:shadow-teal-600/20",
        secondary: "bg-teal-50 text-teal-700 hover:bg-teal-100",
        outline: "border-2 border-gray-200 text-gray-900 hover:border-teal-600 hover:text-teal-600",
        ghost: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        glass: "glass-morphism text-teal-700 hover:bg-teal-50/50",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm rounded-xl",
        md: "px-6 py-3 text-base rounded-2xl",
        lg: "px-8 py-4 text-lg rounded-2xl",
        xl: "px-10 py-5 text-xl rounded-3xl",
    };

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            // @ts-ignore
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Please wait...</span>
                </div>
            ) : children}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
    );
};

export default Button;
