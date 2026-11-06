import React from "react";

export default function Starburst({
  text = "NEW!",
  color = "red",
  size = 64,
  rotation = -8,
  className = "",
  style = {},
}) {
  const fill =
    color === "yellow"
      ? "var(--yellow)"
      : color === "ink"
      ? "var(--ink)"
      : "var(--red)";

  const textColor =
    color === "yellow" ? "var(--ink)" : "#ffffff";

  // Pre-generate 32-point star polygon (64 vertices) for viewBox 0 0 100 100
  const points = React.useMemo(() => {
    return Array.from({ length: 64 }, (_, i) => {
      const angle = (i * Math.PI) / 32 - Math.PI / 2;
      const r = i % 2 === 0 ? 46 : 37;
      const x = 50 + r * Math.cos(angle);
      const y = 50 + r * Math.sin(angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }, []);

  return (
    <div
      className={`starburst ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
        filter: "drop-shadow(4px 4px 0 var(--ink))",
        flexShrink: 0,
        ...style,
      }}
      aria-hidden={!text ? "true" : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <polygon
          points={points}
          fill={fill}
          stroke="var(--ink)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {text && (
          <text
            x="50"
            y="51"
            textAnchor="middle"
            dominantBaseline="central"
            fill={textColor}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: text.length > 4 ? "15px" : "19px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </text>
        )}
      </svg>
    </div>
  );
}

