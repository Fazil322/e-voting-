import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { ChartBarIcon } from '../icons/ChartBarIcon';

const PublicResults: React.FC = () => {
    const { elections, candidates, votes } = useAppContext();

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

    if (!activeElection) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Belum Ada Pemilihan Aktif</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Hasil voting akan ditampilkan di sini saat pemilihan dimulai.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-12 max-w-4xl">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ChartBarIcon className="w-8 h-8"/>
                        Hasil Voting Sementara
                    </h2>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg mb-6 text-center">
                    <h3 className="text-lg font-semibold">Total Suara Masuk: <span className="text-blue-600 dark:text-blue-400">{resultsData.totalVotes}</span></h3>
                    {resultsData.winner.length > 0 && <p className="text-md mt-1">
                        Pemenang Sementara: <span className="font-bold text-green-600 dark:text-green-400">{resultsData.winner.map(w => w.name).join(', ')}</span>
                        {resultsData.winner.length > 1 && <span className="text-sm text-yellow-600 dark:text-yellow-400 ml-2">(Hasil Seri)</span>}
                    </p>}
                </div>

                <div className="space-y-5">
                    {resultsData.results.map((result) => (
                        <div key={result.id}>
                            <div className="flex justify-between mb-1 items-center">
                                <div className="flex items-center gap-3">
                                    <img src={result.photoUrl} alt={result.name} className="w-10 h-10 rounded-full object-cover"/>
                                    <span className="text-base font-medium text-gray-700 dark:text-white">{result.name}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-white">{result.voteCount} Suara ({result.percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-600 mt-1">
                                <div 
                                    className={`h-4 rounded-full transition-all duration-500 ease-out ${resultsData.winner.some(w => w.id === result.id) ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${result.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                 {resultsData.totalVotes === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-6">Belum ada suara yang masuk untuk pemilihan ini.</p>
                )}
            </div>
        </div>
    );
};

export default PublicResults;
