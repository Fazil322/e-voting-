import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Election, Candidate, Vote, Toast } from '../types';
import { ADMIN_CODE } from '../constants';
import { supabase } from '../utils/supabaseClient';
import { 
    mapElectionFromDb, mapCandidateFromDb, mapVoteFromDb,
    mapElectionToDb, mapCandidateToDb 
} from '../utils/dataMapper';

type Theme = 'light' | 'dark';

export interface VoterCode {
    code: string;
    is_used: boolean;
}

interface AppContextType {
  elections: Election[];
  candidates: Candidate[];
  votes: Vote[];
  codeStats: { total: number; used: number; };
  isAdminAuthenticated: boolean;
  isVoterAuthenticated: boolean;
  currentVoterCode: string | null;
  currentView: 'home' | 'voterLogin' | 'adminLogin' | 'votingFinished';
  setCurrentView: React.Dispatch<React.SetStateAction<'home' | 'voterLogin' | 'adminLogin' | 'votingFinished'>>;
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
  addElection: (election: Partial<Election>) => Promise<Election>;
  updateElection: (election: Election) => Promise<void>;
  deleteElection: (id: string) => Promise<void>;
  setActiveElection: (election: Election) => Promise<void>;
  addCandidate: (candidate: Partial<Candidate>) => Promise<Candidate>;
  updateCandidate: (candidate: Candidate) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  generateAndSaveCodes: (count: number) => Promise<void>;
  clearAllCodes: () => Promise<void>;
  fetchCodesPage: (page: number, searchTerm: string) => Promise<{ codes: VoterCode[], count: number }>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [codeStats, setCodeStats] = useState({ total: 0, used: 0 });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isVoterAuthenticated, setIsVoterAuthenticated] = useState<boolean>(false);
  const [currentVoterCode, setCurrentVoterCode] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'voterLogin' | 'adminLogin' | 'votingFinished'>('home');
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
  
  const fetchCodeStats = useCallback(async () => {
    const { count: totalCount, error: totalError } = await supabase.from('voter_codes').select('*', { count: 'exact', head: true });
    if (totalError) throw totalError;

    const { count: usedCount, error: usedError } = await supabase.from('voter_codes').select('*', { count: 'exact', head: true }).eq('is_used', true);
    if (usedError) throw usedError;
    
    setCodeStats({ total: totalCount ?? 0, used: usedCount ?? 0 });
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [electionsRes, candidatesRes, votesRes] = await Promise.all([
                supabase.from('elections').select('*'),
                supabase.from('candidates').select('*'),
                supabase.from('votes').select('*')
            ]);

            if (electionsRes.error) throw electionsRes.error;
            setElections(electionsRes.data.map(mapElectionFromDb));

            if (candidatesRes.error) throw candidatesRes.error;
            setCandidates(candidatesRes.data.map(mapCandidateFromDb));
            
            if (votesRes.error) throw votesRes.error;
            setVotes(votesRes.data.map(mapVoteFromDb));

            await fetchCodeStats();
            
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast('Gagal memuat data dari server.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    fetchInitialData();

    const votesChannel = supabase
      .channel('realtime-votes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, (payload) => {
        const newVote = mapVoteFromDb(payload.new);
        setVotes(prev => prev.some(v => v.id === newVote.id) ? prev : [...prev, newVote]);
        fetchCodeStats();
      })
      .subscribe();
      
    const electionsChannel = supabase
      .channel('realtime-elections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elections' }, (payload) => {
        if (payload.eventType === 'INSERT') {
            const newElection = mapElectionFromDb(payload.new);
            setElections(prev => prev.some(e => e.id === newElection.id) ? prev : [...prev, newElection]);
        } else if (payload.eventType === 'UPDATE') {
            const updatedElection = mapElectionFromDb(payload.new);
            setElections(prev => prev.map(e => e.id === updatedElection.id ? updatedElection : e));
        } else if (payload.eventType === 'DELETE') {
            setElections(prev => prev.filter(e => e.id !== payload.old.id));
        }
      })
      .subscribe();

    const candidatesChannel = supabase
      .channel('realtime-candidates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, (payload) => {
         if (payload.eventType === 'INSERT') {
            const newCandidate = mapCandidateFromDb(payload.new);
            setCandidates(prev => prev.some(c => c.id === newCandidate.id) ? prev : [...prev, newCandidate]);
        } else if (payload.eventType === 'UPDATE') {
            const updatedCandidate = mapCandidateFromDb(payload.new);
            setCandidates(prev => prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c));
        } else if (payload.eventType === 'DELETE') {
            setCandidates(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();


    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(electionsChannel);
      supabase.removeChannel(candidatesChannel);
    };
  }, [fetchCodeStats]);

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
        await supabase.from('voter_codes').update({ is_used: false }).eq('code', currentVoterCode);
        return;
    }
    
    setCurrentView('votingFinished');
  };

  const addElection = async (election: Partial<Election>): Promise<Election> => {
    const dbPayload = mapElectionToDb(election);
    delete dbPayload.id;
    const { data, error } = await supabase.from('elections').insert(dbPayload).select().single();
    if (error) throw error;
    const newElection = mapElectionFromDb(data);
    setElections(prev => [...prev, newElection]);
    return newElection;
  };

  const updateElection = async (election: Election) => {
    const { error } = await supabase.from('elections').update(mapElectionToDb(election)).eq('id', election.id);
    if (error) throw error;
    setElections(prev => prev.map(e => e.id === election.id ? election : e));
  };
  
  const deleteElection = async (id: string) => {
    await supabase.from('votes').delete().eq('election_id', id);
    await supabase.from('candidates').delete().eq('election_id', id);
    const { error } = await supabase.from('elections').delete().eq('id', id);
    if (error) throw error;
    setElections(prev => prev.filter(e => e.id !== id));
    setCandidates(prev => prev.filter(c => c.electionId !== id));
    setVotes(prev => prev.filter(v => v.electionId !== id));
  };

  const setActiveElection = async (electionToToggle: Election) => {
    const { error: deactivateError } = await supabase.from('elections').update({ is_active: false }).neq('id', electionToToggle.id);
    if (deactivateError) throw deactivateError;
    const { error: activateError } = await supabase.from('elections').update({ is_active: true }).eq('id', electionToToggle.id);
    if (activateError) throw activateError;
    setElections(prev => prev.map(e => ({ ...e, isActive: e.id === electionToToggle.id })));
  };

  const addCandidate = async (candidate: Partial<Candidate>): Promise<Candidate> => {
      const dbPayload = mapCandidateToDb(candidate);
      delete dbPayload.id;
      const { data, error } = await supabase.from('candidates').insert(dbPayload).select().single();
      if (error) throw error;
      const newCandidate = mapCandidateFromDb(data);
      setCandidates(prev => [...prev, newCandidate]);
      return newCandidate;
  };

  const updateCandidate = async (candidate: Candidate) => {
      const { error } = await supabase.from('candidates').update(mapCandidateToDb(candidate)).eq('id', candidate.id);
      if (error) throw error;
      setCandidates(prev => prev.map(c => c.id === candidate.id ? candidate : c));
  };

  const deleteCandidate = async (id: string) => {
      await supabase.from('votes').delete().eq('candidate_id', id);
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      setCandidates(prev => prev.filter(c => c.id !== id));
  };
  
  const fetchCodesPage = async (page: number, searchTerm: string): Promise<{ codes: VoterCode[], count: number }> => {
    const CODES_PER_PAGE = 100;
    const from = (page - 1) * CODES_PER_PAGE;
    const to = from + CODES_PER_PAGE - 1;

    let query = supabase.from('voter_codes').select('code, is_used', { count: 'exact' });
    if (searchTerm) {
        query = query.ilike('code', `%${searchTerm}%`);
    }
    const { data, error, count } = await query.order('code').range(from, to);

    if (error) throw error;
    return { codes: data as VoterCode[], count: count || 0 };
  };

  const generateAndSaveCodes = async (count: number) => {
    const newCodes: { code: string }[] = [];
    const { data: existingData } = await supabase.from('voter_codes').select('code');
    const existingCodes = new Set(existingData?.map(c => c.code) || []);
    
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
    await fetchCodeStats();
  };

  const clearAllCodes = async () => {
    const { error } = await supabase.from('voter_codes').delete().neq('code', 'IMPOSSIBLE_CODE_TO_MATCH');
    if (error) throw error;
    await fetchCodeStats();
  };
  
  const value = {
    elections, candidates, votes, isAdminAuthenticated,
    isVoterAuthenticated, currentVoterCode, currentView, setCurrentView,
    loginAdmin, logoutAdmin, loginVoter, logoutVoter, castVote,
    theme, toggleTheme, toast, showToast, isLoading, codeStats,
    addElection, updateElection, deleteElection, setActiveElection,
    addCandidate, updateCandidate, deleteCandidate,
    generateAndSaveCodes, clearAllCodes, fetchCodesPage
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};