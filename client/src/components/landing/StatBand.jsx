import React, { useState, useEffect } from "react";
import { getDecisionStats } from "../../api/client";

export default function StatBand() {
  const [stats, setStats] = useState({
    total: "--",
    flagged: "--",
    upcomingReviews: "--",
  });

  useEffect(() => {
    let active = true;
    getDecisionStats()
      .then((res) => {
        if (active && res?.data) {
          setStats({
            total: res.data.total ?? 0,
            flagged: res.data.flagged ?? 0,
            upcomingReviews: res.data.upcomingReviews ?? 0,
          });
        }
      })
      .catch(() => {
        if (active) {
          // If the request fails show "0" and do not show an error banner here
          setStats({
            total: 0,
            flagged: 0,
            upcomingReviews: 0,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      style={{
        backgroundColor: "var(--ink)",
        color: "#ffffff",
        borderBottom: "3px solid var(--ink)",
        padding: "72px 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            textAlign: "center",
          }}
        >
          {/* Column 1: Total Decisions */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(48px, 7vw, 76px)",
                color: "var(--yellow)",
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              {stats.total}
            </div>
            <div
              style={{
                fontFamily: "var(--font)",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              DECISIONS LOGGED
            </div>
          </div>

          {/* Column 2: Flagged for Review */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(48px, 7vw, 76px)",
                color: "var(--yellow)",
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              {stats.flagged}
            </div>
            <div
              style={{
                fontFamily: "var(--font)",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              FLAGGED FOR REVIEW
            </div>
          </div>

          {/* Column 3: Upcoming Reviews */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(48px, 7vw, 76px)",
                color: "var(--yellow)",
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              {stats.upcomingReviews}
            </div>
            <div
              style={{
                fontFamily: "var(--font)",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              REVIEWS DUE IN 14 DAYS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

