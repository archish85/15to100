import React, { useState, useEffect } from 'react';

const GameEndScreen = ({ status }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const isWin = status === 'won';

    return (
        <div className="bg-slate-900/90 rounded-xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center text-center shadow-2xl animate-in fade-in zoom-in duration-300 backdrop-blur-sm z-50">
            <h2 className={`text-4xl font-bold mb-4 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {isWin ? 'Daily Challenge Complete!' : 'Out of Moves!'}
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-md">
                {isWin ? 'Congratulations! You reached your goal.' : 'You ran out of coins and moves. Try again tomorrow!'}
            </p>

            <div className="bg-slate-800/80 rounded-lg p-6 w-full max-w-sm border border-slate-700">
                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Next Challenge In</p>
                <div className="text-4xl font-mono text-brand-300 font-bold tracking-tight">
                    {timeLeft}
                </div>
            </div>
        </div>
    );
};

export default GameEndScreen;
