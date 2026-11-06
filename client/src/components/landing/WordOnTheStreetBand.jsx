import React from "react";
import SpeechBubble from "../SpeechBubble";
import Avatar from "../Avatar";

export default function WordOnTheStreetBand() {
  // sample text
  const testimonials = [
    {
      quote: "We stopped re-arguing the database choice in every sprint.",
      name: "Asha",
      role: "Tech Lead",
      tail: "left",
      color: "red",
    },
    {
      quote: "The review date flag saved us from an outdated auth setup.",
      name: "Marcus",
      role: "Backend Dev",
      tail: "center",
      color: "blue",
    },
    {
      quote: "New teammates read the log and get the why in five minutes.",
      name: "Priya",
      role: "Product Manager",
      tail: "right",
      color: "ink",
    },
  ];

  return (
    <section
      style={{
        backgroundColor: "var(--yellow)",
        borderBottom: "3px solid var(--ink)",
        padding: "80px 0",
      }}
    >
      <div className="container" style={{ textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 52px)",
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: "56px",
          }}
        >
          WORD ON THE STREET
        </h2>

        {/* 3-column grid of SpeechBubbles & Avatars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "36px",
            textAlign: "left",
          }}
        >
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* SpeechBubble with specific tail position */}
              <SpeechBubble tail={t.tail}>
                <p
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  "{t.quote}"
                </p>
              </SpeechBubble>

              {/* Speaker Avatar & Name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  paddingLeft: t.tail === "left" ? "24px" : "12px",
                }}
              >
                <Avatar name={t.name} size={40} />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font)",
                      fontWeight: 800,
                      fontSize: "15px",
                      color: "var(--ink)",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--ink-70)",
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

