import {
  CANDIDATES,
  voterKey,
  type Candidate,
  type VoteErrorCode,
  type VoteTally,
  type VotesSnapshot,
} from "@/lib/voting";


type VoteStore = {
  votes: Map<Candidate, number>;
  voters: Set<string>;
};

/**
 * Kept on globalThis so an HMR reload in `next dev` edits the code without
 * throwing away the votes cast so far.
 */
const globalForVotes = globalThis as typeof globalThis & {
  __voteStore?: VoteStore;
};

function createStore(): VoteStore {
  return {
    votes: new Map(CANDIDATES.map((name) => [name, 0])),
    voters: new Set(),
  };
}

const store: VoteStore = (globalForVotes.__voteStore ??= createStore());


export function snapshot(): VotesSnapshot {
  const tally = Object.fromEntries(
    CANDIDATES.map((name) => [name, store.votes.get(name) ?? 0]),
  ) as VoteTally;

  return {
    tally,
    voters: [...store.voters],
    total: CANDIDATES.reduce((sum, name) => sum + tally[name], 0),
  };
}

export type CastVoteResult =
  | { ok: true; snapshot: VotesSnapshot }
  | { ok: false; code: VoteErrorCode };

export function castVote(
  voterName: string,
  candidate: Candidate,
): CastVoteResult {
  const key = voterKey(voterName);

  if (key === "") return { ok: false, code: "MISSING_NAME" };
  if (store.voters.has(key)) return { ok: false, code: "DUPLICATE_VOTER" };

  store.voters.add(key);
  store.votes.set(candidate, (store.votes.get(candidate) ?? 0) + 1);

  return { ok: true, snapshot: snapshot() };
}
