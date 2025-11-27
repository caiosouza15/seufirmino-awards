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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
        {category.description && (
          <p className="text-slate-300">{category.description}</p>
        )}
      </div>

      <VoteProgressBar current={stepIndex} total={totalSteps} />

      <NomineeGrid
        nominees={nominees}
        selectedNomineeId={selectedNomineeId}
        onSelectNominee={onSelectNominee}
      />

      <NeonButton
        fullWidth
        variant="primary"
        disabled={!selectedNomineeId}
        onClick={onConfirm}
      >
        {isLastCategory
          ? "Confirmar e finalizar votação"
          : "Confirmar e ir para a próxima"}
      </NeonButton>
    </div>
  );
}
