import React from 'react';
import CountUp from 'react-countup';

const ScorePanel = ({ score }) => {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30 flex flex-col items-center justify-center shadow-sm min-h-[140px] transition-colors duration-300">
            <div className={`text-6xl font-black mb-1 tracking-tighter ${score === 0 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                <CountUp end={score} duration={1.5} preserveValue={true} />
            </div>
            <h2 className="text-slate-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">To 100</h2>
        </div>
    );
};

export default ScorePanel;
