import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  VOTE_ERROR_MESSAGES,
  type CastVoteBody,
  type VoteErrorCode,
  type VoteErrorResponse,
  type VotesSnapshot,
} from "@/lib/voting";

const VOTES_URL = "/api/votes";

export const voteKeys = {
  all: ["votes"] as const,
};

export class VoteError extends Error {
  readonly code: VoteErrorCode;

  constructor(code: VoteErrorCode, message: string) {
    super(message);
    this.name = "VoteError";
    this.code = code;
  }
}

async function readError(response: Response): Promise<never> {
  const body: unknown = await response.json().catch(() => null);
  const { code, message } = (body ?? {}) as Partial<VoteErrorResponse>;

  if (code && code in VOTE_ERROR_MESSAGES) {
    throw new VoteError(code, message ?? VOTE_ERROR_MESSAGES[code]);
  }

  throw new Error(`The server rejected the request (${response.status}).`);
}

async function fetchVotes(): Promise<VotesSnapshot> {
  const response = await fetch(VOTES_URL);

  if (!response.ok) await readError(response);

  return response.json() as Promise<VotesSnapshot>;
}

async function postVote(body: CastVoteBody): Promise<VotesSnapshot> {
  const response = await fetch(VOTES_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) await readError(response);

  return response.json() as Promise<VotesSnapshot>;
}


/**
 * The tally, the total and who has already voted.
 *
 * Seeded with the snapshot the page rendered on the server, so the form is usable
 * on first paint instead of after a round trip, then refetched on an interval so
 * a vote cast in another tab shows up here without a reload.
 */
export function useVotes(initialData: VotesSnapshot) {
  return useQuery({
    queryKey: voteKeys.all,
    queryFn: fetchVotes,
    initialData,
    refetchInterval: 5_000,
  });
}

export function useCastVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postVote,
    // The response is the authoritative state just after the vote, so it is
    // written straight to the cache instead of invalidating and asking again.
    onSuccess: (snapshot) => {
      queryClient.setQueryData(voteKeys.all, snapshot);
    },
  });
}
