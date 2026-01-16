import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    const baseClasses = "p-4 rounded-xl shadow-sm border border-gray-100";
    const bgClass = className.includes('bg-') ? '' : 'bg-white';

    return (
        <div
            className={`${baseClasses} ${bgClass} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
