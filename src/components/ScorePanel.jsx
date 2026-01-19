import React from 'react';

const ScorePanel = ({ score }) => {
    return (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center shadow-lg min-h-[140px] border-yellow-500/30">
            <div className={`text-6xl font-bold mb-1 ${score === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                {score}
            </div>
            <h2 className="text-gray-400 text-sm font-medium">To 100</h2>
        </div>
    );
};

export default ScorePanel;
