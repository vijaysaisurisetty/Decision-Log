import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Plus } from "lucide-react";
import Starburst from "./Starburst";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  // Close mobile sheet on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !e.target.closest("#mobile-nav-toggle")
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  return (
    <header
      style={{
        backgroundColor: "var(--yellow)",
        borderBottom: "3px solid var(--ink)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: "68px",
      }}
    >
      <div
        className="container"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Wordmark with tiny red Starburst badge */}
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            position: "relative",
            textDecoration: "none",
          }}
          aria-label="DecisionLog Home"
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
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
            <Starburst text="DL" color="red" size={18} rotation={-8} />
          </span>
        </Link>

        {/* Center: Desktop Nav Pills */}
        <nav
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
          aria-label="Main Navigation"
        >
          {[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/decisions", label: "Decisions" },
            { to: "/tasks", label: "Tasks" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                height: "34px",
                padding: "0 16px",
                borderRadius: "var(--radius-pill)",
                border: "2px solid var(--ink)",
                fontFamily: "var(--font)",
                fontWeight: 800,
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                backgroundColor: isActive ? "var(--ink)" : "var(--white)",
                color: isActive ? "#ffffff" : "var(--ink)",
                boxShadow: isActive ? "2px 2px 0 #ffffff" : "2px 2px 0 var(--ink)",
              })}
              className="press"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Solid-ink button with white shadow */}
        <div
          className="desktop-actions"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <Link
            to="/decisions/new"
            className="btn btn-sm btn-ink-white-shadow press"
            style={{
              fontFamily: "var(--font)",
              fontWeight: 800,
              boxShadow: "3px 3px 0 #ffffff",
            }}
          >
            <Plus size={16} strokeWidth={3} />
            <span>New Decision</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          id="mobile-nav-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-sheet"
          className="mobile-nav-toggle press"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            width: "44px",
            height: "44px",
            backgroundColor: "var(--white)",
            border: "3px solid var(--ink)",
            boxShadow: "3px 3px 0 var(--ink)",
            display: "none", /* overridden in media query below */
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {mobileOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Sliding Sheet */}
      {mobileOpen && (
        <div
          id="mobile-nav-sheet"
          ref={menuRef}
          style={{
            position: "absolute",
            top: "68px",
            left: 0,
            right: 0,
            backgroundColor: "var(--white)",
            borderBottom: "3px solid var(--ink)",
            boxShadow: "0 6px 0 var(--ink)",
            padding: "20px 24px 28px",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/decisions", label: "Decisions" },
              { to: "/tasks", label: "Tasks" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  padding: "12px 16px",
                  border: "2px solid var(--ink)",
                  borderRadius: "8px",
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  textTransform: "uppercase",
                  backgroundColor: isActive ? "var(--ink)" : "var(--paper)",
                  color: isActive ? "#ffffff" : "var(--ink)",
                  boxShadow: "3px 3px 0 var(--ink)",
                  display: "block",
                })}
                className="press"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              borderTop: "2px dashed var(--ink-30)",
              paddingTop: "16px",
            }}
          >
            <Link
              to="/decisions/new"
              className="btn btn-red press"
              style={{ width: "100%" }}
            >
              <Plus size={18} strokeWidth={3} />
              <span>New Decision</span>
            </Link>
            <Link
              to="/tasks/new"
              className="btn btn-white press"
              style={{ width: "100%" }}
            >
              <Plus size={18} strokeWidth={3} />
              <span>New Task</span>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile CSS responsive toggle rule */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav,
          .desktop-actions {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
