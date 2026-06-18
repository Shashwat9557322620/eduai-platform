"use client";
import { useState, useCallback, useEffect, createContext, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  loading: (title: string, description?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const typeColors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)", icon: "text-emerald-400" },
  error: { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)", icon: "text-red-400" },
  warning: { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)", icon: "text-amber-400" },
  info: { bg: "rgba(34, 211, 238, 0.08)", border: "rgba(34, 211, 238, 0.2)", icon: "text-cyan-400" },
  loading: { bg: "rgba(168, 85, 247, 0.08)", border: "rgba(168, 85, 247, 0.2)", icon: "text-purple-400" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const colors = typeColors[toast.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    if (toast.type === "loading") return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>),
    error: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
    warning: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>),
    info: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    loading: (<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>),
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "relative flex items-start gap-3 w-[380px] max-w-[calc(100vw-2rem)] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 overflow-hidden",
        visible && !exiting ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
      )}
      style={{
        background: colors.bg,
        borderColor: colors.border,
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px ${colors.border}`,
      }}
    >
      <div className={cn("mt-0.5 shrink-0", colors.icon)}>{iconMap[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{toast.title}</p>
        {toast.description && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{toast.description}</p>}
      </div>
      {toast.dismissible !== false && toast.type !== "loading" && (
        <button onClick={handleClose} className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="Dismiss notification">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
      {toast.type !== "loading" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <div className="h-full rounded-full" style={{ background: colors.border, animation: `toast-progress ${toast.duration || 4000}ms linear forwards`, width: "100%" }} />
        </div>
      )}
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || toasts.length === 0) return null;
  return createPortal(
    <div aria-label="Notifications" className="fixed top-24 right-6 z-[600] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const success = useCallback((title: string, description?: string) => addToast({ type: "success", title, description }), [addToast]);
  const error = useCallback((title: string, description?: string) => addToast({ type: "error", title, description }), [addToast]);
  const warning = useCallback((title: string, description?: string) => addToast({ type: "warning", title, description }), [addToast]);
  const info = useCallback((title: string, description?: string) => addToast({ type: "info", title, description }), [addToast]);
  const loading = useCallback((title: string, description?: string) => addToast({ type: "loading", title, description, dismissible: false }), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info, loading }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
