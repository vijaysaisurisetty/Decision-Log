import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 480,
  ariaLabelledBy = "modal-title",
}) {
  const panelRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = "hidden";

      // Focus first focusable element or panel
      setTimeout(() => {
        if (panelRef.current) {
          const focusable = panelRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            panelRef.current.focus();
          }
        }
      }, 50);
    } else {
      document.body.style.overflow = "";
      if (previousFocus.current && previousFocus.current.focus) {
        previousFocus.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal-root") || document.body;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Backdrop: Ink at 55% opacity with faint white 16px dot screen (NO blur) */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(15, 13, 10, 0.55)",
          backgroundImage: "var(--dot-white)",
          backgroundSize: "16px 16px",
          opacity: 1,
        }}
        aria-hidden="true"
      />

      {/* Pop-Art Comic Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className="panel pop-modal-panel"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: `${maxWidth}px`,
          backgroundColor: "var(--white)",
          border: "3px solid var(--ink)",
          borderRadius: "var(--radius-panel)",
          boxShadow: "8px 8px 0 var(--ink)",
          padding: "24px",
          outline: "none",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header with Title & Close button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            borderBottom: "2px dashed var(--ink-30)",
            paddingBottom: "12px",
          }}
        >
          {title && (
            <h2
              id={ariaLabelledBy}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="press"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "4px",
              border: "2px solid var(--ink)",
              backgroundColor: "var(--paper)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginLeft: "auto",
              "--sh": "3px",
            }}
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Modal Body */}
        {children}
      </div>

      <style>{`
        .pop-modal-panel {
          animation: popModalIn 140ms ease-out forwards;
        }
        @keyframes popModalIn {
          0% {
            transform: scale(0.94);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .pop-modal-panel {
            animation: none !important;
          }
        }
      `}</style>
    </div>,
    modalRoot
  );
}
