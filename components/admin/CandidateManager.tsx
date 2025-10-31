import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Candidate } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { EditIcon } from '../icons/EditIcon';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import { KeyIcon } from '../icons/KeyIcon';
import { RefreshIcon } from '../icons/RefreshIcon';

const CandidateManager: React.FC = () => {
    const { elections, candidates, addCandidate, updateCandidate, deleteCandidate, showToast } = useAppContext();
    const [selectedElectionId, setSelectedElectionId] = useState<string>(elections.find(e => e.isActive)?.id || elections[0]?.id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState<Partial<Candidate> | null>(null);

    const filteredCandidates = useMemo(() => {
        if (!selectedElectionId) return [];
        return candidates.filter(c => c.electionId === selectedElectionId);
    }, [candidates, selectedElectionId]);

    const openModal = (candidate: Partial<Candidate> | null = null) => {
        setCurrentCandidate(candidate || { name: '', vision: '', mission: '', photoUrl: `https://picsum.photos/400/400?random=${Date.now()}` });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (isSaving) return;
        setIsModalOpen(false);
        setCurrentCandidate(null);
    };

    const handleSave = async () => {
        if (!currentCandidate || !currentCandidate.name || !selectedElectionId) {
            showToast('Nama kandidat tidak boleh kosong.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            if (currentCandidate.id) {
                await updateCandidate(currentCandidate as Candidate);
                showToast('Kandidat berhasil diperbarui.', 'success');
            } else {
                const newCandidate = {
                    ...currentCandidate,
                    id: `candidate-${Date.now()}`,
                    electionId: selectedElectionId,
                } as Candidate;
                await addCandidate(newCandidate);
                showToast('Kandidat berhasil ditambahkan.', 'success');
            }
            closeModal();
        } catch (error) {
            console.error(error);
            showToast('Gagal menyimpan kandidat.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kandidat ini?')) {
            try {
                await deleteCandidate(id);
                showToast('Kandidat telah dihapus.', 'info');
            } catch (error) {
                console.error(error);
                showToast('Gagal menghapus kandidat.', 'error');
            }
        }
    };

    const generateRandomPhoto = () => {
        if (currentCandidate) {
            setCurrentCandidate({
                ...currentCandidate,
                photoUrl: `https://picsum.photos/400/400?random=${Date.now()}`
            });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manajemen Kandidat</h2>
                <button onClick={() => openModal()} disabled={!selectedElectionId} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    Tambah Kandidat
                </button>
            </div>

            <div className="mb-4">
                <label htmlFor="election-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pilih Pemilihan:</label>
                <select id="election-select" value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    {elections.length === 0 ? <option>Tidak ada pemilihan</option> : elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
            </div>
            
            {!selectedElectionId || filteredCandidates.length === 0 ? (
                <EmptyState
                    icon={<KeyIcon className="w-16 h-16 text-gray-400" />}
                    title="Belum Ada Kandidat"
                    message={!selectedElectionId ? "Pilih salah satu pemilihan untuk melihat kandidat." : "Tambahkan kandidat pertama untuk pemilihan ini."}
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Foto</th>
                                <th scope="col" className="px-6 py-3">Nama</th>
                                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates.map(candidate => (
                                <tr key={candidate.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                    <td className="px-6 py-4"><img src={candidate.photoUrl} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" /></td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{candidate.name}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => openModal(candidate)} className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(candidate.id)} className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && currentCandidate && (
                <Modal title={currentCandidate.id ? 'Edit Kandidat' : 'Tambah Kandidat'} onClose={closeModal}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Nama Kandidat" value={currentCandidate.name || ''} onChange={e => setCurrentCandidate({ ...currentCandidate, name: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <div className="flex items-center gap-2">
                           <input type="text" placeholder="URL Foto" value={currentCandidate.photoUrl || ''} onChange={e => setCurrentCandidate({ ...currentCandidate, photoUrl: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                           <button onClick={generateRandomPhoto} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500" title="Generate foto acak">
                                <RefreshIcon className="w-5 h-5" />
                           </button>
                        </div>
                        <textarea placeholder="Visi" value={currentCandidate.vision || ''} onChange={e => setCurrentCandidate({ ...currentCandidate, vision: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <textarea placeholder="Misi (Gunakan baris baru untuk setiap poin)" value={currentCandidate.mission || ''} onChange={e => setCurrentCandidate({ ...currentCandidate, mission: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 h-24" />

                        <div className="flex justify-end gap-2 pt-4">
                            <button onClick={closeModal} disabled={isSaving} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50">Batal</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-wait">
                                {isSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CandidateManager;