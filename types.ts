export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  vision: string;
  mission: string;
  photoUrl: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterCode: string;
  timestamp: string;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}
