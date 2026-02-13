import { useState, useEffect } from 'react';

export default function StatusBadge({ status }) {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const statusConfig = {
            searching: {
                label: 'Searching',
                color: 'bg-warning/10 text-warning border-warning/20',
                dot: 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]',
                animate: true
            },
            pending_acceptance: {
                label: 'Awaiting Helper',
                color: 'bg-secondary/10 text-secondary-light border-secondary/20',
                dot: 'bg-secondary shadow-[0_0_8px_rgba(14,165,233,0.5)]',
                animate: true
            },
            assigned: {
                label: 'Assigned',
                color: 'bg-primary/10 text-primary-light border-primary/20',
                dot: 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]',
                animate: false
            },
            completed: {
                label: 'Completed',
                color: 'bg-success/10 text-success-light border-success/20',
                dot: 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]',
                animate: false
            },
            no_helpers: {
                label: 'No Helpers',
                color: 'bg-danger/10 text-danger-light border-danger/20',
                dot: 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]',
                animate: false
            },
            available: {
                label: 'Available',
                color: 'bg-success/10 text-success-light border-success/20',
                dot: 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]',
                animate: true
            },
            busy: {
                label: 'Busy',
                color: 'bg-surface-lighter text-text-muted border-white/5',
                dot: 'bg-text-dim',
                animate: false
            },
            cancelled: {
                label: 'Cancelled',
                color: 'bg-surface-lighter text-text-dim border-white/5',
                dot: 'bg-text-dim',
                animate: false
            }
        };

        setConfig(statusConfig[status] || {
            label: status,
            color: 'bg-surface-lighter text-text-muted border-white/5',
            dot: 'bg-text-dim',
            animate: false
        });
    }, [status]);

    if (!config) return null;

    return (
        <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${config.color} transition-all duration-300 shadow-sm`}
        >
            <span className={`relative flex h-2 w-2`}>
                {config.animate && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot.split(' ')[0]}`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
            </span>
            {config.label}
        </span>
    );
}
