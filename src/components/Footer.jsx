import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} 15 to 100. All rights reserved.</p>
                <p className="mt-2">Daily Trivia Challenge</p>
            </div>
        </footer>
    );
};

export default Footer;
