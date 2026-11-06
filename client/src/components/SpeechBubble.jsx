import React from "react";

export default function SpeechBubble({
  tail = "center",
  children,
  className = "",
  style = {},
}) {
  const tailPositionStyle =
    tail === "left"
      ? { left: "36px" }
      : tail === "right"
      ? { right: "36px" }
      : { left: "50%", transform: "translateX(-50%)" };

  return (
    <div
      className={`speech-bubble ${className}`}
      style={{
        position: "relative",
        background: "var(--white)",
        border: "3px solid var(--ink)",
        borderRadius: "var(--radius-bubble)",
        boxShadow: "4px 4px 0 var(--ink)",
        padding: "20px 24px",
        fontFamily: "var(--font)",
        fontSize: "16px",
        fontWeight: 600,
        color: "var(--ink)",
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
      {/* Downward pointing triangular tail */}
      <div
        style={{
          position: "absolute",
          bottom: "-15px",
          width: "24px",
          height: "16px",
          ...tailPositionStyle,
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 16"
          width="24"
          height="16"
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Triangular pointer */}
          <polygon
            points="0,0 12,14 24,0"
            fill="#ffffff"
            stroke="var(--ink)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* White mask over top line so it flows cleanly out of the bubble */}
          <line
            x1="1"
            y1="0"
            x2="23"
            y2="0"
            stroke="#ffffff"
            strokeWidth="4"
          />
        </svg>
      </div>
    </div>
  );
}

