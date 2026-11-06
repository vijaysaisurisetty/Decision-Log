import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowUpDown, Filter, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import DecisionCard from "../components/DecisionCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { getDecisions, getDecisionTags } from "../api/client";
import { useQueryState } from "../hooks/useQueryState";
import { useDebounce } from "../hooks/useDebounce";

export default function DecisionList() {
  const { query, setQuery, resetPage } = useQueryState();

  const [searchTerm, setSearchTerm] = useState(query.q || "");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [decisions, setDecisions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    document.title = "Decisions · DecisionLog";
    getDecisionTags()
      .then((res) => setAvailableTags(res.data || []))
      .catch((err) => console.error("Failed to load tags", err));
  }, []);

  // Update query when debounced search term changes
  useEffect(() => {
    if (debouncedSearch !== (query.q || "")) {
      setQuery({ q: debouncedSearch });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep search input in sync if URL q changes externally
  useEffect(() => {
    if (query.q !== undefined && query.q !== searchTerm) {
      setSearchTerm(query.q || "");
    }
  }, [query.q]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDecisions = () => {
    setLoading(true);
    setError(null);

    const params = {
      search: query.q,
      status: query.status,
      tag: query.tag,
      flagged: query.flagged,
      overdue: query.overdue,
      dueWithinDays: query.dueWithinDays,
      sortBy: query.sortBy || "decisionDate",
      order: query.order || "desc",
      page: query.page || 1,
      limit: 10,
    };

    getDecisions(params)
      .then((res) => {
        setDecisions(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load decisions");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDecisions();
  }, [
    query.q,
    query.status,
    query.tag,
    query.flagged,
    query.overdue,
    query.dueWithinDays,
    query.sortBy,
    query.order,
    query.page,
  ]);

  // Quick Filter helpers
  const isAllActive =
    !query.status && !query.flagged && !query.overdue && !query.dueWithinDays;
  const isAcceptedActive = query.status === "Accepted";
  const isProposedActive = query.status === "Proposed";
  const isFlaggedActive = query.flagged === "true";
  const isOverdueActive = query.overdue === "true";
  const isDue14Active = query.dueWithinDays === "14";

  const setQuickFilter = (type) => {
    if (type === "all") {
      setQuery({
        status: undefined,
        flagged: undefined,
        overdue: undefined,
        dueWithinDays: undefined,
      });
    } else if (type === "accepted") {
      setQuery({
        status: "Accepted",
        flagged: undefined,
        overdue: undefined,
        dueWithinDays: undefined,
      });
    } else if (type === "proposed") {
      setQuery({
        status: "Proposed",
        flagged: undefined,
        overdue: undefined,
        dueWithinDays: undefined,
      });
    } else if (type === "flagged") {
      setQuery({
        flagged: "true",
        status: undefined,
        overdue: undefined,
        dueWithinDays: undefined,
      });
    } else if (type === "overdue") {
      setQuery({
        overdue: "true",
        status: undefined,
        flagged: undefined,
        dueWithinDays: undefined,
      });
    } else if (type === "due14") {
      setQuery({
        dueWithinDays: "14",
        status: undefined,
        flagged: undefined,
        overdue: undefined,
      });
    }
  };

  const activeFiltersCount =
    (query.status ? 1 : 0) +
    (query.tag ? 1 : 0) +
    (query.flagged ? 1 : 0) +
    (query.overdue ? 1 : 0) +
    (query.dueWithinDays ? 1 : 0);

  const hasActiveFilters = Boolean(query.q) || activeFiltersCount > 0;

  const clearAllFilters = () => {
    setSearchTerm("");
    setQuery({
      q: undefined,
      status: undefined,
      tag: undefined,
      flagged: undefined,
      overdue: undefined,
      dueWithinDays: undefined,
      page: 1,
    });
  };

  return (
    <main id="main-content" style={{ flex: 1, paddingBottom: "64px" }}>
      <PageHeader
        title="ALL DECISIONS"
        subtitle="Explore all logged architectural and product decisions across the project."
        actions={
          <Link to="/decisions/new" className="btn btn-red press">
            <Plus size={18} strokeWidth={3} />
            <span>New Decision</span>
          </Link>
        }
      />

      <div className="container" style={{ marginTop: "24px" }}>
        {/* Desktop Sticky Filter Bar (>= 651px) */}
        <div
          className="panel filter-bar-desktop"
          style={{
            padding: "20px",
            backgroundColor: "var(--white)",
            marginBottom: "28px",
            position: "sticky",
            top: "76px",
            zIndex: 40,
            "--sh": "6px",
          }}
        >
          {/* Top Row: Search and Selects */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                strokeWidth={3}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--ink-70)",
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search decisions..."
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px 0 36px",
                  border: "2px solid var(--ink)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor: "var(--paper)",
                }}
              />
            </div>

            {/* Status Select */}
            <div>
              <select
                value={query.status || ""}
                onChange={(e) => {
                  setQuery({ status: e.target.value || undefined });
                }}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 10px",
                  border: "2px solid var(--ink)",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  backgroundColor: "var(--paper)",
                }}
              >
                <option value="">All Statuses</option>
                <option value="Accepted">Accepted</option>
                <option value="Proposed">Proposed</option>
                <option value="Superseded">Superseded</option>
                <option value="Deprecated">Deprecated</option>
              </select>
            </div>

            {/* Tag Select */}
            <div>
              <select
                value={query.tag || ""}
                onChange={(e) => {
                  setQuery({ tag: e.target.value || undefined });
                }}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 10px",
                  border: "2px solid var(--ink)",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  backgroundColor: "var(--paper)",
                }}
              >
                <option value="">All Tags</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By Select */}
            <div>
              <select
                value={query.sortBy || "decisionDate"}
                onChange={(e) => {
                  setQuery({ sortBy: e.target.value });
                }}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 10px",
                  border: "2px solid var(--ink)",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  backgroundColor: "var(--paper)",
                }}
              >
                <option value="decisionDate">Decision Date</option>
                <option value="reviewDate">Review Date</option>
                <option value="title">Title</option>
                <option value="createdAt">Date Created</option>
              </select>
            </div>

            {/* Order Toggle */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  setQuery({ order: query.order === "asc" ? "desc" : "asc" });
                }}
                className="btn btn-white btn-sm press"
                style={{ height: "40px", flex: 1 }}
                title="Toggle Sort Order"
              >
                <ArrowUpDown size={15} strokeWidth={2.5} />
                <span>{query.order === "asc" ? "ASC" : "DESC"}</span>
              </button>
            </div>
          </div>

          {/* Quick Filters Row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              borderTop: "1px dashed var(--ink-30)",
              paddingTop: "14px",
            }}
          >
            {[
              { id: "all", label: "All", active: isAllActive },
              { id: "accepted", label: "Accepted", active: isAcceptedActive },
              { id: "proposed", label: "Proposed", active: isProposedActive },
              { id: "flagged", label: "Flagged", active: isFlaggedActive },
              { id: "overdue", label: "Overdue", active: isOverdueActive },
              { id: "due14", label: "Due in 14d", active: isDue14Active },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setQuickFilter(f.id)}
                className="press"
                style={{
                  height: "28px",
                  padding: "0 14px",
                  borderRadius: "999px",
                  border: "2px solid var(--ink)",
                  fontFamily: "var(--font)",
                  fontWeight: 800,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  backgroundColor: f.active ? "var(--ink)" : "var(--white)",
                  color: f.active ? "#ffffff" : "var(--ink)",
                  cursor: "pointer",
                  "--sh": "2px",
                }}
              >
                {f.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn-ghost"
                style={{
                  fontSize: "12px",
                  color: "var(--red)",
                  marginLeft: "auto",
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter Bar & Sheet Trigger (< 650px) */}
        <div className="filter-bar-mobile" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={16}
                strokeWidth={3}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--ink-70)",
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search decisions..."
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px 0 36px",
                  border: "3px solid var(--ink)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor: "var(--white)",
                  boxShadow: "3px 3px 0 var(--ink)",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              className="btn btn-white press"
              style={{
                height: "44px",
                padding: "0 14px",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              aria-label="Open Filters Bottom Sheet"
            >
              <Filter size={16} strokeWidth={3} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span
                  style={{
                    backgroundColor: "var(--red)",
                    color: "#ffffff",
                    borderRadius: "999px",
                    padding: "1px 6px",
                    fontSize: "11px",
                    fontWeight: 900,
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Filters Bottom Sheet (< 650px) */}
        {mobileSheetOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            {/* Backdrop with faint dots screen */}
            <div
              onClick={() => setMobileSheetOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(15, 13, 10, 0.6)",
                backgroundImage: "var(--dot-white)",
                backgroundSize: "16px 16px",
              }}
              aria-hidden="true"
            />

            {/* Bottom Sheet Drawer */}
            <div
              className="mobile-filters-drawer"
              style={{
                position: "relative",
                zIndex: 1,
                backgroundColor: "var(--white)",
                borderTop: "3px solid var(--ink)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                boxShadow: "0 -6px 0 var(--ink)",
                padding: "24px 20px 32px",
                maxHeight: "85vh",
                overflowY: "auto",
              }}
            >
              {/* Header */}
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
                    fontSize: "20px",
                    letterSpacing: "-0.01em",
                    margin: 0,
                  }}
                >
                  FILTERS
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  aria-label="Close filters"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "4px",
                    border: "2px solid var(--ink)",
                    backgroundColor: "var(--paper)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Quick Filters */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontFamily: "var(--font)",
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "10px",
                  }}
                >
                  Quick Presets
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { id: "all", label: "All", active: isAllActive },
                    { id: "accepted", label: "Accepted", active: isAcceptedActive },
                    { id: "proposed", label: "Proposed", active: isProposedActive },
                    { id: "flagged", label: "Flagged", active: isFlaggedActive },
                    { id: "overdue", label: "Overdue", active: isOverdueActive },
                    { id: "due14", label: "Due in 14d", active: isDue14Active },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setQuickFilter(f.id)}
                      style={{
                        height: "32px",
                        padding: "0 14px",
                        borderRadius: "999px",
                        border: "2px solid var(--ink)",
                        fontFamily: "var(--font)",
                        fontWeight: 800,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        backgroundColor: f.active ? "var(--ink)" : "var(--paper)",
                        color: f.active ? "#ffffff" : "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Select */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font)",
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Status
                </label>
                <select
                  value={query.status || ""}
                  onChange={(e) => {
                    setQuery({ status: e.target.value || undefined });
                  }}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 12px",
                    border: "3px solid var(--ink)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Proposed">Proposed</option>
                  <option value="Superseded">Superseded</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>

              {/* Tag Select */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font)",
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Tag
                </label>
                <select
                  value={query.tag || ""}
                  onChange={(e) => {
                    setQuery({ tag: e.target.value || undefined });
                  }}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 12px",
                    border: "3px solid var(--ink)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  <option value="">All Tags</option>
                  {availableTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By & Order Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font)",
                      fontWeight: 800,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Sort By
                  </label>
                  <select
                    value={query.sortBy || "decisionDate"}
                    onChange={(e) => {
                      setQuery({ sortBy: e.target.value });
                    }}
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 10px",
                      border: "3px solid var(--ink)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    <option value="decisionDate">Decision Date</option>
                    <option value="reviewDate">Review Date</option>
                    <option value="title">Title</option>
                    <option value="createdAt">Created</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font)",
                      fontWeight: 800,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Order
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery({ order: query.order === "asc" ? "desc" : "asc" });
                    }}
                    className="btn btn-white press"
                    style={{ width: "100%", height: "44px", borderRadius: "8px" }}
                  >
                    <ArrowUpDown size={15} strokeWidth={2.5} />
                    <span>{query.order === "asc" ? "ASC" : "DESC"}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="btn btn-white press"
                    style={{ flex: 1 }}
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  className="btn btn-red press"
                  style={{ flex: 1 }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {error ? (
          <ErrorMessage message={error} onRetry={loadDecisions} />
        ) : loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="skeleton"
                style={{ height: "130px", width: "100%", borderRadius: "12px" }}
              />
            ))}
          </div>
        ) : decisions.length === 0 ? (
          <EmptyState
            title="NO DECISIONS FOUND"
            message={
              hasActiveFilters
                ? "No decisions matched your search and filter criteria."
                : "No decisions have been logged in the project yet."
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn btn-red press"
                >
                  Clear Filters
                </button>
              ) : (
                <Link to="/decisions/new" className="btn btn-red press">
                  Log a Decision
                </Link>
              )
            }
          />
        ) : (
          <div>
            {decisions.map((decision) => (
              <DecisionCard key={decision._id} decision={decision} />
            ))}

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => setQuery({ page: p })}
            />
          </div>
        )}
      </div>

      <style>{`
        .filter-bar-desktop {
          display: block;
        }
        .filter-bar-mobile {
          display: none;
        }
        @media (max-width: 650px) {
          .filter-bar-desktop {
            display: none !important;
          }
          .filter-bar-mobile {
            display: block !important;
          }
        }
      `}</style>
    </main>
  );
}
