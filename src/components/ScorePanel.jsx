import React from 'react';
import CountUp from 'react-countup';

const ScorePanel = ({ score }) => {
  // score starts at -100 and goes to 0 (win)
  // pointsToGo: how far from winning (100 at start, 0 when won)
  const pointsToGo = Math.max(0, -score);
  const progress = Math.min(100, ((100 - pointsToGo) / 100) * 100); // 0% to 100%
  const isWon = score >= 0;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30 flex flex-col items-center justify-center shadow-sm min-h-[140px] transition-colors duration-300">

      {/* Main number: show points remaining, not negative score */}
      <div className={`text-6xl font-black mb-1 tracking-tighter ${isWon ? 'text-green-500' : 'text-yellow-400'}`}>
        {isWon ? '🎉' : (
          <CountUp
            end={pointsToGo}
            duration={1.5}
            preserveValue={true}
          />
        )}
      </div>

      <h2 className="text-slate-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
        {isWon ? 'You reached 100!' : 'Points to 100'}
      </h2>

      {/* Progress bar */}
      {!isWon && (
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ScorePanel;
