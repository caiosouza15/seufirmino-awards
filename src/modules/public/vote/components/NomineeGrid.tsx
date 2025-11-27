import type { Nominee } from "../../../../types/domain";
import { NomineeCard } from "./NomineeCard";

export type NomineeGridProps = {
  nominees: Nominee[];
  selectedNomineeId?: string | null;
  onSelectNominee: (nomineeId: string) => void;
};

export function NomineeGrid({
  nominees,
  selectedNomineeId,
  onSelectNominee,
}: NomineeGridProps) {
  if (nominees.length === 0) {
    return (
      <div className="rounded-2xl border border-violet-500/40 bg-slate-900/60 p-4 text-center text-sm text-slate-300">
        Nenhum indicado disponível nesta categoria.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {nominees.map((nominee) => (
        <NomineeCard
          key={nominee.id}
          nominee={nominee}
          selected={selectedNomineeId === nominee.id}
          onSelect={() => onSelectNominee(nominee.id)}
        />
      ))}
    </div>
  );
}
