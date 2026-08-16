import { useEffect, useRef } from "react";
import { FaTrophy, FaXmark } from "react-icons/fa6";

import type { Candidate } from "@/lib/voting";

type WinnerModalProps = {
  winners: { names: Candidate[]; score: number } | null;
  onClose: () => void;
};

/**
 * Shown after each vote, as the original did. Unlike the original it stays shut
 * until somebody actually has a vote, and it names every leader when the top
 * score is shared instead of crowning whoever happened to sort first.
 */
export function WinnerModal({ winners, onClose }: WinnerModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!winners) return;

    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [winners, onClose]);

  if (!winners) return null;

  const isTie = winners.names.length > 1;

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="winnerHeading"
      onClick={onClose}
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-5"
    >
      {/* Stops a click inside the card from reaching the backdrop above. */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <h2 id="winnerHeading" className="text-3xl font-bold text-green-600">
          {isTie ? "It's a tie" : "Winner"}
        </h2>

        <FaTrophy
          aria-hidden
          className="mx-auto mt-5 text-6xl text-amber-400"
        />

        <p className="mt-3 text-3xl font-bold text-green-600">
          {winners.names.join(" & ")}
        </p>

        <p className="mt-3 text-xl">
          {winners.score} Vote{winners.score === 1 ? "" : "s"}
        </p>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600"
        >
          <FaXmark aria-hidden />
          Close
        </button>
      </div>
    </div>
  );
}
