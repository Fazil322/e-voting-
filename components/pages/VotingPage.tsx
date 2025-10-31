import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import CandidateCard from '../shared/CandidateCard';
import Modal from '../shared/Modal';

const VotingPage: React.FC = () => {
  const { elections, candidates, castVote, logoutVoter } = useAppContext();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showThanksModal, setShowThanksModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeElection = useMemo(() => elections.find(e => e.isActive), [elections]);
  const electionCandidates = useMemo(() => {
    if (!activeElection) return [];
    return candidates.filter(c => c.electionId === activeElection.id);
  }, [candidates, activeElection]);

  if (!activeElection) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Tidak ada pemilihan aktif saat ini.</h2>
        <p>Silakan kembali lagi nanti.</p>
        <button onClick={logoutVoter} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Kembali</button>
      </div>
    );
  }

  const handleVote = () => {
    if (selectedCandidateId) {
      setShowConfirmModal(true);
    }
  };

  const confirmVote = async () => {
    if (selectedCandidateId && activeElection) {
      setIsSubmitting(true);
      await castVote(activeElection.id, selectedCandidateId);
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setShowThanksModal(true);
    }
  };

  const closeThanksModalAndLogout = () => {
      setShowThanksModal(false);
      logoutVoter();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">{activeElection.title}</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{activeElection.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {electionCandidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedCandidateId === candidate.id}
            onSelect={() => setSelectedCandidateId(candidate.id)}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={handleVote}
          disabled={!selectedCandidateId}
          className="px-12 py-4 text-xl font-bold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 duration-300 disabled:transform-none"
        >
          Kirim Suara
        </button>
      </div>

      {showConfirmModal && (
        <Modal
          title="Konfirmasi Pilihan"
          onClose={() => setShowConfirmModal(false)}
        >
          <p>Apakah Anda yakin dengan pilihan Anda? Anda tidak dapat mengubahnya setelah konfirmasi.</p>
          <div className="mt-6 flex justify-end gap-4">
            <button onClick={() => setShowConfirmModal(false)} disabled={isSubmitting} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 disabled:opacity-50">Batal</button>
            <button onClick={confirmVote} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait">
                {isSubmitting ? 'Mengirim...' : 'Ya, Saya Yakin'}
            </button>
          </div>
        </Modal>
      )}

      {showThanksModal && (
         <Modal
            title="Terima Kasih!"
            onClose={closeThanksModalAndLogout}
        >
            <p>Terima kasih telah berpartisipasi dalam pemilihan. Suara Anda telah berhasil direkam.</p>
            <div className="mt-6 flex justify-end">
                <button onClick={closeThanksModalAndLogout} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Tutup</button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default VotingPage;