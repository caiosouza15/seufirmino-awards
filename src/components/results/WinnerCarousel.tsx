import { useEffect, useMemo, useState } from "react";
import type { ResultsCategory, ResultsNominee } from "../../hooks/useResultsData";

export type WinnerCarouselProps = {
  categories: ResultsCategory[];
};

function getWinner(category: ResultsCategory): ResultsNominee | null {
  return category.nominees.find((nominee) => nominee.isWinner) ?? null;
}

function getNonWinners(category: ResultsCategory): ResultsNominee[] {
  const winnerIds = category.nominees.filter((n) => n.isWinner).map((n) => n.id);
  return category.nominees.filter((nominee) => !winnerIds.includes(nominee.id));
}

export function WinnerCarousel({
  categories,
}: WinnerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = useMemo(() => categories, [categories]);
  const total = slides.length;
  const currentSlide = slides[currentIndex] ?? null;

  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, total]);

  const handleNext = () => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  if (!currentSlide) {
    return null;
  }

  const winner = getWinner(currentSlide);
  const others = getNonWinners(currentSlide);
  const orderedOthers = useMemo(
    () => [...others].sort((a, b) => b.totalVotes - a.totalVotes),
    [others]
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-br from-slate-950 via-indigo-900/50 to-cyan-900/50 shadow-[0_0_35px_rgba(99,102,241,0.55)]">
      <div className="absolute inset-0 opacity-60 blur-3xl" aria-hidden>
        <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-violet-600/40" />
        <div className="absolute right-4 top-0 h-24 w-24 rounded-full bg-cyan-400/40" />
        <div className="absolute bottom-2 left-1/3 h-28 w-28 rounded-full bg-fuchsia-500/30" />
      </div>

      <div className="relative p-6 sm:p-8 md:p-10 space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow">
              Campeoes - {currentSlide.name}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="group relative h-12 w-12 overflow-hidden rounded-full border border-cyan-300/50 bg-gradient-to-br from-cyan-500/30 via-slate-900 to-violet-600/40 text-white shadow-[0_0_18px_rgba(34,211,238,0.35)] transition transform hover:scale-105 hover:shadow-[0_0_28px_rgba(139,92,246,0.55)] focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Anterior"
            >
              <span className="absolute inset-0 opacity-0 transition group-hover:opacity-30 bg-gradient-to-br from-cyan-400/50 via-transparent to-fuchsia-500/50" />
              <span className="pointer-events-none relative flex h-full w-full items-center justify-center text-lg font-black leading-none drop-shadow-sm">
                &lt;
              </span>
            </button>
            <button
              onClick={handleNext}
              className="group relative h-12 w-12 overflow-hidden rounded-full border border-cyan-300/50 bg-gradient-to-br from-cyan-500/30 via-slate-900 to-violet-600/40 text-white shadow-[0_0_18px_rgba(34,211,238,0.35)] transition transform hover:scale-105 hover:shadow-[0_0_28px_rgba(139,92,246,0.55)] focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Proximo"
            >
              <span className="absolute inset-0 opacity-0 transition group-hover:opacity-30 bg-gradient-to-br from-cyan-400/50 via-transparent to-fuchsia-500/50" />
              <span className="pointer-events-none relative flex h-full w-full items-center justify-center text-lg font-black leading-none drop-shadow-sm">
                &gt;
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.6fr_0.9fr] items-start">
          <div className="relative overflow-hidden rounded-2xl border border-cyan-300/50 bg-white/5 p-6 sm:p-7 shadow-[0_0_45px_rgba(59,130,246,0.35)]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-fuchsia-400/5 to-indigo-500/10" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
              {winner?.image_url ? (
                <div className="h-32 w-32 overflow-hidden rounded-xl border border-white/30 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
                  <img
                    src={winner.image_url}
                    alt={winner.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-xl border border-white/20 bg-slate-900/40 text-2xl font-bold text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
                  WIN
                </div>
              )}

              <div className="space-y-3 text-left">
                <p className="text-sm uppercase tracking-[0.15em] text-cyan-100/80">
                  Vencedor
                </p>
                <h3 className="text-3xl font-black text-white drop-shadow-sm">
                  {winner?.name ?? "Sem votos ainda"}
                </h3>
                {winner && (
                  <div className="flex flex-wrap gap-2 text-sm text-cyan-50">
                    <span className="rounded-full border border-cyan-300/50 bg-cyan-400/15 px-3 py-1 font-semibold shadow-[0_0_12px_rgba(34,211,238,0.35)]">
                      {winner.totalVotes} voto{winner.totalVotes === 1 ? "" : "s"}
                    </span>
                    <span className="rounded-full border border-fuchsia-400/50 bg-fuchsia-500/15 px-3 py-1 font-semibold shadow-[0_0_12px_rgba(236,72,153,0.35)]">
                      {winner.percent.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {others.length > 0 && (
            <div className="flex flex-col space-y-4 rounded-2xl border border-violet-500/40 bg-white/5 p-6 md:p-10 shadow-[0_0_30px_rgba(139,92,246,0.35)]">
              <p className="text-sm font-semibold text-violet-100 pb-1">Demais indicados</p>
              <div className="grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-1">
                {orderedOthers.map((nominee) => (
                  <div
                    key={nominee.id}
                    className="rounded-xl border border-white/15 bg-slate-900/50 p-4 shadow-[0_0_16px_rgba(255,255,255,0.08)]"
                  >
                    <p className="text-base font-semibold text-white">{nominee.name}</p>
                    <p className="text-sm text-slate-300">
                      {nominee.totalVotes} voto{nominee.totalVotes === 1 ? "" : "s"} -{" "}
                      {nominee.percent.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={[
                "h-2 w-10 rounded-full transition-all",
                idx === currentIndex
                  ? "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                  : "bg-white/20",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
