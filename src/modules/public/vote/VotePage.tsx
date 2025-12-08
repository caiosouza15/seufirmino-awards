import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "../../../components/layout/PageContainer";
import { useContestData } from "../../../hooks/useContestData";
import { ProvocationToasts, type ProvocationToast } from "./components/ProvocationToasts";
import { VoteCarousel } from "./components/VoteCarousel";

export function VotePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { status, errorMessage, contest, categories, nominees, voter } = useContestData(token);
  const [provocations, setProvocations] = useState<ProvocationToast[]>([]);
  const timersRef = useRef<number[]>([]);

  const nomineesByCategory = useMemo(() => {
    return nominees.reduce<Record<string, typeof nominees>>((acc, nominee) => {
      if (!acc[nominee.category_id]) {
        acc[nominee.category_id] = [];
      }
      acc[nominee.category_id].push(nominee);
      return acc;
    }, {});
  }, [nominees]);

  useEffect(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setProvocations([]);

    if (status !== "ready") {
      return;
    }

    const actors = [
      {
        author: "Jessica",
        accentClass: "bg-pink-400",
        messages: [
          "Ta pedindo dica pra esposa ou vai decidir sozinho?",
          "Bora votar antes que feche!",
          "Ja escolheu ou ta enrolando?",
        ],
      },
      {
        author: "Vinicius",
        accentClass: "bg-orange-400",
        messages: [
          "Demorando, hein? Essa categoria nem e tao dificil.",
          "Olha o relogio: ja votou?",
          "Confia na intuicao, clica logo.",
        ],
      },
      {
        author: "Eloisa",
        accentClass: "bg-emerald-400",
        messages: [
          "Eu ja votei. Voce ainda nao?",
          "Vai que o seu favorito perde por 1 voto...",
          "Escolhe logo e segue pro proximo.",
        ],
      },
    ];

    const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

    const scheduleToast = (delayMs: number) => {
      const timer = window.setTimeout(() => {
        const actor = pickRandom(actors);
        const message = pickRandom(actor.messages);
        const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        setProvocations((prev) => [...prev, { id, author: actor.author, message, accentClass: actor.accentClass }]);
      }, delayMs);
      timersRef.current.push(timer);
    };

    const baseDelay = 8000;
    const jitter = () => Math.floor(Math.random() * 4000); // 0-4s

    scheduleToast(baseDelay + jitter()); // ~8-12s
    scheduleToast(baseDelay + 12000 + jitter()); // ~20-24s
    scheduleToast(baseDelay + 24000 + jitter()); // ~32-36s

    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [status]);

  const dismissToast = (id: string) => {
    setProvocations((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="bg-[#05051A]">
      <PageContainer>
        <ProvocationToasts toasts={provocations} onDismiss={dismissToast} />

        {status === "loading" && <p className="text-slate-200">Carregando votacao...</p>}

        {status === "invalidLink" && (
          <p className="text-slate-200">{errorMessage ?? "Token invalido ou expirado."}</p>
        )}

        {status === "inactiveLink" && (
          <p className="text-slate-200">{errorMessage ?? "Link inativo. Solicite um novo token."}</p>
        )}

        {status === "outOfPeriod" && (
          <p className="text-slate-200">{errorMessage ?? "Fora do periodo de votacao."}</p>
        )}

        {status === "alreadyVoted" && (
          <p className="text-slate-200">
            {errorMessage ?? "Voce ja registrou seus votos para este concurso."}
          </p>
        )}

        {status === "error" && (
          <p className="text-slate-200">{errorMessage ?? "Nao foi possivel carregar a votacao."}</p>
        )}

        {status === "ready" && contest && voter && (
          <VoteCarousel
            contest={contest}
            voter={voter}
            categories={categories}
            nomineesByCategory={nomineesByCategory}
          />
        )}
      </PageContainer>
    </main>
  );
}
