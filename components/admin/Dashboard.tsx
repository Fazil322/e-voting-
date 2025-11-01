import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import ElectionManager from './ElectionManager';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-700/50 p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { elections, candidates, votes, codeStats } = useAppContext();
    const activeElection = elections.find(e => e.isActive);

    const stats = [
        { title: 'Total Pemilihan', value: elections.length, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg> },
        { title: 'Total Kandidat', value: candidates.length, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { title: 'Total Suara Masuk', value: votes.length, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { title: 'Total Kode Dibuat', value: codeStats.total, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
    ];
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-300">Pemilihan aktif saat ini: <span className="font-semibold text-blue-600 dark:text-blue-400">{activeElection ? activeElection.title : 'Tidak Ada'}</span></p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
                </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700"/>
            
            <ElectionManager />
        </div>
    );
};

export default Dashboard;
