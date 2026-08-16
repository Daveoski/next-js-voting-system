import { useSyncExternalStore } from "react";
import { FaClock } from "react-icons/fa6";

/**
 * One ticking clock, shared by every subscriber, modelled as an external store.
 *
 * A clock is not React state — it is a platform API that changes on its own — so
 * it is subscribed to rather than driven from an effect, and one interval serves
 * however many clocks are on screen.
 */
const clock = (() => {
  const listeners = new Set<() => void>();

  let snapshot = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  function tick(): void {
    snapshot = Date.now();
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener: () => void): () => void {
      listeners.add(listener);

      // Read on subscribe so a clock that mounts late is not a second behind.
      snapshot = Date.now();
      timer ??= setInterval(tick, 1_000);

      return () => {
        listeners.delete(listener);

        if (listeners.size === 0 && timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      };
    },

    getSnapshot: (): number => snapshot,

    /**
     * Nothing on the server: a timestamp rendered there would not match the one
     * the browser produces a moment later, and React treats that disagreement as
     * a hydration error.
     */
    getServerSnapshot: (): number | null => null,
  };
})();

/** The clock the original page had a slot for but never filled in. */
export function LiveClock() {
  const now = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
    clock.getServerSnapshot,
  );

  const reading = now === null ? null : new Date(now);

  return (
    <p className="mt-3 flex min-h-6 items-center justify-center gap-2 font-semibold text-pink-600">
      {reading && (
        <>
          <FaClock aria-hidden />
          <time dateTime={reading.toISOString()}>
            {reading.toLocaleString()}
          </time>
        </>
      )}
    </p>
  );
}
