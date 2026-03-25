import React, { useState, useEffect } from 'react';

import { useGameStore } from '../store/gameStore';

const GameEndScreen = ({ status }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const history = useGameStore(state => state.history);
    const dateStr = new Date().toISOString().split('T')[0];
    const bestCat = history?.[dateStr]?.bestCategory;

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
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center text-center shadow-2xl animate-in fade-in zoom-in duration-300 z-50 transition-colors">
            <h2 className={`text-4xl font-black mb-4 tracking-tight ${isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isWin ? 'Daily Challenge Complete!' : 'Out of Moves!'}
            </h2>
            <p className="text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-md">
                {isWin ? 'Congratulations! You reached your goal.' : 'You ran out of coins and moves. Try again tomorrow!'}
            </p>

            {bestCat && (
                <div className="mb-8 p-4 bg-brand-50 dark:bg-brand-900/30 rounded-xl border border-brand-200 dark:border-brand-800/50 w-full max-w-sm">
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider mb-1">Your Best Category</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{bestCat}</p>
                </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-bold">Next Challenge In</p>
                <div className="text-4xl font-mono text-brand-300 font-bold tracking-tight">
                    {timeLeft}
                </div>
            </div>
        </div>
    );
};

export default GameEndScreen;
