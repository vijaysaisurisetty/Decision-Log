import React from "react";
import CornerChip from "./CornerChip";
import Halftone from "./Halftone";
import { PROJECT } from "../config/project";

export default function ProjectCredit() {
  const rows = [
    { label: "CREATED BY", value: PROJECT.createdBy },
    { label: "USN", value: PROJECT.usn, isUsn: true },
    { label: "INSTRUCTOR", value: PROJECT.instructor },
  ];

  return (
    <div
      className="panel"
      style={{
        backgroundColor: "var(--white)",
        border: "3px solid var(--ink)",
        borderRadius: "12px",
        boxShadow: "6px 6px 0 var(--ink)",
        padding: "24px",
        position: "relative",
        overflow: "visible",
        marginTop: "14px",
      }}
    >
      {/* Rotated CornerChip hanging off top-left */}
      <CornerChip
        text="BACKEND PROJECT"
        color="red"
        rotation={-1.5}
      />

      {/* Small red 8px halftone dot screen in top-right corner */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "110px",
          height: "90px",
          overflow: "hidden",
          borderTopRightRadius: "9px",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <Halftone
          color="red"
          size={8}
          alpha={0.4}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "110px",
            height: "90px",
            borderBottomLeftRadius: "24px",
          }}
        />
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(22px, 3vw, 26px)",
          textTransform: "uppercase",
          lineHeight: 1.15,
          color: "var(--ink)",
          marginBottom: "16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {PROJECT.title}
      </h3>

      {/* 3-Row Detail List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        {rows.map((row, idx) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom:
                idx < rows.length - 1
                  ? "2px dashed var(--ink-30)"
                  : "none",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font)",
                fontWeight: 800,
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-70)",
                flexShrink: 0,
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font)",
                fontWeight: 800,
                fontSize: "16px",
                color: "var(--ink)",
                textAlign: "right",
                fontVariantNumeric: row.isUsn ? "tabular-nums" : "normal",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

