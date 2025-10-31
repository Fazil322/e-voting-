import { Election, Candidate, Vote } from '../types';

// From Database (snake_case) to Application (camelCase)
export const mapElectionFromDb = (dbElection: any): Election => ({
    id: dbElection.id,
    title: dbElection.title,
    description: dbElection.description,
    startDate: dbElection.start_date,
    endDate: dbElection.end_date,
    isActive: dbElection.is_active,
});

export const mapCandidateFromDb = (dbCandidate: any): Candidate => ({
    id: dbCandidate.id,
    electionId: dbCandidate.election_id,
    name: dbCandidate.name,
    vision: dbCandidate.vision,
    mission: dbCandidate.mission,
    photoUrl: dbCandidate.photo_url,
});

export const mapVoteFromDb = (dbVote: any): Vote => ({
    id: dbVote.id,
    electionId: dbVote.election_id,
    candidateId: dbVote.candidate_id,
    voterCode: dbVote.voter_code,
    timestamp: dbVote.timestamp,
});

// From Application (camelCase) to Database (snake_case)
export const mapElectionToDb = (election: Partial<Election>): any => ({
    id: election.id,
    title: election.title,
    description: election.description,
    start_date: election.startDate,
    end_date: election.endDate,
    is_active: election.isActive,
});

export const mapCandidateToDb = (candidate: Partial<Candidate>): any => ({
    id: candidate.id,
    election_id: candidate.electionId,
    name: candidate.name,
    vision: candidate.vision,
    mission: candidate.mission,
    photo_url: candidate.photoUrl,
});
