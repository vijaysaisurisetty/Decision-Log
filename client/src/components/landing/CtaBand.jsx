import React from "react";
import { Link } from "react-router-dom";
import Halftone from "../Halftone";

export default function CtaBand() {
  return (
    <section
      style={{
        backgroundColor: "var(--blue)",
        position: "relative",
        padding: "80px 0 96px",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Sparse white 16px dot screen at 25% opacity rising from bottom-left corner */}
      <Halftone
        color="white"
        size={16}
        alpha={0.25}
        style={{
          bottom: 0,
          left: 0,
          width: "360px",
          height: "220px",
          borderTopRightRadius: "48px",
        }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(34px, 5.5vw, 64px)",
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginBottom: "32px",
          }}
        >
          READY TO REMEMBER WHY?
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <Link
            to="/decisions/new"
            className="btn btn-yellow btn-lg press"
            style={{ minWidth: "240px" }}
          >
            Log your first decision
          </Link>
        </div>

        <p
          style={{
            fontFamily: "var(--font)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#ffffff",
            opacity: 0.85,
          }}
        >
          Takes about two minutes.
        </p>
      </div>
    </section>
  );
}

