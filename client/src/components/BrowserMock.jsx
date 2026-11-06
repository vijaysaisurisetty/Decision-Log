import React from "react";

export default function BrowserMock({
  url = "decisionlog.app/decisions",
  children,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`browser-mock ${className}`}
      style={{
        background: "var(--white)",
        border: "3px solid var(--ink)",
        borderRadius: "var(--radius-panel)",
        boxShadow: "6px 6px 0 var(--ink)",
        overflow: "hidden",
        width: "100%",
        ...style,
      }}
    >
      {/* Top Chrome Bar */}
      <div
        style={{
          background: "var(--paper)",
          borderBottom: "3px solid var(--ink)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* 3 Circular Window Buttons: Red, Yellow, Blue */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "var(--red)",
              border: "2px solid var(--ink)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "var(--yellow)",
              border: "2px solid var(--ink)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "var(--blue)",
              border: "2px solid var(--ink)",
              display: "inline-block",
            }}
          />
        </div>

        {/* Pill URL Field */}
        <div
          style={{
            flex: 1,
            maxWidth: "320px",
            background: "#ffffff",
            border: "2px solid var(--ink)",
            borderRadius: "var(--radius-pill)",
            padding: "3px 14px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--ink-70)",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {url}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

