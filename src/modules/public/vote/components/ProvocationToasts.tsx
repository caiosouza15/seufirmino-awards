import { useEffect } from "react";

export type ProvocationToast = {
  id: string;
  author: string;
  message: string;
  accentClass?: string;
};

type ProvocationToastsProps = {
  toasts: ProvocationToast[];
  onDismiss: (id: string) => void;
};

export function ProvocationToasts({ toasts, onDismiss }: ProvocationToastsProps) {
  useEffect(() => {
    // Auto-dismiss each toast after 6s.
    const timers = toasts.map((toast) =>
      window.setTimeout(() => onDismiss(toast.id), 6000)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-lg backdrop-blur"
        >
          <div
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-slate-900",
              toast.accentClass ?? "bg-cyan-300",
            ].join(" ")}
          >
            {toast.author.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-300">
              {toast.author} te provocou
            </p>
            <p className="text-sm font-semibold text-white">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-xs font-semibold text-slate-300 hover:text-white"
          >
            Fechar
          </button>
        </div>
      ))}
    </div>
  );
}
