import { FaCircleCheck } from "react-icons/fa6";

export function TotalVotes({ total }: { total: number }) {
  return (
    <section className="w-full rounded-xl bg-pink-600 p-5 text-white shadow-lg lg:fixed lg:right-6 lg:bottom-6 lg:w-52">
      <h2 className="flex items-center gap-2 font-bold">
        <FaCircleCheck aria-hidden />
        Total Votes
      </h2>

      <p className="text-center text-5xl tabular-nums">{total}</p>
    </section>
  );
}
