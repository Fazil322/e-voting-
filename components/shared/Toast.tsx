import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-white" />,
  error: <XCircleIcon className="w-6 h-6 text-white" />,
  info: <InformationCircleIcon className="w-6 h-6 text-white" />,
};

const bgColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(false);
  const { toast } = useAppContext();

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2700); // Start fade out before it's removed
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-4 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ${bgColors[type]} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
    >
      {icons[type]}
      <p className="font-medium">{message}</p>
    </div>
  );
};

export default Toast;
