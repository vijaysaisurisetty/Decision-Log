import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Check,
  Edit,
  Trash2,
  Plus,
  Unlink,
  CheckCircle2,
  Clock,
  Archive,
  AlertTriangle,
  PlusSquare,
  MinusSquare,
  ArrowLeft,
} from "lucide-react";
import Halftone from "../components/Halftone";
import CalendarCard from "../components/CalendarCard";
import Avatar from "../components/Avatar";
import StatusBadge from "../components/StatusBadge";
import FlagPill from "../components/FlagPill";
import CornerChip from "../components/CornerChip";
import Switch from "../components/Switch";
import TaskPicker from "../components/TaskPicker";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import {
  getDecision,
  deleteDecision,
  setReconsideration,
  linkTask,
  unlinkTask,
} from "../api/client";
import { formatDate, formatShortDate, relativeDaysText } from "../utils/format";
import { useToast } from "../context/ToastContext";

export default function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [is404, setIs404] = useState(false);

  // Modals & form state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);

  // Reconsideration local state
  const [switchOn, setSwitchOn] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const [savingReconsideration, setSavingReconsideration] = useState(false);

  const fetchDetail = () => {
    setLoading(true);
    setLoadError(null);
    setIs404(false);

    getDecision(id)
      .then((res) => {
        setDecision(res.data);
        setSwitchOn(Boolean(res.data?.needsReconsideration));
        setReasonInput(res.data?.flagReason || "");
        document.title = `${res.data?.title || "Decision"} · DecisionLog`;
      })
      .catch((err) => {
        if (err.status === 404) {
          setIs404(true);
        } else {
          setLoadError(err.fieldErrors?.id || err.message || "Failed to load decision details");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Delete
  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteDecision(id);
      success("Decision deleted successfully");
      navigate("/decisions");
    } catch (err) {
      error(err.message || "Failed to delete decision");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // Handle Reconsideration Switch Toggle
  const handleToggleReconsideration = async (nextState) => {
    if (!nextState) {
      // Turning OFF calls API immediately
      setSavingReconsideration(true);
      try {
        const res = await setReconsideration(id, {
          needsReconsideration: false,
          reason: "",
        });
        setDecision(res.data);
        setSwitchOn(false);
        setReasonInput("");
        success("Reconsideration flag cleared");
      } catch (err) {
        error(err.message || "Failed to update reconsideration");
      } finally {
        setSavingReconsideration(false);
      }
    } else {
      // Turning ON shows textarea and requires save
      setSwitchOn(true);
    }
  };

  const handleSaveReconsideration = async () => {
    if (!reasonInput || reasonInput.trim().length < 5) {
      error("Reason must be at least 5 characters");
      return;
    }
    setSavingReconsideration(true);
    try {
      const res = await setReconsideration(id, {
        needsReconsideration: true,
        reason: reasonInput.trim(),
      });
      setDecision(res.data);
      success("Decision marked as Needs Reconsideration");
    } catch (err) {
      error(err.message || "Failed to flag decision");
    } finally {
      setSavingReconsideration(false);
    }
  };

  // Handle Task Linking
  const handleLinkTasks = async (taskIds) => {
    try {
      let updatedDecision = null;
      for (const tId of taskIds) {
        const res = await linkTask(id, tId);
        updatedDecision = res.data;
      }
      if (updatedDecision) {
        setDecision(updatedDecision);
      }
      success(`${taskIds.length} ${taskIds.length === 1 ? "task" : "tasks"} linked!`);
      setTaskPickerOpen(false);
    } catch (err) {
      error(err.message || "Failed to link tasks");
    }
  };

  const handleUnlink = async (taskId, taskTitle) => {
    try {
      const res = await unlinkTask(id, taskId);
      setDecision(res.data);
      success(`Unlinked "${taskTitle}"`);
    } catch (err) {
      error(err.message || "Failed to unlink task");
    }
  };

  if (is404) {
    return (
      <main id="main-content" className="container" style={{ padding: "64px 16px" }}>
        <EmptyState
          title="DECISION NOT FOUND"
          message="The requested decision record does not exist or has been removed."
          action={
            <Link to="/decisions" className="btn btn-red press">
              <ArrowLeft size={16} strokeWidth={3} />
              <span>Back to Decisions</span>
            </Link>
          }
        />
      </main>
    );
  }

  if (loadError) {
    return (
      <main id="main-content" className="container" style={{ padding: "64px 16px" }}>
        <ErrorMessage message={loadError} onRetry={fetchDetail} />
      </main>
    );
  }

  if (loading || !decision) {
    return (
      <main id="main-content" className="container" style={{ padding: "48px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "32px" }}>
          <div className="skeleton" style={{ height: "420px", borderRadius: "12px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="skeleton" style={{ height: "120px", borderRadius: "12px" }} />
            <div className="skeleton" style={{ height: "240px", borderRadius: "12px" }} />
          </div>
        </div>
      </main>
    );
  }

  const {
    title,
    status,
    needsReconsideration,
    flagReason,
    reconsiderationReason,
    context,
    options = [],
    chosenOption,
    rationale,
    decidedBy,
    decisionDate,
    reviewDate,
    daysUntilReview,
    tags = [],
    tasks = [],
    createdAt,
    updatedAt,
  } = decision;

  // Cover card status color & icon
  const getCoverMeta = () => {
    const norm = (status || "").toLowerCase();
    if (norm === "accepted") {
      return { bg: "var(--blue)", icon: <CheckCircle2 size={40} strokeWidth={3} /> };
    }
    if (norm === "proposed") {
      return { bg: "var(--yellow)", icon: <Clock size={40} strokeWidth={3} /> };
    }
    if (norm === "superseded") {
      return { bg: "var(--ink)", icon: <Archive size={40} strokeWidth={3} /> };
    }
    return { bg: "var(--red)", icon: <AlertTriangle size={40} strokeWidth={3} /> };
  };

  const coverMeta = getCoverMeta();
  const linkedTaskIds = tasks.map((t) => (typeof t === "object" ? t._id : t));

  return (
    <main id="main-content" style={{ flex: 1, paddingBottom: "80px" }}>
      <div className="container" style={{ marginTop: "32px" }}>
        {/* Two-Column Event-Style Layout */}
        <div className="decision-detail-grid">
          {/* LEFT: Cover / Meta Column (width 340px on desktop) */}
          <div className="detail-left-col">
            {/* Poster Card */}
            <div
              className="panel"
              style={{
                backgroundColor: "var(--white)",
                overflow: "hidden",
                marginBottom: "24px",
              }}
            >
              {/* Colored Top Header */}
              <div
                style={{
                  height: "170px",
                  backgroundColor: coverMeta.bg,
                  position: "relative",
                  borderBottom: "3px solid var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* 16px Halftone in Corner */}
                <Halftone
                  color="white"
                  size={16}
                  alpha={0.3}
                  style={{
                    top: 0,
                    right: 0,
                    width: "120px",
                    height: "120px",
                    borderBottomLeftRadius: "24px",
                  }}
                />

                {/* Big Lucide Icon in White Circle */}
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    backgroundColor: "var(--white)",
                    border: "3px solid var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ink)",
                    zIndex: 1,
                  }}
                >
                  {coverMeta.icon}
                </div>

                {/* Chosen Option Name in Archivo Black on Solid White Backing Block */}
                {chosenOption && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "12px",
                      right: "12px",
                      backgroundColor: "var(--white)",
                      border: "2px solid var(--ink)",
                      padding: "4px 10px",
                      textAlign: "center",
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "12px",
                        color: "var(--ink)",
                        textTransform: "uppercase",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      CHOSEN: {chosenOption}
                    </span>
                  </div>
                )}
              </div>

              {/* Meta details below cover */}
              <div style={{ padding: "20px" }}>
                {/* Decided By Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <Avatar name={decidedBy || "Team"} size={36} />
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font)",
                        fontWeight: 800,
                        fontSize: "14px",
                        color: "var(--ink)",
                      }}
                    >
                      {decidedBy}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--ink-70)",
                      }}
                    >
                      Decided on {formatDate(decisionDate)}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "16px",
                    }}
                  >
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/decisions?tag=${encodeURIComponent(tag)}`}
                        className="pill pill-white press"
                        style={{ textDecoration: "none" }}
                      >
                        <span className="pill-dot" />
                        <span>{tag}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Timestamps */}
                <div
                  style={{
                    borderTop: "1px dashed var(--ink-30)",
                    paddingTop: "12px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--ink-70)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div>Created: {formatShortDate(createdAt)}</div>
                  {updatedAt && <div>Updated: {formatShortDate(updatedAt)}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Content Panes */}
          <div className="detail-right-col">
            {/* 1. Header: Breadcrumb, H1 Title, Badges */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontFamily: "var(--font)",
                  fontWeight: 800,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  color: "var(--ink-70)",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                <Link to="/decisions" style={{ color: "var(--ink)" }}>
                  DECISIONS
                </Link>{" "}
                / {title}
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 4vw, 42px)",
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                  color: "var(--ink)",
                  marginBottom: "14px",
                }}
              >
                {title}
              </h1>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <StatusBadge status={status} type="decision" />
                {needsReconsideration && <FlagPill flagReason={flagReason} />}
              </div>
            </div>

            {/* 2. Review Row & Actions */}
            <div
              className="panel"
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--white)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              {/* Review Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <CalendarCard date={reviewDate} size="lg" />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font)",
                      fontWeight: 800,
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--ink-70)",
                    }}
                  >
                    REVIEW ON
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font)",
                      fontWeight: 800,
                      fontSize: "16px",
                      color: "var(--ink)",
                    }}
                  >
                    {formatDate(reviewDate)}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: daysUntilReview < 0 ? "var(--red)" : "var(--ink-70)",
                    }}
                  >
                    {relativeDaysText(daysUntilReview)}
                  </div>
                </div>
              </div>

              {/* 3. Actions: Edit and Delete */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link
                  to={`/decisions/${id}/edit`}
                  className="btn btn-white press"
                >
                  <Edit size={16} strokeWidth={3} />
                  <span>Edit</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="btn btn-red press"
                >
                  <Trash2 size={16} strokeWidth={3} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* 4. Panel: CONTEXT */}
            <div
              className="panel"
              style={{
                padding: "36px 24px 24px",
                backgroundColor: "var(--white)",
                position: "relative",
                marginBottom: "24px",
              }}
            >
              <CornerChip text="CONTEXT" color="ink" rotation={-1.5} />
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "var(--ink)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {context}
              </p>
            </div>

            {/* 5. Panel: OPTIONS CONSIDERED */}
            <div
              className="panel"
              style={{
                padding: "36px 24px 24px",
                backgroundColor: "var(--white)",
                position: "relative",
                marginBottom: "24px",
              }}
            >
              <CornerChip text="OPTIONS CONSIDERED" color="blue" rotation={-1.5} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {options.map((opt, idx) => {
                  const isChosen = opt.name === chosenOption;

                  return (
                    <div
                      key={idx}
                      className="panel"
                      style={{
                        padding: "24px 18px",
                        backgroundColor: isChosen ? "var(--yellow)" : "var(--white)",
                        border: isChosen ? "4px solid var(--ink)" : "3px solid var(--ink)",
                        position: "relative",
                      }}
                    >
                      {/* Rotated red CornerChip for CHOSEN */}
                      {isChosen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-12px",
                            right: "16px",
                            backgroundColor: "var(--red)",
                            color: "#ffffff",
                            border: "2px solid var(--ink)",
                            boxShadow: "2px 2px 0 var(--ink)",
                            padding: "3px 10px",
                            fontFamily: "var(--font-display)",
                            fontSize: "12px",
                            textTransform: "uppercase",
                            transform: "rotate(3deg)",
                            zIndex: 2,
                          }}
                        >
                          CHOSEN
                        </div>
                      )}

                      <h4
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "18px",
                          marginBottom: "8px",
                          color: "var(--ink)",
                        }}
                      >
                        {opt.name}
                      </h4>

                      {opt.description && (
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--ink-70)",
                            lineHeight: 1.45,
                            marginBottom: "16px",
                          }}
                        >
                          {opt.description}
                        </p>
                      )}

                      {/* Pros & Cons list */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          borderTop: "1px dashed var(--ink-30)",
                          paddingTop: "12px",
                        }}
                      >
                        {opt.pros && opt.pros.length > 0 && (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: 800,
                                color: "var(--blue)",
                                textTransform: "uppercase",
                                marginBottom: "4px",
                              }}
                            >
                              <PlusSquare size={13} strokeWidth={3} />
                              <span>PROS</span>
                            </div>
                            <ul style={{ listStyle: "none", paddingLeft: "4px" }}>
                              {opt.pros.map((p, i) => (
                                <li
                                  key={i}
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "var(--ink)",
                                    marginBottom: "2px",
                                  }}
                                >
                                  + {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {opt.cons && opt.cons.length > 0 && (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: 800,
                                color: "var(--red)",
                                textTransform: "uppercase",
                                marginBottom: "4px",
                              }}
                            >
                              <MinusSquare size={13} strokeWidth={3} />
                              <span>CONS</span>
                            </div>
                            <ul style={{ listStyle: "none", paddingLeft: "4px" }}>
                              {opt.cons.map((c, i) => (
                                <li
                                  key={i}
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "var(--ink)",
                                    marginBottom: "2px",
                                  }}
                                >
                                  - {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Panel: CHOSEN APPROACH AND RATIONALE */}
            <div
              className="panel"
              style={{
                padding: "36px 24px 24px",
                backgroundColor: "var(--white)",
                position: "relative",
                marginBottom: "24px",
              }}
            >
              <CornerChip text="CHOSEN RATIONALE" color="red" rotation={-1.5} />
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "22px",
                  color: "var(--ink)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                }}
              >
                {chosenOption}
              </div>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "var(--ink)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {rationale}
              </p>
            </div>

            {/* 7. Panel: LINKED TASKS */}
            <div
              className="panel"
              style={{
                padding: "36px 24px 24px",
                backgroundColor: "var(--white)",
                position: "relative",
                marginBottom: "24px",
              }}
            >
              <CornerChip text="LINKED TASKS" color="ink" rotation={-1.5} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--ink-70)",
                  }}
                >
                  Tasks connected to this decision ({tasks.length})
                </span>
                <button
                  type="button"
                  onClick={() => setTaskPickerOpen(true)}
                  className="btn btn-sm btn-ink press"
                >
                  <Plus size={15} strokeWidth={3} />
                  <span>Link task</span>
                </button>
              </div>

              {tasks.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "var(--ink-70)",
                  }}
                >
                  No tasks linked yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {tasks.map((task) => {
                    const t = typeof task === "object" ? task : { _id: task, title: task };
                    return (
                      <div
                        key={t._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          border: "2px solid var(--ink)",
                          borderRadius: "6px",
                          backgroundColor: "var(--paper)",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <StatusBadge status={t.status || "Todo"} type="task" />
                          <Link
                            to={`/tasks/${t._id}/edit`}
                            style={{
                              fontSize: "14px",
                              fontWeight: 800,
                              color: "var(--ink)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.title}
                          </Link>
                          {t.priority && (
                            <StatusBadge status={t.priority} type="priority" />
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flexShrink: 0,
                          }}
                        >
                          {t.assignee && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Avatar name={t.assignee} size={24} />
                              <span style={{ fontSize: "12px", fontWeight: 700 }}>
                                {t.assignee}
                              </span>
                            </div>
                          )}
                          {t.dueDate && (
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink-70)" }}>
                              {formatShortDate(t.dueDate)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleUnlink(t._id, t.title)}
                            aria-label={`Unlink task ${t.title}`}
                            className="press"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "4px",
                              border: "2px solid var(--ink)",
                              backgroundColor: "var(--white)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "var(--red)",
                              "--sh": "2px",
                            }}
                          >
                            <Unlink size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 8. Panel: RECONSIDERATION */}
            <div
              className={`panel ${needsReconsideration ? "panel-red" : ""}`}
              style={{
                padding: "36px 24px 24px",
                position: "relative",
                backgroundColor: needsReconsideration ? "var(--red)" : "var(--white)",
                color: needsReconsideration ? "#ffffff" : "var(--ink)",
                overflow: "visible",
                marginTop: "16px",
              }}
            >
              {/* White 8px halftone corner when active */}
              {needsReconsideration && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "140px",
                    height: "100px",
                    overflow: "hidden",
                    borderTopRightRadius: "9px",
                    pointerEvents: "none",
                  }}
                >
                  <Halftone
                    color="white"
                    size={8}
                    alpha={0.25}
                    style={{
                      top: 0,
                      right: 0,
                      width: "140px",
                      height: "100px",
                      borderBottomLeftRadius: "32px",
                    }}
                  />
                </div>
              )}

              <CornerChip
                text="RECONSIDERATION"
                color={needsReconsideration ? "yellow" : "red"}
                rotation={-1.5}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  position: "relative",
                  zIndex: 1,
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "18px",
                      marginBottom: "4px",
                      wordBreak: "break-word",
                    }}
                  >
                    NEEDS RECONSIDERATION
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      opacity: needsReconsideration ? 0.9 : 0.7,
                      margin: 0,
                    }}
                  >
                    Flag this decision for the team to reopen discussion.
                  </p>
                </div>

                <div style={{ flexShrink: 0 }}>
                  <Switch
                    checked={switchOn}
                    onChange={handleToggleReconsideration}
                    variant="red"
                    disabled={savingReconsideration}
                    ariaLabel="Toggle needs reconsideration"
                  />
                </div>
              </div>

              {/* If active from overdue review */}
              {daysUntilReview < 0 && !flagReason && (
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    marginBottom: "12px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  This decision is flagged because its review date has passed. Change the review date in Edit.
                </div>
              )}

              {/* Active flagReason display */}
              {needsReconsideration && (reconsiderationReason || flagReason) && (
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "2px solid var(--ink)",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    fontSize: "15px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Reason: {reconsiderationReason || flagReason}
                </div>
              )}

              {/* Textarea for setting reason when turned ON */}
              {switchOn && !needsReconsideration && (
                <div style={{ marginTop: "16px", position: "relative", zIndex: 1 }}>
                  <label
                    htmlFor="reconsider-reason"
                    style={{
                      display: "block",
                      fontFamily: "var(--font)",
                      fontWeight: 800,
                      fontSize: "13px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      color: "var(--ink)",
                    }}
                  >
                    Reason for reconsideration (min 5 characters) *
                  </label>
                  <textarea
                    id="reconsider-reason"
                    rows={3}
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="Why does this decision need another look?"
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#ffffff",
                      border: "3px solid var(--ink)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--ink)",
                      marginBottom: "12px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveReconsideration}
                    disabled={savingReconsideration || reasonInput.trim().length < 5}
                    className="btn btn-red press"
                  >
                    {savingReconsideration ? <span className="spinner" /> : "Save Reason"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Picker Modal */}
      <TaskPicker
        isOpen={taskPickerOpen}
        onClose={() => setTaskPickerOpen(false)}
        alreadyLinkedTaskIds={linkedTaskIds}
        onLinkTasks={handleLinkTasks}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="DELETE THIS DECISION?"
        message={`Are you sure you want to permanently delete "${title}"? This cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
      />

      <style>{`
        .decision-detail-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 32px;
          align-items: flex-start;
        }
        @media (max-width: 820px) {
          .decision-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
