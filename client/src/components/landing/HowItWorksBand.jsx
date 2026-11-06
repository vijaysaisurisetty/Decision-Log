import React from "react";
import CornerChip from "../CornerChip";
import CalendarCard from "../CalendarCard";
import FlagPill from "../FlagPill";
import { Check } from "lucide-react";

export default function HowItWorksBand() {
  return (
    <section
      style={{
        backgroundColor: "var(--white)",
        borderBottom: "3px solid var(--ink)",
        padding: "80px 0",
      }}
    >
      <div className="container" style={{ textAlign: "center" }}>
        {/* Rotated yellow eyebrow chip */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: "var(--yellow)",
            border: "2px solid var(--ink)",
            boxShadow: "2px 2px 0 var(--ink)",
            padding: "4px 14px",
            fontFamily: "var(--font-display)",
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transform: "rotate(2deg)",
            marginBottom: "14px",
          }}
        >
          HOW IT WORKS
        </div>

        {/* Big display title */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 56px)",
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: "48px",
          }}
        >
          IN THREE PANELS
        </h2>

        {/* 3-column grid of comic panels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
            textAlign: "left",
          }}
        >
          {/* Panel 01: LOG IT */}
          <div
            className="panel"
            style={{
              padding: "36px 24px 28px",
              backgroundColor: "var(--white)",
              position: "relative",
            }}
          >
            <CornerChip text="01" color="red" rotation={-2} />

            {/* Mini Mock in Paper Inset */}
            <div
              style={{
                backgroundColor: "var(--paper)",
                border: "2px solid var(--ink)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                minHeight: "140px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  height: "28px",
                  backgroundColor: "#ffffff",
                  border: "2px solid var(--ink)",
                  borderRadius: "4px",
                  padding: "0 8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  color: "var(--ink)",
                }}
              >
                Database Selection for V2
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span
                  style={{
                    backgroundColor: "var(--yellow)",
                    border: "2px solid var(--ink)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                  MongoDB (Chosen)
                </span>
                <span
                  style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid var(--ink)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "var(--ink-70)",
                  }}
                >
                  PostgreSQL
                </span>
              </div>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                marginBottom: "8px",
                color: "var(--ink)",
              }}
            >
              LOG IT
            </h3>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--ink-70)",
                lineHeight: 1.5,
              }}
            >
              Document the context, every option weighed with pros and cons, and
              the exact reason for your choice.
            </p>
          </div>

          {/* Panel 02: LINK IT */}
          <div
            className="panel"
            style={{
              padding: "36px 24px 28px",
              backgroundColor: "var(--white)",
              position: "relative",
            }}
          >
            <CornerChip text="02" color="blue" rotation={-1} />

            {/* Mini Mock in Paper Inset */}
            <div
              style={{
                backgroundColor: "var(--paper)",
                border: "2px solid var(--ink)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                minHeight: "140px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {["Set up Mongoose models", "Migrate existing collections"].map(
                (task, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: "var(--ink)" }}>{task}</span>
                    <span
                      className="pill pill-yellow"
                      style={{ height: "18px", fontSize: "10px", padding: "0 6px" }}
                    >
                      In Progress
                    </span>
                  </div>
                )
              )}
              <div
                style={{
                  borderTop: "1px dashed var(--ink-30)",
                  paddingTop: "6px",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--blue)",
                }}
              >
                1 decision ➔ 3 tasks linked
              </div>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                marginBottom: "8px",
                color: "var(--ink)",
              }}
            >
              LINK IT
            </h3>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--ink-70)",
                lineHeight: 1.5,
              }}
            >
              Connect real sprint tasks directly to the decision so developers
              building the features know the reasoning.
            </p>
          </div>

          {/* Panel 03: REVIEW IT */}
          <div
            className="panel"
            style={{
              padding: "36px 24px 28px",
              backgroundColor: "var(--white)",
              position: "relative",
            }}
          >
            <CornerChip text="03" color="ink" rotation={1.5} />

            {/* Mini Mock in Paper Inset */}
            <div
              style={{
                backgroundColor: "var(--paper)",
                border: "2px solid var(--ink)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                minHeight: "140px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <CalendarCard
                date={new Date(Date.now() - 3 * 86400000).toISOString()}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <FlagPill flagReason="Review overdue" />
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "var(--red)",
                  }}
                >
                  3 days overdue
                </span>
              </div>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                marginBottom: "8px",
                color: "var(--ink)",
              }}
            >
              REVIEW IT
            </h3>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--ink-70)",
                lineHeight: 1.5,
              }}
            >
              Automated review dates flag decisions that may be stale or due
              for architectural reconsideration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

