import React from "react";

/**
 * Pop-Art Desktop Logo Component for DecisionLog
 * Adheres to 1960s pop-art comic-print design system:
 * Saturated yellow, 3px ink borders, hard offset shadows, Ben-Day halftones, Archivo Black display font.
 */
export default function Logo({
  size = 40,
  variant = "mark", // 'mark' | 'tile' | 'full'
  className = "",
  style = {},
  onClick,
}) {
  // 1. App Tile Variant (Desktop Squircle Icon)
  if (variant === "tile") {
    return (
      <div
        className={`logo-tile ${className}`}
        onClick={onClick}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--yellow)",
          border: "3px solid var(--ink)",
          borderRadius: "16px",
          boxShadow: "4px 4px 0 var(--ink)",
          userSelect: "none",
          flexShrink: 0,
          cursor: onClick ? "pointer" : "default",
          overflow: "visible",
          ...style,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: `${Math.round(size * 0.44)}px`,
            color: "var(--ink)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          DL
        </span>
        {/* Tiny Pop-Art Starburst Accent */}
        <div
          style={{
            position: "absolute",
            top: "-6px",
            right: "-6px",
            width: `${Math.round(size * 0.38)}px`,
            height: `${Math.round(size * 0.38)}px`,
            transform: "rotate(-8deg)",
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <polygon
              points="50,4 58,18 73,12 75,27 90,27 86,41 99,47 89,58 98,69 84,74 88,88 73,87 71,101 58,94 50,104 42,94 29,101 27,87 12,88 16,74 2,69 11,58 1,47 14,41 10,27 25,27 27,12 42,18"
              fill="var(--red)"
              stroke="var(--ink)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  // 2. Full Horizontal Brand Logo
  if (variant === "full") {
    return (
      <div
        className={`logo-full ${className}`}
        onClick={onClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          userSelect: "none",
          cursor: onClick ? "pointer" : "default",
          ...style,
        }}
      >
        {/* Tile Icon */}
        <Logo size={size} variant="tile" />

        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: `${Math.round(size * 0.58)}px`,
              color: "var(--ink)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            DECISIONLOG
          </span>
          <span
            style={{
              fontFamily: "var(--font)",
              fontWeight: 800,
              fontSize: `${Math.max(9, Math.round(size * 0.22))}px`,
              letterSpacing: "0.12em",
              color: "var(--red)",
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            REMEMBER THE WHY
          </span>
        </div>
      </div>
    );
  }

  // 3. Mark Variant (Standard Wordmark + Starburst Badge as used in Navbar)
  return (
    <div
      className={`logo-mark ${className}`}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        userSelect: "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: `${size}px`,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          lineHeight: 1,
        }}
      >
        DECISIONLOG
      </span>
      <div
        style={{
          position: "absolute",
          top: "-8px",
          right: "-14px",
          width: "20px",
          height: "20px",
          transform: "rotate(-8deg)",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <polygon
            points="50,4 58,18 73,12 75,27 90,27 86,41 99,47 89,58 98,69 84,74 88,88 73,87 71,101 58,94 50,104 42,94 29,101 27,87 12,88 16,74 2,69 11,58 1,47 14,41 10,27 25,27 27,12 42,18"
            fill="var(--red)"
            stroke="var(--ink)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

