import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Election, Candidate, Vote, Toast } from '../types';
import { ADMIN_CODE } from '../constants';
import { supabase } from '../utils/supabaseClient';
import { 
    mapElectionFromDb, mapCandidateFromDb, mapVoteFromDb,
    mapElectionToDb, mapCandidateToDb 
} from '../utils/dataMapper';

type Theme = 'light' | 'dark';

interface AppContextType {
  elections: Election[];
  candidates: Candidate[];
  voterCodes: string[];
  usedVoterCodes: string[];
  votes: Vote[];
  isAdminAuthenticated: boolean;
  isVoterAuthenticated: boolean;
  currentVoterCode: string | null;
  currentView: 'home' | 'voterLogin' | 'adminLogin';
  setCurrentView: React.Dispatch<React.SetStateAction<'home' | 'voterLogin' | 'adminLogin'>>;
  loginAdmin: (code: string) => boolean;
  logoutAdmin: () => void;
  loginVoter: (code: string) => Promise<boolean>;
  logoutVoter: () => void;
  castVote: (electionId: string, candidateId: string) => Promise<void>;
  theme: Theme;
  toggleTheme: () => void;
  toast: Toast | null;
  showToast: (message: string, type: Toast['type']) => void;
  isLoading: boolean;
  addElection: (election: Partial<Election>) => Promise<void>;
  updateElection: (election: Election) => Promise<void>;
  deleteElection: (id: string) => Promise<void>;
  setActiveElection: (election: Election) => Promise<void>;
  addCandidate: (candidate: Partial<Candidate>) => Promise<void>;
  updateCandidate: (candidate: Candidate) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  generateAndSaveCodes: (count: number) => Promise<void>;
  clearAllCodes: () => Promise<void>;
  uploadCandidatePhoto: (file: File) => Promise<string>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voterCodes, setVoterCodes] = useState<string[]>([]);
  const [usedVoterCodes, setUsedVoterCodes] = useState<string[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isVoterAuthenticated, setIsVoterAuthenticated] = useState<boolean>(false);
  const [currentVoterCode, setCurrentVoterCode] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'voterLogin' | 'adminLogin'>('home');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  
  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const newToast: Toast = { id: Date.now(), message, type };
    setToast(newToast);
    setTimeout(() => {
      setToast(currentToast => (currentToast?.id === newToast.id ? null : currentToast));
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [electionsRes, candidatesRes, codesRes, votesRes] = await Promise.all([
                supabase.from('elections').select('*'),
                supabase.from('candidates').select('*'),
                supabase.from('voter_codes').select('code, is_used'),
                supabase.from('votes').select('*')
            ]);

            if (electionsRes.error) throw electionsRes.error;
            setElections(electionsRes.data.map(mapElectionFromDb));

            if (candidatesRes.error) throw candidatesRes.error;
            setCandidates(candidatesRes.data.map(mapCandidateFromDb));

            if (codesRes.error) throw codesRes.error;
            setVoterCodes(codesRes.data.map((vc: any) => vc.code));
            setUsedVoterCodes(codesRes.data.filter((vc: any) => vc.is_used).map((vc: any) => vc.code));

            if (votesRes.error) throw votesRes.error;
            setVotes(votesRes.data.map(mapVoteFromDb));
            
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast('Gagal memuat data dari server.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();

    const channel = supabase
      .channel('realtime-votes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, (payload) => {
        const newVote = mapVoteFromDb(payload.new);
        setVotes(prev => prev.some(v => v.id === newVote.id) ? prev : [...prev, newVote]);
        setUsedVoterCodes(prev => prev.includes(newVote.voterCode) ? prev : [...prev, newVote.voterCode]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

  const loginAdmin = (code: string): boolean => {
    if (code === ADMIN_CODE) {
      setIsAdminAuthenticated(true);
      showToast('Login admin berhasil!', 'success');
      return true;
    }
    showToast('Kode admin tidak valid.', 'error');
    return false;
  };
  
  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    window.location.hash = '';
    setCurrentView('home');
    showToast('Anda telah logout dari panel admin.', 'info');
  };

  const loginVoter = async (code: string): Promise<boolean> => {
    const { data, error } = await supabase.from('voter_codes').select('is_used').eq('code', code).single();
    if (error || !data) {
        showToast('Kode voting tidak valid.', 'error');
        return false;
    }
    if (data.is_used) {
        showToast('Kode voting sudah digunakan.', 'error');
        return false;
    }
    setIsVoterAuthenticated(true);
    setCurrentVoterCode(code);
    return true;
  };

  const logoutVoter = () => {
    setIsVoterAuthenticated(false);
    setCurrentVoterCode(null);
    setCurrentView('home');
  };

  const castVote = async (electionId: string, candidateId: string) => {
    if (!currentVoterCode) return;
    
    const { error: updateError } = await supabase.from('voter_codes').update({ is_used: true }).eq('code', currentVoterCode);
    if (updateError) {
        showToast('Gagal memvalidasi suara Anda. Coba lagi.', 'error'); return;
    }

    const { error: insertError } = await supabase.from('votes').insert({ 
      election_id: electionId, candidate_id: candidateId, voter_code: currentVoterCode, timestamp: new Date().toISOString() 
    }).select().single();

    if (insertError) {
        showToast('Gagal menyimpan suara Anda. Hubungi admin.', 'error');
        await supabase.from('voter_codes').update({ is_used: false }).eq('code', currentVoterCode); // Revert
        return;
    }

    // No need for client-side state update here, realtime subscription will handle it.
  };

  const addElection = async (election: Partial<Election>) => {
    const { data, error } = await supabase.from('elections').insert(mapElectionToDb(election)).select().single();
    if (error) throw error;
    setElections(prev => [...prev, mapElectionFromDb(data)]);
  };

  const updateElection = async (election: Election) => {
    const { data, error } = await supabase.from('elections').update(mapElectionToDb(election)).eq('id', election.id).select().single();
    if (error) throw error;
    setElections(prev => prev.map(e => e.id === election.id ? mapElectionFromDb(data) : e));
  };
  
  const deleteElection = async (id: string) => {
    const { error } = await supabase.from('elections').delete().eq('id', id);
    if (error) throw error;
    setElections(prev => prev.filter(e => e.id !== id));
  };

  const setActiveElection = async (electionToToggle: Election) => {
    await supabase.from('elections').update({ is_active: false }).neq('id', electionToToggle.id);
    await supabase.from('elections').update({ is_active: true }).eq('id', electionToToggle.id);
    setElections(prev => prev.map(e => ({...e, isActive: e.id === electionToToggle.id })));
  };

  const addCandidate = async (candidate: Partial<Candidate>) => {
      const { data, error } = await supabase.from('candidates').insert(mapCandidateToDb(candidate)).select().single();
      if (error) throw error;
      setCandidates(prev => [...prev, mapCandidateFromDb(data)]);
  };

  const updateCandidate = async (candidate: Candidate) => {
      const { data, error } = await supabase.from('candidates').update(mapCandidateToDb(candidate)).eq('id', candidate.id).select().single();
      if (error) throw error;
      setCandidates(prev => prev.map(c => c.id === candidate.id ? mapCandidateFromDb(data) : c));
  };

  const deleteCandidate = async (id: string) => {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const generateAndSaveCodes = async (count: number) => {
    const newCodes: { code: string }[] = [];
    const existingCodes = new Set(voterCodes);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while (newCodes.length < count) {
        let code = '';
        for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (!existingCodes.has(code)) {
            newCodes.push({ code });
            existingCodes.add(code);
        }
    }
    const { error } = await supabase.from('voter_codes').insert(newCodes);
    if (error) throw error;
    setVoterCodes(Array.from(existingCodes));
  };

  const clearAllCodes = async () => {
    const { error } = await supabase.from('voter_codes').delete().neq('code', 'IMPOSSIBLE_CODE_TO_MATCH');
    if (error) throw error;
    setVoterCodes([]);
    setUsedVoterCodes([]);
  };
  
  const uploadCandidatePhoto = async (file: File): Promise<string> => {
    const fileName = `photo_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const bucket = 'evoting_assets';
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    
    if (!data.publicUrl) {
        throw new Error("Could not get public URL for uploaded file.");
    }
    
    return data.publicUrl;
  };

  const value = {
    elections, candidates, voterCodes, usedVoterCodes, votes, isAdminAuthenticated,
    isVoterAuthenticated, currentVoterCode, currentView, setCurrentView,
    loginAdmin, logoutAdmin, loginVoter, logoutVoter, castVote,
    theme, toggleTheme, toast, showToast, isLoading,
    addElection, updateElection, deleteElection, setActiveElection,
    addCandidate, updateCandidate, deleteCandidate,
    generateAndSaveCodes, clearAllCodes, uploadCandidatePhoto,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
