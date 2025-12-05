import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center border-none rounded-md font-semibold text-base px-6 py-3 transition-all duration-200 ease-in-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-md",
        secondary: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5",
    };

    const widthStyles = fullWidth ? "w-full" : "w-auto";
    const loadingStyles = isLoading ? "text-transparent relative" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${widthStyles} ${loadingStyles} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {children}
            {isLoading && (
                <div className="absolute w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
            )}
        </button>
    );
};
