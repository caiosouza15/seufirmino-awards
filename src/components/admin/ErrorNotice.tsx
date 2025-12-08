import { useState } from "react";

type ErrorNoticeProps = {
  title?: string;
  description?: string;
  details?: string | null;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorNotice({
  title = "Erro",
  description,
  details,
  actionLabel,
  onAction,
}: ErrorNoticeProps) {
  const shouldRenderDetails = Boolean(details);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-2 rounded-lg border border-red-500/50 bg-red-900/30 p-4 text-red-100">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          {description && <p className="text-sm text-red-100/90">{description}</p>}
        </div>
        <div className="flex gap-2">
          {shouldRenderDetails && (
            <button
              onClick={() => setShowDetails((prev) => !prev)}
              className="rounded-lg border border-red-400/60 px-3 py-1 text-xs font-semibold text-red-50 hover:bg-red-500/10"
            >
              {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
          )}
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="rounded-lg border border-red-400/60 px-3 py-1 text-xs font-semibold text-red-50 hover:bg-red-500/10"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
      {shouldRenderDetails && showDetails && (
        <pre className="max-h-48 overflow-auto rounded bg-black/30 p-3 text-xs text-red-200">
          {details}
        </pre>
      )}
    </div>
  );
}
