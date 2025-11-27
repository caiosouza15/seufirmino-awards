import type { ReactNode } from "react";

export type NeonCardProps = {
  selected?: boolean;
  onClick?: () => void;
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  children?: ReactNode;
};

export function NeonCard({
  selected = false,
  onClick,
  imageUrl,
  title,
  subtitle,
  children,
}: NeonCardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "rounded-xl bg-slate-900/70 border border-violet-500/60 transition-all",
        "shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]",
        selected ? "ring-2 ring-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.8)]" : "",
        onClick ? "cursor-pointer" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {imageUrl && (
        <div className="h-40 w-full overflow-hidden rounded-t-xl bg-slate-800">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div>
          <p className="text-lg font-semibold text-white">{title}</p>
          {subtitle && <p className="text-sm text-slate-300">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
