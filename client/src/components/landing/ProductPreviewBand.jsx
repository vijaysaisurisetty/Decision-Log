import React from "react";
import { Check } from "lucide-react";
import BrowserMock from "../BrowserMock";
import Halftone from "../Halftone";

export default function ProductPreviewBand() {
  const checklist = [
    "Context, options and rationale in one place",
    "Review dates flag stale decisions for you",
    "Tasks and decisions linked both ways",
  ];

  return (
    <section
      style={{
        backgroundColor: "var(--paper)",
        borderBottom: "3px solid var(--ink)",
        padding: "80px 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Left Column */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(30px, 4.5vw, 50px)",
                lineHeight: 1.05,
                color: "var(--ink)",
                marginBottom: "20px",
              }}
            >
              NEVER ARGUE THE SAME THING TWICE.
            </h2>
            <p
              style={{
                fontSize: "17px",
                fontWeight: 600,
                color: "var(--ink-70)",
                lineHeight: 1.6,
                marginBottom: "32px",
              }}
            >
              Teams lose months rehashing old decisions whenever a new member
              joins or a sprint changes direction. DecisionLog keeps every
              debate recorded once and for all.
            </p>

            {/* 3-item checklist with red square check tiles (3px ink border) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      backgroundColor: "var(--red)",
                      border: "3px solid var(--ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={18} strokeWidth={3} />
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "var(--ink)",
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: BrowserMock */}
          <div>
            <BrowserMock url="decisionlog.app/decisions">
              {/* Masthead sitting on a red 8px halftone screen */}
              <div
                style={{
                  position: "relative",
                  backgroundColor: "var(--yellow)",
                  borderBottom: "3px solid var(--ink)",
                  padding: "20px 24px",
                  overflow: "hidden",
                }}
              >
                <Halftone
                  color="red"
                  size={8}
                  alpha={0.4}
                  style={{ inset: 0, width: "100%", height: "100%" }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "inline-block",
                    backgroundColor: "var(--white)",
                    border: "2px solid var(--ink)",
                    boxShadow: "3px 3px 0 var(--ink)",
                    padding: "4px 14px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      color: "var(--ink)",
                    }}
                  >
                    TEAM DECISIONS
                  </span>
                </div>
              </div>

              {/* Two Decision Entries */}
              <div style={{ padding: "20px" }}>
                {/* Entry 1 */}
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span className="pill pill-blue">
                      <span className="pill-dot" />
                      <span>Accepted</span>
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--ink-70)",
                      }}
                    >
                      Oct 24, 2026
                    </span>
                  </div>
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      marginBottom: "4px",
                      color: "var(--ink)",
                    }}
                  >
                    ADOPT MONGOOSE 8 & EXPRESS FOR BACKEND
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--ink-70)",
                    }}
                  >
                    Schema enforcement with flexible JSON documents gives fast
                    iteration.
                  </p>
                </div>

                {/* Dashed ink-30 rule */}
                <div
                  style={{
                    borderTop: "2px dashed var(--ink-30)",
                    margin: "16px 0",
                  }}
                />

                {/* Entry 2 */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span className="pill pill-yellow">
                      <span className="pill-dot" />
                      <span>Proposed</span>
                    </span>
                    <span className="pill pill-red">
                      <span className="pill-dot" />
                      <span>FLAGGED</span>
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--ink-70)",
                      }}
                    >
                      Due Soon
                    </span>
                  </div>
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      marginBottom: "4px",
                      color: "var(--ink)",
                    }}
                  >
                    MIGRATE AUTHENTICATION FROM SESSIONS TO JWT
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--ink-70)",
                    }}
                  >
                    Requires review because session cookie security is still
                    debated.
                  </p>
                </div>
              </div>
            </BrowserMock>
          </div>
        </div>
      </div>
    </section>
  );
}

