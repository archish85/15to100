import React from 'react';
import { useGameStore } from '../store/gameStore';

const DailyStreak = () => {
    const { streak, history } = useGameStore();

    // Generate last 5 days [Today-4, ... Today]
    const days = [];
    for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    return (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center flex-1 lg:flex-none lg:min-h-[180px]">
            <h3 className="text-brand-300 font-medium mb-4">Daily Streak</h3>
            <div className="text-5xl font-bold text-white mb-6">
                {streak}
                {streak >= 3 && (
                    <div className="text-xs text-yellow-400 font-semibold mt-1 mb-2">
                        🔥 +{Math.min(3, Math.floor(streak / 3))} bonus coin{Math.min(3, Math.floor(streak / 3)) > 1 ? 's' : ''} today
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                {days.map((dateStr) => {
                    const entry = history[dateStr];
                    let bgColor = 'bg-slate-800/80';
                    let content = '';
                    let textColor = 'text-white';

                    if (entry) {
                        if (entry.status === 'win') {
                            bgColor = 'bg-green-500';
                            content = entry.categories;
                            textColor = 'text-black';
                        } else {
                            bgColor = 'bg-red-500';
                            content = 'X';
                            textColor = 'text-white';
                        }
                    }

                    return (
                        <div key={dateStr} className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-xs font-bold ${textColor}`}>
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyStreak;
