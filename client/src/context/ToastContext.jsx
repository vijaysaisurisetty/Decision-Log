import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast("success", msg), [addToast]);
  const error = useCallback((msg) => addToast("error", msg), [addToast]);
  const info = useCallback((msg) => addToast("info", msg), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, removeToast }}>
      {children}
      <div
        className="toast-container"
        aria-live="polite"
        style={{
          position: "fixed",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <style>{`
        .toast-container {
          top: 80px;
          right: 24px;
        }
        @media (max-width: 650px) {
          .toast-container {
            top: auto;
            bottom: 24px;
            left: 16px;
            right: 16px;
            align-items: center;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      onDismiss();
    }, 4000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  React.useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, []);

  const getTile = () => {
    if (toast.type === "success") {
      return {
        bg: "var(--blue)",
        color: "#ffffff",
        icon: <Check size={16} strokeWidth={3} />,
      };
    }
    if (toast.type === "error") {
      return {
        bg: "var(--red)",
        color: "#ffffff",
        icon: <AlertTriangle size={16} strokeWidth={3} />,
      };
    }
    // info
    return {
      bg: "var(--yellow)",
      color: "var(--ink)",
      icon: <Info size={16} strokeWidth={3} />,
    };
  };

  const tile = getTile();

  return (
    <div
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      style={{
        pointerEvents: "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "var(--white)",
        border: "3px solid var(--ink)",
        borderRadius: "var(--radius-pill)",
        boxShadow: "4px 4px 0 var(--ink)",
        padding: "6px 16px 6px 6px",
        maxWidth: "420px",
        minHeight: "44px",
        boxSizing: "border-box",
      }}
    >
      {/* 28px square icon tile */}
      <span
        style={{
          width: "28px",
          height: "28px",
          backgroundColor: tile.bg,
          color: tile.color,
          border: "2px solid var(--ink)",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {tile.icon}
      </span>

      {/* Bold message */}
      <span
        style={{
          fontFamily: "var(--font)",
          fontWeight: 800,
          fontSize: "14px",
          color: "var(--ink)",
          lineHeight: 1.3,
        }}
      >
        {toast.message}
      </span>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--ink-70)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "auto",
          padding: "2px",
        }}
      >
        <X size={16} strokeWidth={3} />
      </button>
    </div>
  );
};
