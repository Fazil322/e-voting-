import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';

const ResultsViewer: React.FC = () => {
    const { elections, candidates, votes } = useAppContext();
    const [selectedElectionId, setSelectedElectionId] = useState<string>(elections.find(e => e.isActive)?.id || elections[0]?.id || '');

    const resultsData = useMemo(() => {
        if (!selectedElectionId) return { results: [], totalVotes: 0 };

        const electionVotes = votes.filter(v => v.electionId === selectedElectionId);
        const electionCandidates = candidates.filter(c => c.electionId === selectedElectionId);

        const voteCounts = electionCandidates.map(candidate => {
            const count = electionVotes.filter(vote => vote.candidateId === candidate.id).length;
            return {
                ...candidate,
                voteCount: count,
            };
        });

        const totalVotes = electionVotes.length;
        
        const resultsWithPercentage = voteCounts.map(res => ({
            ...res,
            percentage: totalVotes > 0 ? (res.voteCount / totalVotes) * 100 : 0,
        })).sort((a, b) => b.voteCount - a.voteCount);


        return { results: resultsWithPercentage, totalVotes };
    }, [selectedElectionId, votes, candidates]);

    const winner = useMemo(() => {
        if (resultsData.results.length > 0 && resultsData.results[0].voteCount > 0) {
            const topScore = resultsData.results[0].voteCount;
            const winners = resultsData.results.filter(r => r.voteCount === topScore);
            return winners;
        }
        return [];
    }, [resultsData]);

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Hasil Voting</h2>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
                </div>
            </div>
            
            <div className="mb-6">
                <label htmlFor="election-select-results" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pilih Pemilihan:</label>
                <select id="election-select-results" value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                     <option value="">-- Pilih Pemilihan --</option>
                    {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
            </div>

            {selectedElectionId ? (
                <div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold">Total Suara Masuk: {resultsData.totalVotes}</h3>
                        {winner.length > 0 && <p className="text-md">
                            Pemenang Sementara: <span className="font-bold">{winner.map(w => w.name).join(', ')}</span> dengan {winner[0].voteCount} suara.
                            {winner.length > 1 && <span className="text-sm text-yellow-600 dark:text-yellow-400 ml-2">(Hasil Seri)</span>}
                        </p>}
                    </div>
                    
                    <div className="space-y-4">
                        {resultsData.results.map((result, index) => (
                            <div key={result.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-gray-700 dark:text-white">{index + 1}. {result.name}</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-white">{result.voteCount} Suara ({result.percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-600">
                                    <div 
                                        className={`h-4 rounded-full transition-all duration-500 ease-out ${winner.some(w => w.id === result.id) ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${result.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : <p>Pilih salah satu pemilihan untuk melihat hasilnya.</p>}
        </div>
    );
};

export default ResultsViewer;
