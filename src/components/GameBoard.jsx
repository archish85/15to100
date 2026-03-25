import React from 'react';
import CoinPanel from './CoinPanel';
import CategoryPanel from './CategoryPanel';
import QuestionArea from './QuestionArea';
import ScorePanel from './ScorePanel';
import DailyStreak from './DailyStreak';
import { useGameStore } from '../store/gameStore';

const GameBoard = () => {
    const { coins, score, currentCategory, history } = useGameStore();
    const dateStr = new Date().toISOString().split('T')[0];
    const bestCat = history?.[dateStr]?.bestCategory || "No data yet";

    return (
        <div className="grid grid-cols-12 gap-4 h-full flex-grow max-w-[1600px] mx-auto w-full p-4 lg:p-0">

            {/* 1. Coin Panel */}
            {/* Mobile: Top Left (half). Desktop: Top Left (in column) */}
            <div className="col-span-6 lg:col-span-3 lg:row-start-1 lg:col-start-1">
                <CoinPanel coins={coins} />
            </div>

            {/* 2. Score Panel */}
            {/* Mobile: Top Right (half). Desktop: Top Right (in column) */}
            <div className="col-span-6 lg:col-span-3 lg:row-start-1 lg:col-start-10">
                <ScorePanel score={score} />
            </div>

            {/* 3. Category Panel */}
            {/* Mobile: Left Strip (25% - 3 cols). Desktop: Middle Left (Rest of Col 1) */}
            {/* Note for Mobile: Height needs to match Question Area or be scrollable */}
            <div className="col-span-3 lg:col-span-3 lg:row-start-2 lg:col-start-1 lg:row-span-2">
                <CategoryPanel />
            </div>

            {/* 4. Question Area */}
            {/* Mobile: Right Major Area (75% - 9 cols). Desktop: Center (6 cols) */}
            <div className="col-span-9 lg:col-span-6 lg:row-start-1 lg:row-span-3 lg:col-start-4">
                <QuestionArea />
            </div>

            {/* 5. Stats (Daily Streak & Best Category) */}
            {/* Mobile: Bottom Full Width. Desktop: Right Column (Below Score) */}
            <div className="col-span-12 lg:col-span-3 lg:row-start-2 lg:col-start-10 flex flex-row lg:flex-col gap-4 lg:gap-6">
                {/* Daily Streak */}
                {/* Daily Streak */}
                <DailyStreak />

                {/* Best Category */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center flex-1 lg:flex-grow shadow-sm">
                    <h3 className="text-slate-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Best Category</h3>
                    <div className="text-center text-brand-600 dark:text-brand-400 font-bold text-xl mt-4">
                        {bestCat}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default GameBoard;
