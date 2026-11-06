import React from "react";

export default function CalendarCard({
  date,
  size = "md",
  className = "",
  style = {},
}) {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const monthNames = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const dayNames = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const month = monthNames[d.getUTCMonth()];
  const dayNum = d.getUTCDate();
  const weekday = dayNames[d.getUTCDay()];

  // Calculate days until review from today midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  let stripBg = "var(--ink)";
  let stripColor = "#ffffff";
  if (diffDays < 0) {
    stripBg = "var(--red)";
    stripColor = "#ffffff";
  } else if (diffDays <= 14) {
    stripBg = "var(--yellow)";
    stripColor = "var(--ink)";
  }

  const isLg = size === "lg";
  const width = isLg ? 56 : 44;
  const height = isLg ? 66 : 52;
  const stripHeight = isLg ? 20 : 16;
  const numFontSize = isLg ? 22 : 18;
  const weekFontSize = isLg ? 9 : 8;

  return (
    <div
      className={`calendar-card ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "6px",
        border: "3px solid var(--ink)",
        boxShadow: "3px 3px 0 var(--ink)",
        overflow: "hidden",
        backgroundColor: "var(--white)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        userSelect: "none",
        ...style,
      }}
      aria-label={`Date: ${d.toLocaleDateString()}`}
    >
      {/* Top Month Strip */}
      <div
        style={{
          height: `${stripHeight}px`,
          backgroundColor: stripBg,
          color: stripColor,
          fontFamily: "var(--font-display)",
          fontSize: isLg ? "11px" : "9px",
          letterSpacing: "0.08em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textTransform: "uppercase",
          borderBottom: "2px solid var(--ink)",
          lineHeight: 1,
        }}
      >
        {month}
      </div>

      {/* Bottom Day Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          padding: "2px 0",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: `${numFontSize}px`,
            color: "var(--ink)",
            lineHeight: 1,
          }}
        >
          {dayNum}
        </span>
        <span
          style={{
            fontFamily: "var(--font)",
            fontSize: `${weekFontSize}px`,
            fontWeight: 800,
            color: "var(--ink-70)",
            letterSpacing: "0.05em",
            marginTop: "1px",
          }}
        >
          {weekday}
        </span>
      </div>
    </div>
  );
}
