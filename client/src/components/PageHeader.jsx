import React from "react";
import Halftone from "./Halftone";

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className = "",
}) {
  return (
    <section
      className={`page-header ${className}`}
      style={{
        position: "relative",
        backgroundColor: "var(--yellow)",
        borderBottom: "3px solid var(--ink)",
        padding: "36px 0 28px",
        overflow: "hidden",
      }}
    >
      {/* Top-Right Red Halftone Screen */}
      <Halftone
        color="red"
        size={16}
        alpha={0.35}
        style={{
          top: 0,
          right: 0,
          width: "260px",
          height: "120px",
          borderBottomLeftRadius: "32px",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div style={{ maxWidth: "720px" }}>
            {eyebrow && (
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "var(--white)",
                  border: "2px solid var(--ink)",
                  boxShadow: "2px 2px 0 var(--ink)",
                  padding: "3px 12px",
                  fontSize: "12px",
                  fontFamily: "var(--font-display)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  transform: "rotate(-1.5deg)",
                  marginBottom: "10px",
                }}
              >
                {eyebrow}
              </div>
            )}

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 4.5vw, 44px)",
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                margin: "4px 0 8px",
                textTransform: "uppercase",
              }}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--ink-70)",
                  maxWidth: "600px",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

