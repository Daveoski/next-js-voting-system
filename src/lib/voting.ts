
export type Candidate = "Lilian" | "Austin" | "Kosi" | "David";

export const CANDIDATES: readonly Candidate[] = [
  "Lilian",
  "Austin",
  "Kosi",
  "David",
];

export function isCandidate(value: unknown): value is Candidate {
  return CANDIDATES.includes(value as Candidate);
}

export function voterKey(name: string): string {
  return name.trim().toLowerCase();
}

export type VoteTally = Record<Candidate, number>;

export type VotesSnapshot = {
  tally: VoteTally;
  voters: string[];
  total: number;
};

export type CastVoteBody = {
  voterName: string;
  candidate: Candidate;
};

export type VoteErrorCode =
  | "MISSING_NAME"
  | "UNKNOWN_CANDIDATE"
  | "DUPLICATE_VOTER"
  | "METHOD_NOT_ALLOWED";

export type VoteErrorResponse = {
  code: VoteErrorCode;
  message: string;
};

export const VOTE_ERROR_MESSAGES: Record<VoteErrorCode, string> = {
  MISSING_NAME: "Enter your name before voting.",
  UNKNOWN_CANDIDATE: "That is not someone you can vote for.",
  DUPLICATE_VOTER: "You have already voted.",
  METHOD_NOT_ALLOWED: "That request is not supported.",
};

export function rankedVotes(tally: VoteTally): [Candidate, number][] {
  return CANDIDATES.map(
    (name): [Candidate, number] => [name, tally[name]],
  ).sort((a, b) => b[1] - a[1]);
}


export function currentWinners(
  tally: VoteTally,
): { names: Candidate[]; score: number } | null {
  const ranked = rankedVotes(tally);
  const [, highest] = ranked[0];

  if (highest === 0) return null;

  return {
    names: ranked.filter(([, score]) => score === highest).map(([name]) => name),
    score: highest,
  };
}
