import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import CalendarCard from "../components/CalendarCard";
import ReviewBadge from "../components/ReviewBadge";
import FlagPill from "../components/FlagPill";
import ErrorMessage from "../components/ErrorMessage";
import { getDecisionStats, getDecisions } from "../api/client";
import { Plus, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [upcoming, setUpcoming] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [upcomingError, setUpcomingError] = useState(null);

  const [flagged, setFlagged] = useState([]);
  const [flaggedLoading, setFlaggedLoading] = useState(true);
  const [flaggedError, setFlaggedError] = useState(null);

  useEffect(() => {
    document.title = "Dashboard · DecisionLog";
  }, []);

  const loadStats = () => {
    setStatsLoading(true);
    setStatsError(null);
    getDecisionStats()
      .then((res) => setStats(res.data))
      .catch((err) => setStatsError(err.message || "Failed to load stats"))
      .finally(() => setStatsLoading(false));
  };

  const loadUpcoming = () => {
    setUpcomingLoading(true);
    setUpcomingError(null);
    getDecisions({ dueWithinDays: 14, sortBy: "reviewDate", order: "asc", limit: 5 })
      .then((res) => setUpcoming(res.data || []))
      .catch((err) => setUpcomingError(err.message || "Failed to load upcoming reviews"))
      .finally(() => setUpcomingLoading(false));
  };

  const loadFlagged = () => {
    setFlaggedLoading(true);
    setFlaggedError(null);
    getDecisions({ flagged: "true", limit: 5 })
      .then((res) => setFlagged(res.data || []))
      .catch((err) => setFlaggedError(err.message || "Failed to load flagged decisions"))
      .finally(() => setFlaggedLoading(false));
  };

  useEffect(() => {
    loadStats();
    loadUpcoming();
    loadFlagged();
  }, []);

  return (
    <main id="main-content" style={{ flex: 1, paddingBottom: "64px" }}>
      <PageHeader
        eyebrow="OVERVIEW"
        title="DECISIONS AT A GLANCE"
        subtitle="Track team architectural choices, upcoming review dates, and flagged records."
        actions={
          <Link to="/decisions/new" className="btn btn-red press">
            <Plus size={18} strokeWidth={3} />
            <span>New Decision</span>
          </Link>
        }
      />

      <div className="container" style={{ marginTop: "36px" }}>
        {/* 5 StatCards in a responsive grid (5 then 3 then 2 then 1) */}
        {statsError ? (
          <ErrorMessage message={statsError} onRetry={loadStats} />
        ) : (
          <div className="stat-cards-grid" style={{ marginBottom: "48px" }}>
            <StatCard
              code="TOT"
              color="ink"
              title="Total Decisions"
              value={statsLoading ? "--" : stats?.total}
              to="/decisions"
            />
            <StatCard
              code="ACC"
              color="blue"
              title="Accepted"
              value={statsLoading ? "--" : (stats?.accepted ?? stats?.byStatus?.Accepted)}
              to="/decisions?status=Accepted"
            />
            <StatCard
              code="PROP"
              color="yellow"
              title="Proposed"
              value={statsLoading ? "--" : (stats?.proposed ?? stats?.byStatus?.Proposed)}
              to="/decisions?status=Proposed"
            />
            <StatCard
              code="FLAG"
              color="red"
              title="Needs Reconsideration"
              value={statsLoading ? "--" : (stats?.flagged ?? stats?.needsReconsideration)}
              to="/decisions?flagged=true"
            />
            <StatCard
              code="OVER"
              color="red"
              title="Overdue Reviews"
              value={statsLoading ? "--" : (stats?.overdue ?? stats?.overdueReviews)}
              to="/decisions?overdue=true"
            />
          </div>
        )}

        {/* Two panels side by side (stacked on mobile) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "32px",
          }}
        >
          {/* Panel 1: REVIEWS DUE IN 14 DAYS */}
          <div
            className="panel"
            style={{
              padding: "24px",
              backgroundColor: "var(--white)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: "2px dashed var(--ink-30)",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                REVIEWS DUE IN 14 DAYS
              </h3>
              <Link
                to="/decisions?dueWithinDays=14"
                className="btn-ghost"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "13px",
                  color: "var(--blue)",
                }}
              >
                <span>View all</span>
                <ArrowRight size={14} strokeWidth={3} />
              </Link>
            </div>

            {upcomingError ? (
              <ErrorMessage message={upcomingError} onRetry={loadUpcoming} />
            ) : upcomingLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="skeleton"
                    style={{ height: "64px", width: "100%" }}
                  />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  fontWeight: 700,
                  color: "var(--ink-70)",
                  fontSize: "15px",
                }}
              >
                Nothing due soon.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {upcoming.map((dec) => (
                  <Link
                    key={dec._id}
                    to={`/decisions/${dec._id}`}
                    className="press"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "10px 14px",
                      border: "2px solid var(--ink)",
                      borderRadius: "8px",
                      backgroundColor: "var(--white)",
                      textDecoration: "none",
                      color: "var(--ink)",
                      "--sh": "3px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <CalendarCard date={dec.reviewDate} />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {dec.title}
                      </span>
                    </div>
                    <ReviewBadge
                      daysUntilReview={dec.daysUntilReview}
                      status={dec.status}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Panel 2: FLAGGED DECISIONS */}
          <div
            className="panel"
            style={{
              padding: "24px",
              backgroundColor: "var(--white)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: "2px dashed var(--ink-30)",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                FLAGGED DECISIONS
              </h3>
              <Link
                to="/decisions?flagged=true"
                className="btn-ghost"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "13px",
                  color: "var(--red)",
                }}
              >
                <span>View all</span>
                <ArrowRight size={14} strokeWidth={3} />
              </Link>
            </div>

            {flaggedError ? (
              <ErrorMessage message={flaggedError} onRetry={loadFlagged} />
            ) : flaggedLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="skeleton"
                    style={{ height: "64px", width: "100%" }}
                  />
                ))}
              </div>
            ) : flagged.length === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  fontWeight: 700,
                  color: "var(--ink-70)",
                  fontSize: "15px",
                }}
              >
                No flagged decisions.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {flagged.map((dec) => (
                  <Link
                    key={dec._id}
                    to={`/decisions/${dec._id}`}
                    className="press"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "10px 14px",
                      border: "2px solid var(--ink)",
                      borderRadius: "8px",
                      backgroundColor: "var(--white)",
                      textDecoration: "none",
                      color: "var(--ink)",
                      "--sh": "3px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <CalendarCard date={dec.reviewDate} />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {dec.title}
                      </span>
                    </div>
                    <FlagPill flagReason={dec.flagReason} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .stat-cards-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .stat-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .stat-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .stat-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
