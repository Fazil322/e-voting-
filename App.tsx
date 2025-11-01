import React, { useEffect } from 'react';
import { useAppContext } from './hooks/useAppContext';
import VoterLoginPage from './components/pages/VoterLoginPage';
import VotingPage from './components/pages/VotingPage';
import AdminLoginPage from './components/pages/AdminLoginPage';
import AdminPanelPage from './components/pages/AdminPanelPage';
import Header from './components/shared/Header';
import Toast from './components/shared/Toast';
import { UsersIcon } from './components/icons/UsersIcon';
import { LogoIcon } from './components/icons/LogoIcon';
import PublicResults from './components/shared/PublicResults';
import ThankYouPage from './components/pages/ThankYouPage';

const App: React.FC = () => {
  const { isAdminAuthenticated, isVoterAuthenticated, currentView, setCurrentView, theme, toast, isLoading } = useAppContext();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleRouting = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('adminLogin');
      }
    };
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    return () => window.removeEventListener('hashchange', handleRouting);
  }, [setCurrentView]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LogoIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-pulse" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Memuat data...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (isAdminAuthenticated) {
      return <AdminPanelPage />;
    }
    if (isVoterAuthenticated) {
      if (currentView === 'votingFinished') {
        return <ThankYouPage />;
      }
      return <VotingPage />;
    }

    switch (currentView) {
      case 'voterLogin':
        return <VoterLoginPage />;
      case 'adminLogin':
        return <AdminLoginPage />;
      default:
        return (
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:from-blue-900 dark:via-gray-900 dark:to-gray-800">
            <div className="flex flex-col items-center justify-center pt-16 pb-12">
              <div className="text-center p-6 md:p-12 rounded-2xl">
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 dark:bg-blue-400/10 rounded-full">
                  <UsersIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                  E-Voting OSIS
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
                  SMK LPPMRI 2 KEDUNGREJA
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setCurrentView('voterLogin')}
                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all transform hover:scale-105 duration-300"
                  >
                    Mulai Voting
                  </button>
                </div>
              </div>
            </div>
            <PublicResults />
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300`}>
      <Header />
      <main>{renderContent()}</main>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default App;
