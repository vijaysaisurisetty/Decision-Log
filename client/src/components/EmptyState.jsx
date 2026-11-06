import React from "react";
import { HelpCircle } from "lucide-react";
import Halftone from "./Halftone";

export default function EmptyState({
  icon: Icon = HelpCircle,
  title = "NOTHING FOUND",
  message = "There are no records to display here yet.",
  action,
}) {
  return (
    <div
      className="panel"
      style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--white)",
        margin: "24px 0",
      }}
    >
      {/* 96px circle filled with red 8px halftone and 3px ink border */}
      <div
        style={{
          width: "96px",
          height: "96px",
          borderRadius: "50%",
          border: "3px solid var(--ink)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          backgroundColor: "var(--paper)",
        }}
      >
        <Halftone
          color="red"
          size={8}
          alpha={0.45}
          style={{ inset: 0, width: "100%", height: "100%" }}
        />

        {/* Ink lucide icon on a white 48px circle in the middle */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "var(--white)",
            border: "2px solid var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink)",
          }}
        >
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      {/* Archivo Black title */}
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "24px",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          color: "var(--ink)",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>

      {/* Short sentence */}
      <p
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--ink-70)",
          maxWidth: "460px",
          marginBottom: action ? "24px" : "0",
        }}
      >
        {message}
      </p>

      {/* CTA Button */}
      {action && <div>{action}</div>}
    </div>
  );
}
