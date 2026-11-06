import React from "react";

export default function StatusBadge({ status, type = "decision", className = "" }) {
  if (!status) return null;

  let pillClass = "pill-white";
  const norm = status.toLowerCase();

  if (type === "priority") {
    if (norm === "high") pillClass = "pill-red";
    else if (norm === "medium") pillClass = "pill-yellow";
    else pillClass = "pill-white";
  } else if (type === "task") {
    if (norm === "in progress") pillClass = "pill-yellow";
    else if (norm === "done") pillClass = "pill-blue";
    else pillClass = "pill-white"; // Todo
  } else {
    // Decision status
    if (norm === "accepted") pillClass = "pill-blue";
    else if (norm === "proposed") pillClass = "pill-yellow";
    else if (norm === "superseded") pillClass = "pill-white";
    else if (norm === "deprecated") pillClass = "pill-paper-dashed";
  }

  return (
    <span className={`pill ${pillClass} ${className}`}>
      <span className="pill-dot" />
      <span>{status}</span>
    </span>
  );
}
