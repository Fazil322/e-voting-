import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { KeyIcon } from '../icons/KeyIcon';

const VoterLoginPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginVoter, setCurrentView } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await loginVoter(code.toUpperCase());
    if (!success) {
      setError('Kode voting tidak valid atau sudah digunakan.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
            <KeyIcon className="mx-auto h-12 w-12 text-blue-500"/>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Masuk untuk Memilih
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gunakan kode voting unik Anda.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="voter-code" className="sr-only">Kode Voting</label>
              <input
                id="voter-code"
                name="code"
                type="text"
                autoCapitalize="characters"
                required
                disabled={isLoading}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50"
                placeholder="Masukkan Kode Voting Anda"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </div>
        </form>
         <div className="text-center">
            <button onClick={() => setCurrentView('home')} className="font-medium text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Kembali ke Halaman Utama
            </button>
        </div>
      </div>
    </div>
  );
};

export default VoterLoginPage;
