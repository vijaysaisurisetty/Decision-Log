import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
}) {
  if (totalPages <= 1 && totalItems <= limit) return null;

  const start = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalItems);

  // Generate page array with ellipsis
  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const s = Math.max(2, page - 1);
      const e = Math.min(totalPages - 1, page + 1);
      for (let i = s; i <= e; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginTop: "32px",
        paddingTop: "20px",
        borderTop: "2px dashed var(--ink-30)",
      }}
    >
      {/* "Showing X-Y of Z" in Inter 600 */}
      <div
        style={{
          fontFamily: "var(--font)",
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--ink-70)",
        }}
      >
        Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
        <strong>{totalItems}</strong>
      </div>

      {/* Buttons & Squares */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Prev */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn btn-white btn-sm press"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} strokeWidth={3} />
          <span>Prev</span>
        </button>

        {/* Page Squares */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "14px",
                  padding: "0 4px",
                  color: "var(--ink-70)",
                  userSelect: "none",
                }}
              >
                ...
              </span>
            );
          }

          const isActive = p === page;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className="press"
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid var(--ink)",
                backgroundColor: isActive ? "var(--ink)" : "var(--white)",
                color: isActive ? "#ffffff" : "var(--ink)",
                fontFamily: "var(--font-display)",
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                "--sh": "3px",
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn btn-white btn-sm press"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
