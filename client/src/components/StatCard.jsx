import React from "react";
import { Link } from "react-router-dom";
import CornerChip from "./CornerChip";

export default function StatCard({
  title,
  value,
  to,
  code = "01",
  color = "ink",
}) {
  return (
    <Link
      to={to}
      className="panel press"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "36px 20px 24px",
        minHeight: "140px",
        textDecoration: "none",
        color: "var(--ink)",
        position: "relative",
        "--sh": "6px",
      }}
    >
      {/* Corner Chip */}
      <CornerChip text={code} color={color} rotation={-2} />

      {/* Big Number */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(40px, 4.5vw, 60px)",
          lineHeight: 1,
          color: "var(--ink)",
          marginBottom: "8px",
        }}
      >
        {value !== undefined && value !== null ? value : "--"}
      </div>

      {/* Tracked-caps label */}
      <div
        style={{
          fontFamily: "var(--font)",
          fontWeight: 800,
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-70)",
        }}
      >
        {title}
      </div>
    </Link>
  );
}
