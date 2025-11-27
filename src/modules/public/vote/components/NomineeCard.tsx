import type { Nominee } from "../../../../types/domain";

export type NomineeCardProps = {
  nominee: Nominee;
  selected: boolean;
  onSelect: () => void;
};

export function NomineeCard({ nominee, selected, onSelect }: NomineeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "relative flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all",
        "bg-slate-900/70 border-violet-500/40 hover:border-violet-300/70 hover:shadow-[0_0_12px_rgba(139,92,246,0.35)]",
        selected
          ? "border-violet-300 shadow-[0_0_16px_rgba(139,92,246,0.6)]"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {nominee.image_url && (
        <img
          src={nominee.image_url}
          alt={nominee.name}
          className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-[0_0_12px_rgba(34,211,238,0.35)]"
        />
      )}

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-base font-semibold text-slate-50">
          {nominee.name}
        </p>
        {nominee.description && (
          <p className="text-xs text-slate-400 line-clamp-2">
            {nominee.description}
          </p>
        )}
      </div>

      {selected && (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-cyan-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
          Selecionado
        </span>
      )}
    </button>
  );
}
