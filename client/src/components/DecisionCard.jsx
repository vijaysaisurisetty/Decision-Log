import React from "react";
import { Link } from "react-router-dom";
import { Check, Link as LinkIcon, ArrowRight } from "lucide-react";
import CalendarCard from "./CalendarCard";
import StatusBadge from "./StatusBadge";
import FlagPill from "./FlagPill";
import ReviewBadge from "./ReviewBadge";

export default function DecisionCard({ decision }) {
  if (!decision) return null;

  const {
    _id,
    title,
    status,
    needsReconsideration,
    flagReason,
    chosenOption,
    tags = [],
    tasks = [],
    reviewDate,
    daysUntilReview: rawDays,
  } = decision;

  // Compute days until review if not explicitly provided by API
  const daysUntilReview =
    typeof rawDays === "number"
      ? rawDays
      : reviewDate
      ? Math.ceil(
          (new Date(reviewDate).setHours(0, 0, 0, 0) -
            new Date().setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const taskCount = Array.isArray(tasks) ? tasks.length : 0;

  return (
    <Link
      to={`/decisions/${_id}`}
      className="panel press decision-card"
      style={{
        display: "block",
        textDecoration: "none",
        color: "var(--ink)",
        padding: "20px",
        marginBottom: "16px",
        "--sh": "6px",
      }}
    >
      <div className="decision-card-inner">
        {/* Left: Calendar Card */}
        <div className="decision-card-left">
          <CalendarCard date={reviewDate} />
        </div>

        {/* Middle: Info & Meta */}
        <div className="decision-card-middle">
          {/* Title in Archivo Black */}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              marginBottom: "10px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h3>

          {/* Badges Row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <StatusBadge status={status} type="decision" />
            {needsReconsideration && <FlagPill flagReason={flagReason} />}
          </div>

          {/* Chosen Option with 20px red square check tile */}
          {chosenOption && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "var(--red)",
                  border: "2px solid var(--ink)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  flexShrink: 0,
                }}
              >
                <Check size={14} strokeWidth={3} />
              </span>
              <span>
                Chosen: <strong>{chosenOption}</strong>
              </span>
            </div>
          )}

          {/* Tags & Linked Tasks */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="pill pill-white">
                <span className="pill-dot" />
                <span>{tag}</span>
              </span>
            ))}
            {tags.length > 3 && (
              <span className="pill pill-white">+{tags.length - 3}</span>
            )}

            {taskCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--ink-70)",
                  marginLeft: "4px",
                }}
              >
                <LinkIcon size={13} strokeWidth={2.5} />
                <span>
                  {taskCount} {taskCount === 1 ? "task" : "tasks"}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Right: ReviewBadge & Arrow in 36px ink-bordered circle */}
        <div className="decision-card-right">
          <ReviewBadge daysUntilReview={daysUntilReview} status={status} />
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "2px solid var(--ink)",
              backgroundColor: "var(--paper)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
              flexShrink: 0,
            }}
          >
            <ArrowRight size={18} strokeWidth={3} />
          </div>
        </div>
      </div>

      <style>{`
        .decision-card-inner {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .decision-card-left {
          flex-shrink: 0;
        }
        .decision-card-middle {
          flex: 1;
          min-width: 0;
        }
        .decision-card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
          flex-shrink: 0;
        }
        @media (max-width: 650px) {
          .decision-card-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .decision-card-right {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            border-top: 1px dashed var(--ink-30);
            padding-top: 12px;
          }
        }
      `}</style>
    </Link>
  );
}
