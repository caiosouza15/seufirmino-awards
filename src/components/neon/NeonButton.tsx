import type { ButtonHTMLAttributes, ReactNode } from "react";

export type NeonButtonVariant = "primary" | "secondary" | "ghost";
export type NeonButtonSize = "sm" | "md" | "lg";

export type NeonButtonProps = {
  variant?: NeonButtonVariant;
  size?: NeonButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

const variantClasses: Record<NeonButtonVariant, string> = {
  primary:
    "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_18px_rgba(139,92,246,0.75)]",
  secondary:
    "bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-[0_0_18px_rgba(34,211,238,0.75)]",
  ghost:
    "bg-transparent border border-violet-500 text-violet-200 hover:bg-violet-500/10 shadow-[0_0_12px_rgba(139,92,246,0.6)]",
};

const sizeClasses: Record<NeonButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-5 py-3 text-lg",
};

export function NeonButton({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  type = "button",
}: NeonButtonProps) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-400 focus:ring-offset-slate-900",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-60 cursor-not-allowed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
}
