"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../../lib/utils";

// ═══════════════════════════════════════════════════════════════════
// Design System Button Component
// ═══════════════════════════════════════════════════════════════════

type ButtonVariant = "primary" | "secondary" | "ghost" | "cyan" | "purple" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-white text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:-translate-y-0.5",
  secondary: "bg-white/[0.05] text-white border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12]",
  ghost: "bg-transparent text-white/60 hover:bg-white/[0.05] hover:text-white",
  cyan: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_50px_rgba(34,211,238,0.3)] hover:-translate-y-0.5",
  purple: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] hover:-translate-y-0.5",
  danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-[0_0_50px_rgba(239,68,68,0.3)] hover:-translate-y-0.5",
  success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:-translate-y-0.5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[11px] gap-1.5 rounded-lg",
  md: "h-10 px-5 text-xs gap-2 rounded-xl",
  lg: "h-12 px-6 text-xs gap-2.5 rounded-xl",
  xl: "h-14 px-8 text-sm gap-3 rounded-2xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-bold tracking-[0.05em] uppercase",
          "transition-all duration-300 ease-out cursor-pointer relative overflow-hidden",
          "whitespace-nowrap select-none active:scale-[0.97]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {variant !== "ghost" && variant !== "secondary" && (
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
        )}

        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {children || "Loading..."}
          </span>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children && <span className="relative z-10">{children}</span>}
            {iconRight && <span className="shrink-0 relative z-10">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
