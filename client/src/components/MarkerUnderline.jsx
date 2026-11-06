import React from "react";

export default function MarkerUnderline({ children, className = "" }) {
  return (
    <span
      className={`marker-underline-wrapper ${className}`}
      style={{
        position: "relative",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: "-2%",
          right: "-2%",
          bottom: "-6px",
          width: "104%",
          height: "14px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <path
          d="M 2,8 Q 30,3 55,7 T 98,6"
          stroke="var(--red)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

