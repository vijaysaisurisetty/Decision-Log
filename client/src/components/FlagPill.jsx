import React from "react";

export default function FlagPill({ flagReason, className = "" }) {
  return (
    <>
      <span
        className={`pill pill-red ${className}`}
        title={flagReason || "Needs Reconsideration"}
        style={{ cursor: flagReason ? "help" : "default" }}
      >
        <span
          className="pill-dot blinking-dot"
          style={{
            backgroundColor: "#ffffff",
          }}
        />
        <span>NEEDS RECONSIDERATION</span>
      </span>

      <style>{`
        .blinking-dot {
          animation: popBlink 1s infinite alternate;
        }
        @keyframes popBlink {
          0% { opacity: 0.2; }
          100% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .blinking-dot {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </>
  );
}
