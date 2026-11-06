import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ReviewBadge({ daysUntilReview, status, className = "" }) {
  const normStatus = (status || "").toLowerCase();

  if (normStatus === "superseded" || normStatus === "deprecated") {
    return (
      <span className={`pill pill-paper-dashed ${className}`}>
        <span className="pill-dot" />
        <span>No review needed</span>
      </span>
    );
  }

  if (typeof daysUntilReview !== "number" || isNaN(daysUntilReview)) {
    return null;
  }

  if (daysUntilReview < 0) {
    const overdueDays = Math.abs(daysUntilReview);
    return (
      <span className={`pill pill-red ${className}`}>
        <AlertTriangle size={12} strokeWidth={3} />
        <span>
          {overdueDays} {overdueDays === 1 ? "day" : "days"} overdue
        </span>
      </span>
    );
  }

  if (daysUntilReview <= 14) {
    return (
      <span className={`pill pill-yellow ${className}`}>
        <span className="pill-dot" />
        <span>
          {daysUntilReview === 0
            ? "Due today"
            : `Due in ${daysUntilReview} ${daysUntilReview === 1 ? "day" : "days"}`}
        </span>
      </span>
    );
  }

  return (
    <span className={`pill pill-white ${className}`}>
      <span className="pill-dot" />
      <span>Review in {daysUntilReview} days</span>
    </span>
  );
}
