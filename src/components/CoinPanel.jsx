import React from 'react';

const CoinPanel = ({ coins }) => {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-sm min-h-[140px] transition-colors duration-300">
            <div className="text-6xl font-black text-brand-600 dark:text-brand-400 mb-1 tracking-tighter">
                {coins}
            </div>
            <h2 className="text-slate-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Coins</h2>
        </div>
    );
};

export default CoinPanel;
