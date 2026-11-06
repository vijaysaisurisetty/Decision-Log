import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Starburst from "../components/Starburst";
import Halftone from "../components/Halftone";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 Not Found · DecisionLog";
  }, []);

  return (
    <main
      id="main-content"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Red Halftone Screen */}
      <Halftone
        color="red"
        size={16}
        alpha={0.25}
        style={{
          top: "10%",
          right: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
        }}
      />

      <div
        className="panel"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "520px",
          width: "100%",
          backgroundColor: "var(--white)",
          padding: "48px 32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Starburst 'OOPS!' above 404 */}
        <div style={{ marginBottom: "12px" }}>
          <Starburst text="OOPS!" color="red" size={80} rotation={-6} />
        </div>

        {/* Huge 404 in Archivo Black */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(64px, 12vw, 108px)",
            lineHeight: 0.9,
            color: "var(--ink)",
            letterSpacing: "-0.04em",
            margin: "0 0 16px",
          }}
        >
          404
        </h1>

        {/* One short sentence */}
        <p
          style={{
            fontFamily: "var(--font)",
            fontSize: "17px",
            fontWeight: 600,
            color: "var(--ink-70)",
            maxWidth: "380px",
            lineHeight: 1.5,
            marginBottom: "32px",
          }}
        >
          The page or decision you were looking for has vanished into thin air.
        </p>

        {/* .btn-red back to the dashboard */}
        <Link to="/dashboard" className="btn btn-red btn-lg press">
          <ArrowLeft size={18} strokeWidth={3} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </main>
  );
}
