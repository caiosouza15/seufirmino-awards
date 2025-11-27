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
  return (
    <div className="grid grid-cols-2 gap-4">
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
