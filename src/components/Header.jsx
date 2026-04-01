import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import HowToPlayModal from './HowToPlayModal';

const Header = () => {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-700 py-4 sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 flex justify-between items-center max-w-6xl">
                <div className="flex flex-row items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center font-bold text-xl text-white">
                        15
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">to 100</h1>
                </div>
                <div className="flex flex-row items-center space-x-2">
                    <ThemeToggle />
                    <button onClick={() => setShowHelp(true)} className="p-2 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm" aria-label="How to play">
                        <HelpCircle className="w-5 h-5 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors" />
                    </button>
                    {showHelp && <HowToPlayModal onClose={() => setShowHelp(false)} />}
                </div>
            </div>
        </header>
    );
};

export default Header;
