import React, { useState } from 'react';
import Dashboard from '../admin/Dashboard';
import CandidateManager from '../admin/CandidateManager';
import CodeGenerator from '../admin/CodeGenerator';
import ResultsViewer from '../admin/ResultsViewer';
import { UsersIcon } from '../icons/UsersIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { CodeBracketIcon } from '../icons/CodeBracketIcon';
import { KeyIcon } from '../icons/KeyIcon';

type AdminTab = 'dashboard' | 'candidates' | 'codes' | 'results';

const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs: { id: AdminTab; name: string; icon: React.ElementType }[] = [
    { id: 'dashboard', name: 'Dashboard & Pemilihan', icon: UsersIcon },
    { id: 'candidates', name: 'Manajemen Kandidat', icon: KeyIcon },
    { id: 'codes', name: 'Generator Kode', icon: CodeBracketIcon },
    { id: 'results', name: 'Hasil Voting', icon: ChartBarIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'candidates':
        return <CandidateManager />;
      case 'codes':
        return <CodeGenerator />;
      case 'results':
        return <ResultsViewer />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin Control Panel</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64">
          <nav className="flex flex-col space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanelPage;
