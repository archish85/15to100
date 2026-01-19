import React from 'react';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans selection:bg-brand-500 selection:text-white">
            <main className="flex-grow px-4 md:px-6 py-8 flex flex-col max-w-6xl mx-auto w-full">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
