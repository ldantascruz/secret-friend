import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <label className="text-sm font-medium text-text">{label}</label>}
            <input
                className={`p-3 border border-border rounded-md text-base transition-colors duration-200 w-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${error ? 'border-red-500' : ''} ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
            {helperText && !error && <span className="text-xs text-text-muted">{helperText}</span>}
        </div>
    );
};
