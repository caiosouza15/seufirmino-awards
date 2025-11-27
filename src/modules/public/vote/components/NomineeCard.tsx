import { NeonCard } from "../../../../components/neon/NeonCard";
import type { Nominee } from "../../../../types/domain";

export type NomineeCardProps = {
  nominee: Nominee;
  selected: boolean;
  onSelect: () => void;
};

export function NomineeCard({ nominee, selected, onSelect }: NomineeCardProps) {
  return (
    <NeonCard
      selected={selected}
      onClick={onSelect}
      imageUrl={nominee.image_url ?? null}
      title={nominee.name}
      subtitle={nominee.description ?? null}
    />
  );
}
