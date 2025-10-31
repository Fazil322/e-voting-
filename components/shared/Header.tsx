import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { LogoutIcon } from '../icons/LogoutIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { SunIcon } from '../icons/SunIcon';
import { LogoIcon } from '../icons/LogoIcon';

const Header: React.FC = () => {
    const { 
        isAdminAuthenticated, 
        isVoterAuthenticated,
        currentVoterCode,
        logoutAdmin, 
        logoutVoter,
        theme,
        toggleTheme
    } = useAppContext();

    const getRightSideContent = () => {
        if (isAdminAuthenticated) {
            return (
                <button onClick={logoutAdmin} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                    <LogoutIcon className="w-5 h-5" />
                    Logout Admin
                </button>
            );
        }
        if (isVoterAuthenticated) {
            return (
                 <div className="flex items-center gap-4">
                    <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">Kode: <span className="font-bold">{currentVoterCode}</span></span>
                    <button onClick={logoutVoter} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                        <LogoutIcon className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            );
        }
        return null; // No button for the main landing page
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 transition-colors duration-300">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <LogoIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div className="hidden sm:block text-xl font-bold text-gray-800 dark:text-white">
                        E-Voting OSIS
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                    </button>
                    {getRightSideContent()}
                </div>
            </div>
        </header>
    );
};

export default Header;
