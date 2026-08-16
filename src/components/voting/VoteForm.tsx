import { useEffect, useRef, useState } from "react";
import {
  FaCheck,
  FaCircleExclamation,
  FaSpinner,
  FaUser,
} from "react-icons/fa6";

import { useCastVote, VoteError } from "@/hooks/use-votes";
import {
  CANDIDATES,
  isCandidate,
  VOTE_ERROR_MESSAGES,
  voterKey,
} from "@/lib/voting";

type VoteFormProps = {
  /** Normalized keys of everyone who has already voted, from the server. */
  voters: string[];
  onVoteCast: () => void;
};

export function VoteForm({ voters, onVoteCast }: VoteFormProps) {
  const [name, setName] = useState("");
  const [choice, setChoice] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const castVote = useCastVote();

  const alreadyVoted = voters.includes(voterKey(name));

  /**
   * Hands the duplicate-voter rule to the browser: an invalid message here makes
   * the form refuse to submit and shows the reason next to the field. This is
   * only the courtesy version — the API rejects duplicates regardless.
   */
  useEffect(() => {
    nameRef.current?.setCustomValidity(
      alreadyVoted ? VOTE_ERROR_MESSAGES.DUPLICATE_VOTER : "",
    );
  }, [alreadyVoted]);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();

    // Both fields are `required` and the blank placeholder below is not a valid
    // choice, so the browser will not fire this until a name is typed and a
    // candidate is picked. The guard is what proves it to TypeScript.
    if (!isCandidate(choice)) return;

    castVote.mutate(
      { voterName: name, candidate: choice },
      {
        onSuccess: () => {
          setName("");
          setChoice("");
          onVoteCast();
        },
      },
    );
  }

  const failure = castVote.error;
  const failureMessage =
    failure instanceof VoteError
      ? failure.message
      : failure
        ? "Could not reach the polling station. Try again."
        : null;

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="voterName"
          className="flex items-center gap-2 font-semibold"
        >
          <FaUser aria-hidden className="text-purple-700" />
          Voter&apos;s Name
        </label>

        <input
          id="voterName"
          ref={nameRef}
          type="text"
          required
          autoComplete="name"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 p-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      <div>
        <label htmlFor="candidate" className="font-semibold">
          Choose Candidate
        </label>

        {/* Options come from CANDIDATES, so the page can never offer a choice
            the tally does not know about. The blank placeholder stays invalid
            for `required`, which is what stops an empty submission. */}
        <select
          id="candidate"
          required
          value={choice}
          onChange={(event) => setChoice(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
        >
          <option value="">Select Candidate</option>
          {CANDIDATES.map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={castVote.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {castVote.isPending ? (
          <>
            <FaSpinner aria-hidden className="animate-spin" />
            Casting
          </>
        ) : (
          <>
            <FaCheck aria-hidden />
            Vote
          </>
        )}
      </button>

      {failureMessage && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          <FaCircleExclamation aria-hidden className="shrink-0" />
          {failureMessage}
        </p>
      )}
    </form>
  );
}
