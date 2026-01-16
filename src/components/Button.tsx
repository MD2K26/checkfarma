import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-brand-blue text-white hover:opacity-90",
        danger: "bg-brand-red text-white hover:opacity-90",
        secondary: "bg-brand-gray text-white hover:bg-gray-700",
        outline: "border-2 border-brand-blue text-brand-blue hover:bg-blue-50"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        />
    );
};

export default Button;
