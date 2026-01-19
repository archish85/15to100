import React from 'react';
import { HelpCircle } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-gray-800 border-b border-gray-700 py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-xl">
                        15
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">to 100</h1>
                </div>
                <button className="p-2 hover:bg-gray-700 rounded-full transition-colors" aria-label="How to play">
                    <HelpCircle className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
            </div>
        </header>
    );
};

export default Header;
