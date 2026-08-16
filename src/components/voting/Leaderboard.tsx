import { FaCrown, FaMedal, FaRankingStar } from "react-icons/fa6";

import { rankedVotes, type VoteTally } from "@/lib/voting";

const MEDALS = [
  { Icon: FaCrown, className: "text-amber-400" },
  { Icon: FaMedal, className: "text-slate-400" },
  { Icon: FaMedal, className: "text-amber-700" },
] as const;

/**
 * A medal for the top three scores, and nothing for a candidate on nil, who has
 * not placed in anything. Keyed off the score rather than the row number, so
 * candidates level on votes share a place instead of one of them being handed
 * the crown for sorting first.
 */
function RankBadge({ place, score }: { place: number; score: number }) {
  const medal = score > 0 ? MEDALS[place] : undefined;

  if (!medal) {
    return (
      <span className="w-4 text-center text-sm text-gray-400">{place + 1}</span>
    );
  }

  const { Icon, className } = medal;

  return (
    <Icon
      aria-label={`Place ${place + 1}`}
      className={`w-4 shrink-0 ${className}`}
    />
  );
}

export function Leaderboard({ tally }: { tally: VoteTally }) {
  const ranked = rankedVotes(tally);

  // Distinct scores, still highest first, so a score's index is its place and
  // everyone level on votes lands on the same one.
  const places = [...new Set(ranked.map(([, score]) => score))];

  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 text-xl font-bold text-blue-600">
        <FaRankingStar aria-hidden />
        Leaderboard
      </h2>

      <ol className="mt-2">
        {ranked.map(([name, score]) => (
          <li
            key={name}
            className="mt-2 flex justify-between rounded-lg bg-gray-100 p-3"
          >
            <span className="flex items-center gap-2">
              <RankBadge place={places.indexOf(score)} score={score} />
              {name}
            </span>
            <span className="font-semibold tabular-nums">{score}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
