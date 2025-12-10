import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "../../../components/layout/PageContainer";
import { ResultsOpening } from "../../../components/results/ResultsOpening";
import { ResultsTable } from "../../../components/results/ResultsTable";
import { WinnerCarousel } from "../../../components/results/WinnerCarousel";
import { useResultsData } from "../../../hooks/useResultsData";
import type { ResultsCategory } from "../../../hooks/useResultsData";
import type { Contest } from "../../../types/domain";

const phrases = [
  "Prontos para a fofoca definitiva? Eis os mais votados!",
  "A democracia falou. E falou alto! Veja quem levou o trofeu.",
  "Acabou a contagem! Agora e so a parte boa: rir dos resultados.",
];

const demoContest: Contest = {
  id: "demo-contest",
  name: "Quarteto Awards – DEMO MODE",
  description: null,
  start_at: "",
  end_at: "",
  reveal_at: null,
  is_active: true,
  created_at: "",
};

const demoCategories: ResultsCategory[] = [
  {
    id: "demo1",
    name: "Melhor Restaurante",
    nominees: [
      { id: "n1", name: "Sushi Hiroshi", image_url: null, totalVotes: 7, percent: 58, isWinner: true },
      { id: "n2", name: "Burger House", image_url: null, totalVotes: 4, percent: 33, isWinner: false },
      { id: "n3", name: "Pasta Mia", image_url: null, totalVotes: 1, percent: 9, isWinner: false },
    ],
  },
  {
    id: "demo2",
    name: "Filme do Ano",
    nominees: [
      { id: "n1", name: "Duna: Parte 2", image_url: null, totalVotes: 6, percent: 50, isWinner: true },
      { id: "n2", name: "Oppenheimer", image_url: null, totalVotes: 4, percent: 33, isWinner: false },
      { id: "n3", name: "Barbie", image_url: null, totalVotes: 2, percent: 17, isWinner: false },
    ],
  },
];

function PhraseCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-cyan-400/40 bg-white/5 p-5 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
      <p className="text-lg font-semibold text-white transition-all duration-500 ease-in-out">
        {phrases[index]}
      </p>
      <div className="flex items-center gap-1">
        {phrases.map((_, i) => (
          <span
            key={i}
            className={[
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-cyan-400" : "w-3 bg-white/30",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

function useCountdown(targetDate?: string | null) {
  const [delta, setDelta] = useState<string | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setDelta(null);
      return;
    }

    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setDelta("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setDelta(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return delta;
}

export function ResultsPage() {
  const { status, contest, categories } = useResultsData();
  const [searchParams] = useSearchParams();

  const isDemo = searchParams.get("demo") === "true";

  const finalStatus = isDemo ? "ready" : status;
  const finalContest = (isDemo ? demoContest : contest) ?? null;
  const finalCategories = isDemo ? demoCategories : categories;

  const shouldShowOpening = finalStatus === "ready";
  const hasIntroRun = useRef(false);
  const [isOpeningDone, setIsOpeningDone] = useState(false);

  const countdown = useCountdown(contest?.reveal_at);

  const revealDateText = useMemo(() => {
    if (!contest?.reveal_at) {
      return null;
    }

    const date = new Date(contest.reveal_at);
    return date.toLocaleString();
  }, [contest?.reveal_at]);

  useEffect(() => {
    // Quando ainda nao esta pronto, mantemos intro em espera
    if (!shouldShowOpening) {
      return;
    }

    // Quando estiver pronto e a intro nao rodou, libera para mostrar
    if (!hasIntroRun.current) {
      setIsOpeningDone(false);
    }
  }, [shouldShowOpening]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#070718] via-[#0b1120] to-[#120726] text-white">
      <PageContainer>
        {status === "loading" && !isDemo && (
          <div className="flex items-center gap-3 text-slate-100">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span>Carregando resultados...</span>
          </div>
        )}

        {status === "error" && !isDemo && (
          <div className="rounded-2xl border border-red-500/40 bg-red-900/30 p-6 text-red-100 shadow-lg">
            Nao foi possivel carregar os resultados. Tente novamente mais tarde.
          </div>
        )}

        {status === "beforeReveal" && contest && !isDemo && (
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-br from-indigo-900/50 via-[#0b1120] to-fuchsia-900/40 p-8 shadow-[0_0_40px_rgba(139,92,246,0.4)]">
            <div className="absolute inset-0 opacity-60 blur-3xl" aria-hidden>
              <div className="absolute -left-6 top-6 h-32 w-32 rounded-full bg-cyan-500/30" />
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-fuchsia-500/30" />
              <div className="absolute bottom-4 left-1/2 h-20 w-20 rounded-full bg-violet-600/40" />
            </div>

            <div className="relative space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                Calma, ainda nao e hora de revelar os vencedores.
              </h1>
              <p className="text-lg text-slate-200 md:max-w-2xl">
                Os resultados do concurso {contest.name} ficarao disponiveis assim que o
                relogio marcar o momento certo. Fique de olho!
              </p>

              {revealDateText && (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-cyan-50 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
                  <span className="text-sm uppercase tracking-[0.15em]">Reveal em</span>
                  <span className="text-lg font-bold">{revealDateText}</span>
                  {countdown && (
                    <span className="ml-auto rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold">
                      {countdown}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {finalStatus === "ready" && finalContest && (
          <div className="space-y-8">
            <header className="space-y-2">
              {isDemo && (
                <span className="inline-flex items-center rounded-full border border-cyan-300/60 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.35)]">
                  Modo Demo
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                Seu Firmino Awards 2025 🎉
              </h1>
            </header>

            {shouldShowOpening && !isOpeningDone && (
              <ResultsOpening
                onFinish={() => {
                  setIsOpeningDone(true);
                  hasIntroRun.current = true;
                }}
              />
            )}

            <div
              className={[
                "transition-all duration-300 space-y-8",
                shouldShowOpening && !isOpeningDone
                  ? "opacity-0 translate-y-2 pointer-events-none"
                  : "opacity-100 translate-y-0",
              ].join(" ")}
            >
              <PhraseCarousel />
              <WinnerCarousel categories={finalCategories} />
              <ResultsTable categories={finalCategories} />
            </div>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
