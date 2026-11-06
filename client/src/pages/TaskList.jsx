import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmModal from "../components/ConfirmModal";
import { getTasks, deleteTask } from "../api/client";
import { useQueryState } from "../hooks/useQueryState";
import { useDebounce } from "../hooks/useDebounce";
import { formatShortDate } from "../utils/format";
import { useToast } from "../context/ToastContext";

export default function TaskList() {
  const { query, setQuery, resetPage } = useQueryState();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState(query.q || "");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "Tasks · DecisionLog";
  }, []);

  useEffect(() => {
    if (debouncedSearch !== (query.q || "")) {
      setQuery({ q: debouncedSearch });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (query.q !== undefined && query.q !== searchTerm) {
      setSearchTerm(query.q || "");
    }
  }, [query.q]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTasks = () => {
    setLoading(true);
    setLoadError(null);

    const params = {
      search: query.q,
      status: query.status,
      priority: query.priority,
      unlinked: query.unlinked,
      page: query.page || 1,
      limit: 10,
    };

    getTasks(params)
      .then((res) => {
        setTasks(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      })
      .catch((err) => {
        setLoadError(err.message || "Failed to load tasks");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, [query.q, query.status, query.priority, query.unlinked, query.page]);

  const handleDeleteConfirm = async () => {
    if (!taskToDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteTask(taskToDelete._id);
      success(`Task "${taskToDelete.title}" deleted`);
      setTaskToDelete(null);
      loadTasks();
    } catch (err) {
      error(err.message || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const isUnlinked = query.unlinked === "true";

  return (
    <main id="main-content" style={{ flex: 1, paddingBottom: "64px" }}>
      <PageHeader
        title="ALL TASKS"
        subtitle="Manage development and product tasks linked to key project decisions."
        actions={
          <Link to="/tasks/new" className="btn btn-red press">
            <Plus size={18} strokeWidth={3} />
            <span>New Task</span>
          </Link>
        }
      />

      <div className="container" style={{ marginTop: "24px" }}>
        {/* Filter Bar Panel */}
        <div
          className="panel"
          style={{
            padding: "20px",
            backgroundColor: "var(--white)",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              alignItems: "center",
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
                placeholder="Search tasks..."
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
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <select
                value={query.priority || ""}
                onChange={(e) => {
                  setQuery({ priority: e.target.value || undefined });
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
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* "Unlinked only" Toggle Chip */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setQuery({ unlinked: isUnlinked ? undefined : "true" });
                }}
                className="press"
                style={{
                  height: "40px",
                  width: "100%",
                  padding: "0 14px",
                  borderRadius: "999px",
                  border: "2px solid var(--ink)",
                  fontFamily: "var(--font)",
                  fontWeight: 800,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  backgroundColor: isUnlinked ? "var(--ink)" : "var(--white)",
                  color: isUnlinked ? "#ffffff" : "var(--ink)",
                  cursor: "pointer",
                  "--sh": "2px",
                }}
              >
                {isUnlinked ? "✓ Unlinked only" : "Unlinked only"}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loadError ? (
          <ErrorMessage message={loadError} onRetry={loadTasks} />
        ) : loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="skeleton"
                style={{ height: "64px", width: "100%", borderRadius: "8px" }}
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="NO TASKS FOUND"
            message="No tasks matched your search or filters."
            action={
              <Link to="/tasks/new" className="btn btn-red press">
                Create a Task
              </Link>
            }
          />
        ) : (
          <div>
            {/* Desktop: White Panel Table (stacked on mobile) */}
            <div className="tasks-desktop-table panel" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--ink)",
                      color: "#ffffff",
                    }}
                  >
                    <th style={{ padding: "14px 16px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      TITLE
                    </th>
                    <th style={{ padding: "14px 16px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      STATUS
                    </th>
                    <th style={{ padding: "14px 16px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      PRIORITY
                    </th>
                    <th style={{ padding: "14px 16px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      ASSIGNEE
                    </th>
                    <th style={{ padding: "14px 16px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      DUE DATE
                    </th>
                    <th style={{ padding: "14px 16px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      LINKED DECISIONS
                    </th>
                    <th style={{ padding: "14px 16px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "right" }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => {
                    const linked = task.linkedDecisions || [];

                    return (
                      <tr
                        key={task._id}
                        style={{
                          borderBottom:
                            idx === tasks.length - 1
                              ? "none"
                              : "1px dashed var(--ink-30)",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        {/* Title */}
                        <td style={{ padding: "16px", fontWeight: 700, fontSize: "15px", color: "var(--ink)" }}>
                          <Link
                            to={`/tasks/${task._id}/edit`}
                            style={{ textDecoration: "none", color: "var(--ink)" }}
                            className="task-title-link"
                          >
                            {task.title}
                          </Link>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "16px" }}>
                          <StatusBadge status={task.status} type="task" />
                        </td>

                        {/* Priority */}
                        <td style={{ padding: "16px" }}>
                          <StatusBadge status={task.priority} type="priority" />
                        </td>

                        {/* Assignee */}
                        <td style={{ padding: "16px" }}>
                          {task.assignee ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Avatar name={task.assignee} size={28} />
                              <span style={{ fontSize: "13px", fontWeight: 700 }}>
                                {task.assignee}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: "13px", color: "var(--ink-70)", fontWeight: 600 }}>
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Due Date */}
                        <td style={{ padding: "16px", fontSize: "13px", fontWeight: 700, color: "var(--ink-70)" }}>
                          {task.dueDate ? formatShortDate(task.dueDate) : "—"}
                        </td>

                        {/* Linked Decisions */}
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {linked.slice(0, 2).map((dec) => (
                              <Link
                                key={dec._id}
                                to={`/decisions/${dec._id}`}
                                className="pill pill-white press"
                                style={{ fontSize: "11px", height: "22px" }}
                                title={dec.title}
                              >
                                <span className="pill-dot" />
                                <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {dec.title}
                                </span>
                              </Link>
                            ))}
                            {linked.length > 2 && (
                              <span className="pill pill-white" style={{ fontSize: "11px", height: "22px" }}>
                                +{linked.length - 2}
                              </span>
                            )}
                            {linked.length === 0 && (
                              <span style={{ fontSize: "12px", color: "var(--ink-70)", fontWeight: 600 }}>
                                None
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => navigate(`/tasks/${task._id}/edit`)}
                              aria-label={`Edit task ${task.title}`}
                              className="press"
                              style={{
                                width: "36px",
                                height: "36px",
                                border: "2px solid var(--ink)",
                                borderRadius: "4px",
                                backgroundColor: "var(--paper)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                "--sh": "2px",
                              }}
                            >
                              <Edit size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskToDelete(task)}
                              aria-label={`Delete task ${task.title}`}
                              className="press"
                              style={{
                                width: "36px",
                                height: "36px",
                                border: "2px solid var(--ink)",
                                borderRadius: "4px",
                                backgroundColor: "var(--paper)",
                                color: "var(--red)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                "--sh": "2px",
                              }}
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: Stacked Comic Panels (under 768px) */}
            <div className="tasks-mobile-list" style={{ display: "none" }}>
              {tasks.map((task) => {
                const linked = task.linkedDecisions || [];

                return (
                  <div
                    key={task._id}
                    className="panel"
                    style={{
                      padding: "20px",
                      backgroundColor: "var(--white)",
                      marginBottom: "16px",
                      "--sh": "4px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                      <Link
                        to={`/tasks/${task._id}/edit`}
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "18px",
                          color: "var(--ink)",
                          textDecoration: "none",
                        }}
                      >
                        {task.title}
                      </Link>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/tasks/${task._id}/edit`)}
                          aria-label={`Edit task ${task.title}`}
                          style={{
                            width: "32px",
                            height: "32px",
                            border: "2px solid var(--ink)",
                            borderRadius: "4px",
                            backgroundColor: "var(--paper)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Edit size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          aria-label={`Delete task ${task.title}`}
                          style={{
                            width: "32px",
                            height: "32px",
                            border: "2px solid var(--ink)",
                            borderRadius: "4px",
                            backgroundColor: "var(--paper)",
                            color: "var(--red)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                      <StatusBadge status={task.status} type="task" />
                      <StatusBadge status={task.priority} type="priority" />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 700, borderTop: "1px dashed var(--ink-30)", paddingTop: "10px" }}>
                      {task.assignee ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Avatar name={task.assignee} size={24} />
                          <span>{task.assignee}</span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--ink-70)" }}>Unassigned</span>
                      )}

                      {task.dueDate && (
                        <span style={{ color: "var(--ink-70)" }}>
                          Due: {formatShortDate(task.dueDate)}
                        </span>
                      )}
                    </div>

                    {linked.length > 0 && (
                      <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {linked.map((dec) => (
                          <Link
                            key={dec._id}
                            to={`/decisions/${dec._id}`}
                            className="pill pill-white"
                            style={{ fontSize: "11px" }}
                          >
                            <span className="pill-dot" />
                            <span>{dec.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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

      {/* Confirm Delete Task Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE THIS TASK?"
        message={
          taskToDelete && taskToDelete.linkedDecisions && taskToDelete.linkedDecisions.length > 0
            ? `This task is linked to ${taskToDelete.linkedDecisions.length} ${
                taskToDelete.linkedDecisions.length === 1 ? "decision" : "decisions"
              }. The links will be removed.`
            : `Are you sure you want to permanently delete "${taskToDelete?.title}"?`
        }
        confirmText="Delete Task"
        loading={deleting}
      />

      <style>{`
        .task-title-link:hover {
          text-decoration: underline 3px var(--red);
          text-underline-offset: 4px;
        }
        @media (max-width: 768px) {
          .tasks-desktop-table {
            display: none !important;
          }
          .tasks-mobile-list {
            display: block !important;
          }
        }
      `}</style>
    </main>
  );
}
