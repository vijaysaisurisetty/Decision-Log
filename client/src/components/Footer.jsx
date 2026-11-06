import React from "react";
import { Link } from "react-router-dom";
import Starburst from "./Starburst";
import ProjectCredit from "./ProjectCredit";
import StatusLight from "./StatusLight";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--paper)",
        borderTop: "3px solid var(--ink)",
        padding: "48px 0 24px",
        marginTop: "auto",
      }}
    >
      <div className="container">
        {/* 4-Column Grid (stacks on mobile) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "36px",
            marginBottom: "36px",
          }}
        >
          {/* Column 1: Wordmark & Tagline */}
          <div style={{ maxWidth: "300px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                position: "relative",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "22px",
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                  lineHeight: 1,
                }}
              >
                DECISIONLOG
              </span>
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-14px",
                }}
              >
                <Starburst text="DL" color="red" size={16} rotation={-8} />
              </span>
            </div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--ink-70)",
                lineHeight: 1.5,
              }}
            >
              Keep the why behind every decision. Stop repeating old debates.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                letterSpacing: "0.08em",
                marginBottom: "14px",
                color: "var(--ink)",
              }}
            >
              PRODUCT
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>
                <Link to="/dashboard" className="footer-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/decisions" className="footer-link">
                  Decisions
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="footer-link">
                  Tasks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Create */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                letterSpacing: "0.08em",
                marginBottom: "14px",
                color: "var(--ink)",
              }}
            >
              CREATE
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>
                <Link to="/decisions/new" className="footer-link">
                  New Decision
                </Link>
              </li>
              <li>
                <Link to="/tasks/new" className="footer-link">
                  New Task
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Project */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                letterSpacing: "0.08em",
                marginBottom: "14px",
                color: "var(--ink)",
              }}
            >
              PROJECT
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-link"
                >
                  API Health (/api/health)
                </a>
              </li>
              <li>
                <span className="footer-link" style={{ cursor: "default" }}>
                  MERN Stack · 1960s Pop-Art
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Row: ProjectCredit (60%) & StatusLight (40%) */}
        <div className="footer-middle-row">
          <div className="footer-credit-col">
            <ProjectCredit />
          </div>
          <div className="footer-status-col">
            <StatusLight />
          </div>
        </div>

        {/* Legal Line under 2px ink-30 rule */}
        <div
          style={{
            borderTop: "2px dashed var(--ink-30)",
            paddingTop: "20px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--ink-70)",
            textAlign: "center",
          }}
        >
          © 2026 DecisionLog. Built as a full-stack project.
        </div>
      </div>

      <style>{`
        .footer-link {
          font-weight: 800;
          font-size: 14px;
          color: var(--ink);
          text-decoration: none;
          display: inline-block;
          transition: color var(--ease);
        }
        .footer-link:hover {
          text-decoration: underline 3px var(--red);
          text-underline-offset: 4px;
        }

        .footer-middle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 36px;
          margin-bottom: 40px;
        }
        .footer-credit-col {
          flex: 0 1 60%;
          max-width: 650px;
        }
        .footer-status-col {
          flex: 0 1 40%;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        @media (max-width: 767px) {
          .footer-middle-row {
            flex-direction: column;
            align-items: stretch;
            gap: 24px;
            padding-right: 16px;
          }
          .footer-credit-col {
            flex: 1 1 100%;
            max-width: 100%;
          }
          .footer-status-col {
            flex: 1 1 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
