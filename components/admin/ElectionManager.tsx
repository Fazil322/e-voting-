import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Election } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { EditIcon } from '../icons/EditIcon';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import { UsersIcon } from '../icons/UsersIcon';

const ElectionManager: React.FC = () => {
    const { elections, addElection, updateElection, deleteElection, setActiveElection, showToast } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentElection, setCurrentElection] = useState<Partial<Election> | null>(null);
    const [electionToDelete, setElectionToDelete] = useState<Election | null>(null);

    const openModal = (election: Partial<Election> | null = null) => {
        setCurrentElection(election || { title: '', description: '', startDate: '', endDate: '', isActive: false });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (isSaving) return;
        setIsModalOpen(false);
        setCurrentElection(null);
    };

    const handleSave = async () => {
        if (!currentElection || !currentElection.title) {
            showToast('Judul pemilihan tidak boleh kosong.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            if (currentElection.id) {
                await updateElection(currentElection as Election);
                if (currentElection.isActive) {
                    await setActiveElection(currentElection as Election);
                }
                showToast('Pemilihan berhasil diperbarui.', 'success');
            } else {
                const newElection = await addElection(currentElection);
                 if (newElection && newElection.isActive) {
                    await setActiveElection(newElection);
                }
                showToast('Pemilihan berhasil ditambahkan.', 'success');
            }
            closeModal();
        } catch (error) {
            console.error(error);
            showToast('Gagal menyimpan pemilihan.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const confirmDelete = async () => {
        if (electionToDelete) {
            try {
                await deleteElection(electionToDelete.id);
                showToast('Pemilihan telah dihapus.', 'info');
            } catch (error) {
                console.error(error);
                showToast('Gagal menghapus pemilihan.', 'error');
            } finally {
                setElectionToDelete(null);
            }
        }
    };
    
    const handleActiveToggle = async (electionToToggle: Election) => {
        try {
            await setActiveElection(electionToToggle);
            showToast(`"${electionToToggle.title}" sekarang aktif.`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Gagal mengubah status aktif.', 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manajemen Pemilihan</h2>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    Tambah Pemilihan
                </button>
            </div>
            
            {elections.length === 0 ? (
                <EmptyState
                    icon={<UsersIcon className="w-16 h-16 text-gray-400" />}
                    title="Belum Ada Pemilihan"
                    message="Buat pemilihan pertama Anda untuk memulai."
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Judul</th>
                                <th scope="col" className="px-6 py-3">Status Aktif</th>
                                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {elections.map(election => (
                                <tr key={election.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{election.title}</td>
                                    <td className="px-6 py-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={election.isActive} onChange={() => handleActiveToggle(election)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => openModal(election)} className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setElectionToDelete(election)} className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && currentElection && (
                <Modal title={currentElection.id ? 'Edit Pemilihan' : 'Tambah Pemilihan'} onClose={closeModal}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Judul Pemilihan" value={currentElection.title || ''} onChange={e => setCurrentElection({ ...currentElection, title: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <textarea placeholder="Deskripsi" value={currentElection.description || ''} onChange={e => setCurrentElection({ ...currentElection, description: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <div className="flex gap-4">
                            <input type="date" placeholder="Tanggal Mulai" value={currentElection.startDate || ''} onChange={e => setCurrentElection({ ...currentElection, startDate: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            <input type="date" placeholder="Tanggal Selesai" value={currentElection.endDate || ''} onChange={e => setCurrentElection({ ...currentElection, endDate: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="flex items-center gap-2">
                             <input id="isActiveCheckbox" type="checkbox" checked={currentElection.isActive || false} onChange={e => setCurrentElection({ ...currentElection, isActive: e.target.checked })} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                            <label htmlFor="isActiveCheckbox" className="text-sm font-medium text-gray-900 dark:text-gray-300">Jadikan pemilihan ini aktif? (Akan menonaktifkan yang lain)</label>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button onClick={closeModal} disabled={isSaving} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50">Batal</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-wait">
                                {isSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {electionToDelete && (
                <Modal title="Konfirmasi Hapus" onClose={() => setElectionToDelete(null)}>
                    <div>
                        <p>Apakah Anda yakin ingin menghapus pemilihan
                            <span className="font-bold"> "{electionToDelete.title}"</span>? 
                            Semua kandidat dan suara yang terkait juga akan dihapus. Aksi ini tidak dapat dibatalkan.
                        </p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setElectionToDelete(null)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Batal</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Ya, Hapus</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ElectionManager;
