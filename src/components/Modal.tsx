import React from 'react';
import Card from './Card';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        ✕
                    </button>
                </div>
                <div className="flex-1 mb-4">
                    {children}
                </div>
                {footer && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        {footer}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Modal;
