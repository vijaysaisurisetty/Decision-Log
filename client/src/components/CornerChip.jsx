import React from "react";

export default function CornerChip({
  text = "01",
  color = "red",
  rotation = -2,
  className = "",
  style = {},
}) {
  const bg =
    color === "blue"
      ? "var(--blue)"
      : color === "ink"
      ? "var(--ink)"
      : color === "yellow"
      ? "var(--yellow)"
      : "var(--red)";

  const textColor = color === "yellow" ? "var(--ink)" : "#ffffff";

  return (
    <div
      className={`corner-chip ${className}`}
      style={{
        position: "absolute",
        top: "-12px",
        left: "16px",
        height: "26px",
        padding: "0 10px",
        backgroundColor: bg,
        color: textColor,
        border: "2px solid var(--ink)",
        boxShadow: "2px 2px 0 var(--ink)",
        fontFamily: "var(--font-display)",
        fontSize: "12px",
        lineHeight: "22px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        zIndex: 2,
        userSelect: "none",
        whiteSpace: "nowrap",
        overflow: "visible",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {text}
    </div>
  );
}

