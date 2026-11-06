import React from "react";

export default function Halftone({
  color = "red",
  size = 16,
  alpha = 0.4,
  className = "",
  style = {},
}) {
  const dotVar =
    color === "ink"
      ? "var(--dot-ink)"
      : color === "white"
      ? "var(--dot-white)"
      : "var(--dot-red)";

  return (
    <div
      className={`halftone ${className}`}
      aria-hidden="true"
      style={{
        "--dot": dotVar,
        "--size": `${size}px`,
        "--alpha": alpha,
        ...style,
      }}
    />
  );
}

