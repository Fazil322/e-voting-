
import React from 'react';
import { Candidate } from '../../types';
import { CheckIcon } from '../icons/CheckIcon';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isSelected, onSelect }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 flex flex-col ${
        isSelected ? 'ring-4 ring-blue-500 transform scale-105' : 'hover:shadow-xl hover:-translate-y-1'
      }`}
      onClick={onSelect}
    >
      <img className="w-full h-64 object-cover" src={candidate.photoUrl} alt={candidate.name} />
      <div className="p-6 flex-grow">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{candidate.name}</h3>
        <div className="mt-4 space-y-4 max-h-48 overflow-y-auto pr-2">
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Visi:</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{candidate.vision}</p>
            </div>
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Misi:</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1">
                    {candidate.mission.split('\n').map((item, index) => item.trim() && <li key={index}>{item.trim()}</li>)}
                </ul>
            </div>
        </div>
      </div>
       <div className={`py-3 text-center font-bold text-white transition-colors duration-300 flex items-center justify-center gap-2 mt-auto ${isSelected ? 'bg-blue-600' : 'bg-gray-500'}`}>
            {isSelected ? (
                <>
                    <CheckIcon className="w-5 h-5"/>
                    <span>Terpilih</span>
                </>
            ) : 'Pilih Saya'}
        </div>
    </div>
  );
};

export default CandidateCard;
