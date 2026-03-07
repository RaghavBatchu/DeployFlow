import React, { useEffect } from "react";
import { useToast, Toast as ToastType } from "../contexts/ToastContext";

const ToastItem: React.FC<{
  toast: ToastType;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const bg =
    toast.type === "error"
      ? "bg-rose-500"
      : toast.type === "info"
        ? "bg-blue-500"
        : "bg-emerald-500";

  return (
    <div
      className={`${bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-4 min-w-[280px] max-w-md animate-fadeIn`}
      role="alert"
    >
      <span className="font-medium text-sm">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-white/90 hover:text-white shrink-0 p-1"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
