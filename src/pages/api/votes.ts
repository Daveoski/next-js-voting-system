import type { NextApiRequest, NextApiResponse } from "next";

import {
  isCandidate,
  VOTE_ERROR_MESSAGES,
  type VoteErrorCode,
  type VoteErrorResponse,
  type VotesSnapshot,
} from "@/lib/voting";
import { castVote, snapshot } from "@/server/vote-store";

type VotesResponse = VotesSnapshot | VoteErrorResponse;

function sendError(
  res: NextApiResponse<VotesResponse>,
  status: number,
  code: VoteErrorCode,
): void {
  res.status(status).json({ code, message: VOTE_ERROR_MESSAGES[code] });
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<VotesResponse>,
) {
  if (req.method === "GET") {
    res.status(200).json(snapshot());
    return;
  }

  if (req.method === "POST") {
    // The body is whatever was posted, not necessarily what the form sends, so
    // both fields are checked rather than trusted.
    const { voterName, candidate } = (req.body ?? {}) as Record<
      string,
      unknown
    >;

    if (typeof voterName !== "string" || voterName.trim() === "") {
      sendError(res, 400, "MISSING_NAME");
      return;
    }

    if (!isCandidate(candidate)) {
      sendError(res, 400, "UNKNOWN_CANDIDATE");
      return;
    }

    const result = castVote(voterName, candidate);

    if (!result.ok) {
      sendError(res, result.code === "DUPLICATE_VOTER" ? 409 : 400, result.code);
      return;
    }

    res.status(200).json(result.snapshot);
    return;
  }

  res.setHeader("Allow", "GET, POST");
  sendError(res, 405, "METHOD_NOT_ALLOWED");
}
