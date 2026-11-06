import React from "react";
import useHealth from "../hooks/useHealth";
import { formatUptime } from "../utils/format";

export default function StatusLight() {
  const { state, uptime, checkedAt, checkNow } = useHealth();

  let label = "CHECKING...";
  let mutedText = "";

  if (state === "online") {
    label = "SERVER ONLINE";
    mutedText = `Database connected · Up for ${formatUptime(uptime)} · Checked ${checkedAt || ""}`;
  } else if (state === "degraded") {
    label = "DATABASE DOWN";
    mutedText = `Server is up but the database is not connected · Checked ${checkedAt || ""}`;
  } else if (state === "offline") {
    label = "SERVER OFFLINE";
    mutedText = `Cannot reach the backend on port 5000 · Checked ${checkedAt || ""}`;
  }

  const showRetry = state === "offline" || state === "degraded";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "flex-start",
      }}
    >
      {/* White Chip */}
      <div
        role="status"
        aria-live="polite"
        title={mutedText || "Checking server status..."}
        className="status-light-chip"
        style={{
          backgroundColor: "var(--white)",
          border: "3px solid var(--ink)",
          borderRadius: "999px",
          height: "40px",
          padding: "0 14px",
          boxShadow: "3px 3px 0 var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          position: "relative",
          userSelect: "none",
        }}
      >
        {/* 16px Light Circle */}
        <div
          aria-hidden="true"
          className={`status-light-indicator ${state}`}
        />

        {/* The Label */}
        <span
          style={{
            fontFamily: "var(--font)",
            fontWeight: 800,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--ink)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>

        {/* Retry Button */}
        {showRetry && (
          <button
            type="button"
            onClick={checkNow}
            className="status-light-retry-btn"
            style={{
              marginLeft: "4px",
              backgroundColor: "var(--white)",
              color: "var(--ink)",
              border: "2px solid var(--ink)",
              borderRadius: "999px",
              padding: "2px 10px",
              fontFamily: "var(--font)",
              fontWeight: 800,
              fontSize: "11px",
              letterSpacing: "0.05em",
              cursor: "pointer",
              boxShadow: "2px 2px 0 var(--ink)",
              transition: "transform var(--ease), box-shadow var(--ease)",
            }}
          >
            RETRY
          </button>
        )}
      </div>

      {/* Muted Subline */}
      {mutedText && (
        <div
          style={{
            fontFamily: "var(--font)",
            fontWeight: 600,
            fontSize: "13px",
            color: "var(--ink-70)",
            lineHeight: 1.4,
            paddingLeft: "4px",
          }}
        >
          {mutedText}
        </div>
      )}

      <style>{`
        .status-light-indicator {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid var(--ink);
          position: relative;
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .status-light-indicator.online {
          background-color: var(--light-green);
        }
        .status-light-indicator.degraded,
        .status-light-indicator.offline {
          background-color: var(--red);
        }
        .status-light-indicator.checking {
          background-color: var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .status-light-indicator.checking::before {
          content: "";
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: var(--ink);
        }
        .status-light-indicator.online::after,
        .status-light-indicator.degraded::after,
        .status-light-indicator.offline::after {
          content: "";
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 50%;
          box-sizing: content-box;
        }
        .status-light-indicator.online::after {
          border: 3px solid var(--light-green);
          animation: statusPulseOnline 1.6s infinite ease-out;
        }
        .status-light-indicator.degraded::after,
        .status-light-indicator.offline::after {
          border: 3px solid var(--red);
          animation: statusPulseAlert 1.0s infinite ease-out;
        }
        @keyframes statusPulseOnline {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
        @keyframes statusPulseAlert {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .status-light-indicator::after {
            animation: none !important;
            display: none !important;
          }
        }
        .status-light-retry-btn:active {
          transform: translate(1px, 1px);
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}

