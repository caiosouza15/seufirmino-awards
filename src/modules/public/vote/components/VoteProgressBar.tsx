export type VoteProgressBarProps = {
  current: number;
  total: number;
};

export function VoteProgressBar({ current, total }: VoteProgressBarProps) {
  const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-200">
        Categoria {current} de {total}
      </p>
      <div className="h-2 w-full rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-cyan-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
