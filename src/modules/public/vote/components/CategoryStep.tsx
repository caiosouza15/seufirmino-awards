import type { Category, Nominee } from "../../../../types/domain";
import { NeonButton } from "../../../../components/neon/NeonButton";
import { NomineeGrid } from "./NomineeGrid";
import { VoteProgressBar } from "./VoteProgressBar";

export type CategoryStepProps = {
  category: Category;
  nominees: Nominee[];
  selectedNomineeId?: string | null;
  onSelectNominee: (nomineeId: string) => void;
  onConfirm: () => void;
  isLastCategory: boolean;
  stepIndex: number;
  totalSteps: number;
};

export function CategoryStep({
  category,
  nominees,
  selectedNomineeId,
  onSelectNominee,
  onConfirm,
  isLastCategory,
  stepIndex,
  totalSteps,
}: CategoryStepProps) {
  return (
    <div className="mx-auto max-w-xl space-y-6 overflow-hidden rounded-3xl border border-violet-500/40 bg-slate-900/70 p-6 shadow-[0_0_18px_rgba(139,92,246,0.25)] md:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
          Quarteto Awards
        </p>
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          {category.name}
        </h2>
        {category.description && (
          <p className="text-sm text-slate-300">{category.description}</p>
        )}
      </div>

      <VoteProgressBar current={stepIndex} total={totalSteps} />

      <NomineeGrid
        nominees={nominees}
        selectedNomineeId={selectedNomineeId}
        onSelectNominee={onSelectNominee}
      />

      <div className="space-y-3">
        <p className="text-sm text-slate-300">
          Escolha 1 opção para continuar.
        </p>
        <NeonButton
          fullWidth
          variant="primary"
          size="lg"
          disabled={!selectedNomineeId}
          onClick={onConfirm}
        >
          {isLastCategory
            ? "Confirmar e finalizar votação"
            : "Confirmar e ir para a próxima"}
        </NeonButton>
      </div>
    </div>
  );
}
