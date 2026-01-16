import React from 'react';
import Card from './Card';

interface AccordionProps {
    title: string;
    score?: number; // Optional score to show in header
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, score, children, defaultOpen = false }) => {
    return (
        <details className="group mb-4" open={defaultOpen}>
            <summary className="list-none cursor-pointer">
                <Card className="flex justify-between items-center bg-gray-50 group-open:bg-white group-open:ring-2 group-open:ring-brand-green transition-all">
                    <span className="font-semibold text-gray-800">{title}</span>
                    <div className="flex items-center gap-2">
                        {score !== undefined && (
                            <span className={`text-sm font-bold ${score >= 80 ? 'text-brand-green' : 'text-brand-red'}`}>
                                {score}%
                            </span>
                        )}
                        <span className="transform group-open:rotate-180 transition-transform text-gray-500">▼</span>
                    </div>
                </Card>
            </summary>
            <div className="mt-2 pl-2 border-l-2 border-gray-200">
                {children}
            </div>
        </details>
    );
};

export default Accordion;
