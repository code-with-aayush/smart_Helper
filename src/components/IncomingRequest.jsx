import { useState, useEffect } from 'react';

export default function IncomingRequest({ booking, onAccept, onReject }) {
    const [timeLeft, setTimeLeft] = useState(10);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 50);

        // Countdown timer
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onReject(booking.id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [booking.id]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className={`glass-card w-full max-w-md p-6 transform transition-all duration-500
          ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
            >
                {/* Countdown bar */}
                <div className="w-full h-1.5 bg-surface-lighter rounded-full overflow-hidden mb-6">
                    <div className="countdown-bar h-full rounded-full" key={booking.id}></div>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-warning
                        flex items-center justify-center text-2xl shadow-lg shadow-accent/20">
                        🔔
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text">Incoming Request</h3>
                        <p className="text-sm text-text-muted">Respond within {timeLeft}s</p>
                    </div>
                </div>

                {/* Booking Details */}
                <div className="bg-surface rounded-xl p-4 mb-5 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-text-muted">Service</span>
                        <span className="text-sm font-semibold text-text">{booking.serviceType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-text-muted">Customer</span>
                        <span className="text-sm font-semibold text-text">{booking.userName || 'User'}</span>
                    </div>
                    {booking.helperDistance && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">Distance</span>
                            <span className="text-sm font-semibold text-secondary-light">
                                {booking.helperDistance.toFixed(1)} km away
                            </span>
                        </div>
                    )}
                </div>

                {/* Timer circle */}
                <div className="flex justify-center mb-5">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
            ${timeLeft <= 3 ? 'bg-danger/20 text-danger animate-pulse' : 'bg-primary/20 text-primary-light'}`}>
                        {timeLeft}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => onReject(booking.id)}
                        className="flex-1 px-4 py-3 rounded-xl bg-surface-lighter text-text-muted font-semibold
                     hover:bg-danger/20 hover:text-danger transition-all duration-300"
                    >
                        ✕ Reject
                    </button>
                    <button
                        onClick={() => onAccept(booking.id)}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-success to-success-light
                     text-white font-semibold shadow-lg shadow-success/30
                     hover:shadow-success/50 hover:scale-[1.02] transition-all duration-300"
                    >
                        ✓ Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
