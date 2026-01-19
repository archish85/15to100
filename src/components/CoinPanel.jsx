import React from 'react';

const CoinPanel = ({ coins }) => {
    return (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center shadow-lg min-h-[140px]">
            <div className="text-6xl font-bold text-brand-300 mb-1">
                {coins}
            </div>
            <h2 className="text-gray-400 text-sm font-medium">Coins</h2>
        </div>
    );
};

export default CoinPanel;
