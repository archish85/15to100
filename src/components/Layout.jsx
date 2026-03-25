import React from 'react';
import Footer from './Footer';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white font-sans selection:bg-brand-500 selection:text-white transition-colors duration-300">
            <Header />
            <main className="flex-grow px-4 md:px-6 py-8 flex flex-col max-w-6xl mx-auto w-full">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
