import React from "react";
import Halftone from "../Halftone";

export default function BuiltWithStrip() {
  return (
    <section
      style={{
        backgroundColor: "var(--paper)",
        borderTop: "3px solid var(--ink)",
        borderBottom: "3px solid var(--ink)",
        padding: "32px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Faint ink 8px dot screen */}
      <Halftone
        color="ink"
        size={8}
        alpha={0.08}
        style={{ inset: 0, width: "100%", height: "100%" }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font)",
            fontWeight: 800,
            fontSize: "12px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-70)",
            marginBottom: "16px",
          }}
        >
          BUILT WITH THE MERN STACK
        </div>

        {/* 4 text-only wordmarks in display face with varied tracking and case */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(20px, 4vw, 48px)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              letterSpacing: "0.08em",
              color: "var(--ink)",
            }}
          >
            REACT
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              letterSpacing: "-0.01em",
              color: "var(--ink)",
            }}
          >
            node.js
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              letterSpacing: "0.12em",
              color: "var(--ink)",
            }}
          >
            EXPRESS
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "23px",
              letterSpacing: "0.02em",
              color: "var(--ink)",
            }}
          >
            MongoDB
          </span>
        </div>
      </div>
    </section>
  );
}

