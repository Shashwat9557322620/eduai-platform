"use client";
import { cn } from "../../../lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  // Use skeleton-base for the new shimmer sweep animation from globals.css
  const baseClasses = "skeleton-base";

  const variantClasses: Record<string, string> = {
    text: "h-4 rounded-lg",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    rounded: "rounded-2xl",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)} style={{ width }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses[variant])}
            style={{
              height: height || 16,
              width: i === lines - 1 ? "70%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// Pre-built skeleton layouts
// ═══════════════════════════════════════════════════════════════════
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-3xl border border-white/[0.06] bg-[#07070a]", className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={14} />
          <Skeleton variant="text" width="40%" height={10} className="mt-2" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="mt-6 pt-4 border-t border-white/[0.04]">
        <Skeleton variant="rounded" width="100%" height={40} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-4 pb-3 border-b border-white/[0.04]">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="text" width={i === 1 ? "20%" : "15%"} height={10} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton variant="text" width="20%" height={14} />
          <Skeleton variant="text" width="30%" height={14} />
          <Skeleton variant="text" width="15%" height={14} />
          <Skeleton variant="text" width="10%" height={14} />
        </div>
      ))}
    </div>
  );
}


export function SkeletonStatBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "skeleton-base rounded-2xl p-5 space-y-3",
        className
      )}
      aria-hidden="true"
      style={{ minHeight: 110 }}
    >
      <div className="flex items-center gap-3">
        <div className="skeleton-base w-9 h-9 rounded-xl shrink-0" />
        <div className="skeleton-base h-2.5 rounded-lg w-20" />
      </div>
      <div className="skeleton-base h-8 rounded-xl w-16" />
    </div>
  );
}

export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)} role="status" aria-label="Loading dashboard...">
      {/* Header */}
      <div>
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="25%" height={14} className="mt-3" />
      </div>

      {/* Stats row — 4 columns matching actual dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatBlock key={i} />
        ))}
      </div>

      {/* Two column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="rounded" height={200} className="rounded-3xl" />
        <Skeleton variant="rounded" height={200} className="rounded-3xl" />
      </div>

      {/* Table */}
      <SkeletonTable rows={4} />
    </div>
  );
}

