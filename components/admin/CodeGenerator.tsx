import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TrashIcon } from '../icons/TrashIcon';
import { DocumentDuplicateIcon } from '../icons/DocumentDuplicateIcon';
import Modal from '../shared/Modal';

const CodeGenerator: React.FC = () => {
    const { voterCodes, usedVoterCodes, showToast, generateAndSaveCodes, clearAllCodes } = useAppContext();
    const [numToGenerate, setNumToGenerate] = useState<number>(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const filteredCodes = useMemo(() => {
        return voterCodes.filter(code => code.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [voterCodes, searchTerm]);

    const generateCodes = async () => {
        const codesToGenerate = Math.max(0, numToGenerate);
        if (codesToGenerate === 0) return;
        setIsGenerating(true);
        try {
            await generateAndSaveCodes(codesToGenerate);
            showToast(`${codesToGenerate} kode baru berhasil dibuat.`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Gagal membuat kode baru.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const confirmClearCodes = async () => {
        setIsClearing(true);
        try {
            await clearAllCodes();
            showToast('Semua kode pemilih telah dihapus.', 'info');
        } catch (error) {
            console.error(error);
            showToast('Gagal menghapus kode.', 'error');
        } finally {
            setIsClearing(false);
            setShowClearConfirm(false);
        }
    };
    
    const copyToClipboard = () => {
        if (voterCodes.length > 0) {
            navigator.clipboard.writeText(voterCodes.join('\n'));
            showToast('Semua kode berhasil disalin ke clipboard!', 'success');
        } else {
            showToast('Tidak ada kode untuk disalin.', 'error');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Generator Kode Voting</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                    type="number"
                    value={numToGenerate}
                    onChange={e => setNumToGenerate(parseInt(e.target.value, 10) || 0)}
                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 flex-grow"
                    min="1"
                    max="1000"
                    disabled={isGenerating}
                />
                <button onClick={generateCodes} disabled={isGenerating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-wait">
                    {isGenerating ? 'Membuat...' : `Generate ${numToGenerate} Kode`}
                </button>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
                <button onClick={copyToClipboard} disabled={voterCodes.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                    <DocumentDuplicateIcon className="w-5 h-5"/> Salin Semua
                </button>
                <button onClick={() => setShowClearConfirm(true)} disabled={voterCodes.length === 0} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                    <TrashIcon className="w-5 h-5"/> Hapus Semua
                </button>
            </div>
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cari kode..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
            </div>

            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg h-96 overflow-y-auto">
                <h3 className="font-semibold mb-2">Total Kode: {voterCodes.length} | Terpakai: {usedVoterCodes.length} | Tersedia: {voterCodes.length - usedVoterCodes.length}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {filteredCodes.map(code => (
                        <div key={code} className={`p-2 rounded text-center font-mono text-sm ${usedVoterCodes.includes(code) ? 'bg-red-200 dark:bg-red-800/50 text-gray-500 dark:text-gray-400 line-through' : 'bg-green-200 dark:bg-green-800/50'}`}>
                            {code}
                        </div>
                    ))}
                </div>
            </div>

            {showClearConfirm && (
                <Modal title="Konfirmasi Hapus" onClose={() => setShowClearConfirm(false)}>
                    <p>Apakah Anda benar-benar yakin ingin menghapus SEMUA kode pemilih? Aksi ini dapat mengganggu pemilihan yang sedang berlangsung dan tidak dapat dibatalkan.</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={() => setShowClearConfirm(false)} disabled={isClearing} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 disabled:opacity-50">Batal</button>
                        <button onClick={confirmClearCodes} disabled={isClearing} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-wait">
                            {isClearing ? 'Menghapus...' : 'Ya, Hapus Semua'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CodeGenerator;