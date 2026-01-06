// src/components/core/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react'; // For loading spinner

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'ghost'
    size = 'md', // 'sm', 'md', 'lg'
    leftIcon,
    rightIcon,
    isLoading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = "font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2";

    const variantStyles = {
        primary: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm shadow-slate-900/10 focus:ring-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:focus:ring-white",
        secondary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 focus:ring-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400",
        danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500",
        outline: "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-500",
        ghost: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50 focus:ring-slate-500",
    };

    const sizeStyles = {
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3.5 text-base",
    };

    const widthStyle = fullWidth ? "w-full" : "";
    const isDisabled = disabled || isLoading;
    const finalDisabledStyle = isDisabled ? "opacity-60 cursor-not-allowed active:scale-100" : "cursor-pointer";

    const spinnerSize = size === 'sm' ? 14 : (size === 'lg' ? 20 : 16);

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${finalDisabledStyle} ${className}`}
            {...props}
        >
            {isLoading && (
                <Loader2 size={spinnerSize} className="animate-spin" />
            )}
            {!isLoading && leftIcon && <span className="icon-left">{leftIcon}</span>}

            <span className={isLoading ? 'ml-2' : ''}>{children}</span>

            {!isLoading && rightIcon && <span className="icon-right">{rightIcon}</span>}
        </button>
    );
};

export default Button;