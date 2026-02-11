import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const bgColor = type === 'success' ? 'bg-neon-green/10 border-neon-green/50 text-neon-green' : 'bg-neon-error/10 border-neon-error/50 text-neon-error';
    const icon = type === 'success' ? '✅' : '⚠️';

    return (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-fade-in-down flex items-center gap-3 ${bgColor}`}>
            <span className="text-xl">{icon}</span>
            <p className="font-medium">{message}</p>
            <button
                onClick={onClose}
                className="ml-4 hover:opacity-70 transition-opacity"
            >
                ✕
            </button>
        </div>
    );
};

export default Toast;
