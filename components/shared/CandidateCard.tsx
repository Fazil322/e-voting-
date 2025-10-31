
import React from 'react';
import { Candidate } from '../../types';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isSelected, onSelect }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-4 ring-blue-500 transform scale-105' : 'hover:shadow-xl hover:-translate-y-1'
      }`}
      onClick={onSelect}
    >
      <img className="w-full h-64 object-cover" src={candidate.photoUrl} alt={candidate.name} />
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{candidate.name}</h3>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Visi:</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{candidate.vision}</p>
        </div>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Misi:</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{candidate.mission}</p>
        </div>
      </div>
       <div className={`py-3 text-center font-bold text-white transition-colors duration-300 ${isSelected ? 'bg-blue-600' : 'bg-gray-500'}`}>
            {isSelected ? 'Terpilih' : 'Pilih Saya'}
        </div>
    </div>
  );
};

export default CandidateCard;
