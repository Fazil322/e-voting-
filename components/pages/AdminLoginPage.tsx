
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { KeyIcon } from '../icons/KeyIcon';

const AdminLoginPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin, setCurrentView } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginAdmin(code);
    if (!success) {
      setError('Kode admin tidak valid.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
            <KeyIcon className="mx-auto h-12 w-12 text-red-500"/>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Panel Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Akses terbatas hanya untuk administrator.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="admin-code" className="sr-only">Kode Admin</label>
              <input
                id="admin-code"
                name="code"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan Kode Admin"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              Login
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

export default AdminLoginPage;
