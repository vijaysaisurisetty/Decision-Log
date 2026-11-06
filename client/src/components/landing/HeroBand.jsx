import React from "react";
import { Link } from "react-router-dom";
import Halftone from "../Halftone";
import Starburst from "../Starburst";
import MarkerUnderline from "../MarkerUnderline";

export default function HeroBand() {
  return (
    <section
      style={{
        backgroundColor: "var(--yellow)",
        position: "relative",
        padding: "64px 0 80px",
        overflow: "hidden",
      }}
    >
      {/* Red 16px halftone field covering top-right area with rounded bottom-left corner */}
      <Halftone
        color="red"
        size={16}
        alpha={0.4}
        style={{
          top: 0,
          right: 0,
          width: "45%",
          height: "80%",
          borderBottomLeftRadius: "64px",
        }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Slightly rotated white eyebrow chip */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: "var(--white)",
            border: "3px solid var(--ink)",
            boxShadow: "3px 3px 0 var(--ink)",
            padding: "4px 14px",
            fontFamily: "var(--font-display)",
            fontSize: "13px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transform: "rotate(-1.5deg)",
            marginBottom: "24px",
          }}
        >
          DECISION RECORDS FOR TEAMS
        </div>

        {/* Headline with Starburst badge and MarkerUnderline */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(44px, 8vw, 96px)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            REMEMBER THE <MarkerUnderline>WHY.</MarkerUnderline>
          </h1>

          {/* Starburst 'NEW!' overlapping top-right corner */}
          <div
            className="hero-starburst-pos"
            style={{
              position: "absolute",
              top: "-24px",
              right: "-36px",
              zIndex: 2,
            }}
          >
            <Starburst text="NEW!" color="red" size={68} rotation={-8} />
          </div>
        </div>

        {/* Two-line subhead */}
        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            fontWeight: 600,
            color: "var(--ink)",
            maxWidth: "680px",
            lineHeight: 1.5,
            marginBottom: "36px",
          }}
        >
          Write down the context, the options and the reason.
          <br />
          Come back on the review date and know what to do.
        </p>

        {/* CTA Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <Link
            to="/decisions/new"
            className="btn btn-red btn-lg press"
            style={{ minWidth: "200px" }}
          >
            Log a decision
          </Link>
          <Link
            to="/dashboard"
            className="btn btn-white btn-lg press"
            style={{ minWidth: "200px" }}
          >
            See the dashboard
          </Link>
        </div>

        {/* Small bold reassurance line */}
        <p
          style={{
            fontFamily: "var(--font)",
            fontSize: "13px",
            fontWeight: 800,
            color: "var(--ink-70)",
            letterSpacing: "0.02em",
          }}
        >
          Free to run. Your decisions stay in your own database.
        </p>
      </div>

      <style>{`
        @media (max-width: 650px) {
          .hero-starburst-pos {
            top: -36px !important;
            right: 0 !important;
            transform: scale(0.85);
          }
        }
      `}</style>
    </section>
  );
}

