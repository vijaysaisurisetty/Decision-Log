import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorMessage({
  message = "Something went wrong loading this data.",
  onRetry,
}) {
  return (
    <div
      className="panel"
      style={{
        backgroundColor: "var(--white)",
        border: "3px solid var(--ink)",
        borderLeft: "6px solid var(--red)",
        boxShadow: "6px 6px 0 var(--ink)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        margin: "20px 0",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Red square tile with alert icon */}
        <span
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "var(--red)",
            border: "2px solid var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={18} strokeWidth={3} />
        </span>

        {/* Message */}
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          {message}
        </span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-ink btn-sm press"
        >
          <RefreshCw size={14} strokeWidth={3} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
