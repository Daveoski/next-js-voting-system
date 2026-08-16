import { FaSquareCheck } from "react-icons/fa6";

import { CANDIDATES, type VoteTally } from "@/lib/voting";

type TallyBoardProps = {
  tally: VoteTally;
  voterCount: number;
};

/**
 * The per-candidate counts, in the order the candidates are declared rather than
 * by score, so the rows do not move around while you are reading them.
 */
export function TallyBoard({ tally, voterCount }: TallyBoardProps) {
  return (
    <section className="w-full rounded-xl border border-pink-200 bg-pink-50 p-5 shadow-xl lg:fixed lg:bottom-6 lg:left-6 lg:w-56">
      <h2 className="flex items-start gap-2 font-bold text-blue-600">
        <FaSquareCheck aria-hidden className="mt-1 shrink-0" />
        Votes For Each Candidate (Qualified Voters Only)
      </h2>

      <dl className="mt-3">
        {CANDIDATES.map((name) => (
          <div key={name} className="flex justify-between py-0.5">
            <dt>{name}</dt>
            <dd className="font-semibold tabular-nums">{tally[name]}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 border-t border-pink-200 pt-2 text-sm text-gray-600">
        {voterCount} qualified {voterCount === 1 ? "voter" : "voters"}
      </p>
    </section>
  );
}
