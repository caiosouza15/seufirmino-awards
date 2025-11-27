import { useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import type { Category, Contest, Nominee, Voter } from "../../../../types/domain";
import { CategoryStep } from "./CategoryStep";

export type VoteCarouselProps = {
  contest: Contest;
  voter: Voter;
  categories: Category[];
  nomineesByCategory: Record<string, Nominee[]>;
};

type CarouselStatus = "idle" | "saving" | "finished" | "error";

export function VoteCarousel({
  contest,
  voter,
  categories,
  nomineesByCategory,
}: VoteCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
  const [status, setStatus] = useState<CarouselStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCategory = categories[currentIndex];
  const totalSteps = categories.length;

  const currentNominees = useMemo(
    () => (currentCategory ? nomineesByCategory[currentCategory.id] ?? [] : []),
    [currentCategory, nomineesByCategory]
  );

  const handleConfirm = async () => {
    if (!currentCategory || !selectedNomineeId) {
      return;
    }

    if (status === "saving" || status === "finished") {
      return;
    }

    setStatus("saving");
    setErrorMessage(null);

    const userAgent =
      typeof navigator !== "undefined" && navigator.userAgent
        ? navigator.userAgent
        : null;

    const { error } = await supabase.from("votes").insert({
      contest_id: contest.id,
      category_id: currentCategory.id,
      nominee_id: selectedNomineeId,
      voter_id: voter.id,
      ip_address: null,
      user_agent: userAgent,
    });

    if (error) {
      setStatus("error");
      setErrorMessage("Não foi possível registrar seu voto. Tente novamente.");
      return;
    }

    const isLastCategory = currentIndex === totalSteps - 1;

    if (isLastCategory) {
      setStatus("finished");
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedNomineeId(null);
    setStatus("idle");
  };

  if (totalSteps === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">{contest.name}</h1>
        <p className="text-slate-300">
          Nenhuma categoria disponível no momento.
        </p>
      </div>
    );
  }

  if (status === "finished") {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">
          Votação concluída!
        </h1>
        <p className="text-slate-200">
          Seus votos foram registrados com sucesso. Obrigado por participar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentCategory && (
        <CategoryStep
          category={currentCategory}
          nominees={currentNominees}
          selectedNomineeId={selectedNomineeId}
          onSelectNominee={setSelectedNomineeId}
          onConfirm={handleConfirm}
          isLastCategory={currentIndex === totalSteps - 1}
          stepIndex={currentIndex + 1}
          totalSteps={totalSteps}
        />
      )}

      {status === "error" && (
        <p className="text-sm text-red-400">
          {errorMessage ?? "Não foi possível registrar seu voto."}
        </p>
      )}
    </div>
  );
}
