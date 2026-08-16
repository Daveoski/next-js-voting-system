import Head from "next/head";
import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { FaCircleExclamation } from "react-icons/fa6";

import { Leaderboard } from "@/components/voting/Leaderboard";
import { LiveClock } from "@/components/voting/LiveClock";
import { TallyBoard } from "@/components/voting/TallyBoard";
import { TotalVotes } from "@/components/voting/TotalVotes";
import { VoteForm } from "@/components/voting/VoteForm";
import { WinnerModal } from "@/components/voting/WinnerModal";
import { useVotes } from "@/hooks/use-votes";
import { currentWinners, type VotesSnapshot } from "@/lib/voting";
import { snapshot } from "@/server/vote-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Read straight from the ledger rather than through /api/votes: the store lives in
 * this same process, so an HTTP call to ourselves would only add a round trip.
 * Rendered per request, because a build-time tally would be wrong immediately.
 */
export const getServerSideProps: GetServerSideProps<{
  initialVotes: VotesSnapshot;
}> = async () => {
  return { props: { initialVotes: snapshot() } };
};

export default function Home({
  initialVotes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: votes, isError } = useVotes(initialVotes);
  const [winnerShown, setWinnerShown] = useState(false);

  return (
    <>
      <Head>
        <title>Daveoski Smart Voting System</title>
        <meta name="description" content="Cast your vote securely and wisely" />
      </Head>

      <div
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-linear-to-br from-blue-100 via-white to-purple-100 font-sans`}
      >
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 p-5">
          <main className="w-full rounded-2xl bg-white p-8 shadow-2xl">
            <h1 className="text-center text-4xl font-bold text-purple-700">
              Daveoski INEC Smart Voting System
            </h1>

            <p className="text-center text-green-600">
              Cast your vote securely and wisely
            </p>

            <LiveClock />

            {/* A failed background refetch leaves the last good numbers on screen,
                so this says the results may be behind rather than hiding them. */}
            {isError && (
              <p
                role="status"
                className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
              >
                <FaCircleExclamation aria-hidden className="shrink-0" />
                Lost touch with the polling station. These results may be out of
                date.
              </p>
            )}

            <VoteForm
              voters={votes.voters}
              onVoteCast={() => setWinnerShown(true)}
            />

            <Leaderboard tally={votes.tally} />
          </main>

          <TallyBoard tally={votes.tally} voterCount={votes.voters.length} />

          <TotalVotes total={votes.total} />
        </div>

        <WinnerModal
          winners={winnerShown ? currentWinners(votes.tally) : null}
          onClose={() => setWinnerShown(false)}
        />
      </div>
    </>
  );
}
