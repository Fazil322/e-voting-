import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

const ThankYouPage: React.FC = () => {
    const { elections, candidates, votes, logoutVoter } = useAppContext();
    
    const activeElection = useMemo(() => elections.find(e => e.isActive), [elections]);

    const resultsData = useMemo(() => {
        if (!activeElection) return { results: [], totalVotes: 0, winner: [] };

        const electionVotes = votes.filter(v => v.electionId === activeElection.id);
        const electionCandidates = candidates.filter(c => c.electionId === activeElection.id);

        const voteCounts = electionCandidates.map(candidate => {
            const count = electionVotes.filter(vote => vote.candidateId === candidate.id).length;
            return { ...candidate, voteCount: count };
        });

        const totalVotes = electionVotes.length;
        
        const resultsWithPercentage = voteCounts.map(res => ({
            ...res,
            percentage: totalVotes > 0 ? (res.voteCount / totalVotes) * 100 : 0,
        })).sort((a, b) => b.voteCount - a.voteCount);
        
        let winner = [];
        if (resultsWithPercentage.length > 0 && resultsWithPercentage[0].voteCount > 0) {
            const topScore = resultsWithPercentage[0].voteCount;
            winner = resultsWithPercentage.filter(r => r.voteCount === topScore);
        }

        return { results: resultsWithPercentage, totalVotes, winner };
    }, [activeElection, votes, candidates]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Terima Kasih!</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Suara Anda telah berhasil direkam.</p>
                <p className="mt-1 text-sm text-gray-500">Anda telah berpartisipasi dalam {activeElection?.title}.</p>
                
                <div className="mt-8 text-left">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                           <ChartBarIcon className="w-6 h-6" /> Hasil Sementara
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
                        </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold">Total Suara Masuk: {resultsData.totalVotes}</h3>
                    </div>
                     <div className="space-y-4">
                        {resultsData.results.map((result) => (
                            <div key={result.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-gray-700 dark:text-white flex items-center gap-2">
                                        {result.name}
                                        {resultsData.winner.some(w => w.id === result.id) && '🏆'}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-white">{result.voteCount} Suara ({result.percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-600">
                                    <div 
                                        className={`${resultsData.winner.some(w => w.id === result.id) ? 'bg-green-500' : 'bg-blue-500'} h-4 rounded-full transition-all duration-500 ease-out`}
                                        style={{ width: `${result.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-10">
                    <button onClick={logoutVoter} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all">
                        Kembali ke Halaman Utama
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;
