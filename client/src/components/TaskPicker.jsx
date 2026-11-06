import React, { useState, useEffect } from "react";
import { Search, Plus, Check } from "lucide-react";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import TaskFormFields from "./TaskFormFields";
import { getTasks, createTask } from "../api/client";
import { useDebounce } from "../hooks/useDebounce";
import { validateTask } from "../utils/validation";
import { useToast } from "../context/ToastContext";

export default function TaskPicker({
  isOpen,
  onClose,
  alreadyLinkedTaskIds = [],
  onLinkTasks,
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTaskValues, setNewTaskValues] = useState({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    assignee: "",
    dueDate: "",
  });
  const [newTaskErrors, setNewTaskErrors] = useState({});
  const [savingTask, setSavingTask] = useState(false);
  const { success, error } = useToast();

  // Load tasks on modal open or search change
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setSearch("");
      return;
    }

    let active = true;
    setLoading(true);

    getTasks({ search: debouncedSearch, limit: 20 })
      .then((res) => {
        if (active) {
          setTasks(res.data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load tasks for picker", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, debouncedSearch]);

  const toggleSelect = (id) => {
    if (alreadyLinkedTaskIds.includes(id)) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLinkSelected = () => {
    if (selectedIds.length === 0) return;
    onLinkTasks(selectedIds);
  };

  // Handle Create New Task
  const handleSaveNewTask = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateTask(newTaskValues);
    if (!isValid) {
      setNewTaskErrors(errors);
      return;
    }

    setSavingTask(true);
    try {
      const res = await createTask(newTaskValues);
      const created = res.data;
      success(`Task "${created.title}" created!`);
      setCreateModalOpen(false);
      setNewTaskValues({
        title: "",
        description: "",
        status: "Todo",
        priority: "Medium",
        assignee: "",
        dueDate: "",
      });
      setNewTaskErrors({});
      // Add to tasks list and auto-select
      setTasks((prev) => [created, ...prev]);
      setSelectedIds((prev) => [...prev, created._id]);
    } catch (err) {
      if (err.fieldErrors) {
        setNewTaskErrors(err.fieldErrors);
      } else {
        error(err.message || "Failed to create task");
      }
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !createModalOpen}
        onClose={onClose}
        title="LINK TASKS"
        maxWidth={600}
      >
        {/* Search Bar & Create Trigger */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <Search
              size={18}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by title..."
              style={{
                width: "100%",
                height: "44px",
                padding: "0 12px 0 40px",
                fontSize: "15px",
                fontWeight: 600,
                border: "3px solid var(--ink)",
                borderRadius: "8px",
                backgroundColor: "var(--white)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--ink-70)",
              }}
            >
              Select tasks to link:
            </span>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                color: "var(--blue)",
                cursor: "pointer",
              }}
            >
              <Plus size={15} strokeWidth={3} />
              <span>Create new task</span>
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div
          style={{
            maxHeight: "340px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "20px",
            paddingRight: "4px",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                fontWeight: 700,
                color: "var(--ink-70)",
              }}
            >
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                fontWeight: 700,
                color: "var(--ink-70)",
              }}
            >
              No matching tasks found.
            </div>
          ) : (
            tasks.map((task) => {
              const isAlreadyLinked = alreadyLinkedTaskIds.includes(task._id);
              const isSelected = selectedIds.includes(task._id);

              return (
                <div
                  key={task._id}
                  className={`task-picker-row ${isAlreadyLinked ? "is-linked" : "is-available"}`}
                  onClick={() => toggleSelect(task._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    border: "2px solid var(--ink)",
                    borderRadius: "6px",
                    backgroundColor: isAlreadyLinked
                      ? "var(--paper)"
                      : isSelected
                      ? "#fff9d2"
                      : "var(--white)",
                    cursor: isAlreadyLinked ? "not-allowed" : "pointer",
                    opacity: isAlreadyLinked ? 0.6 : 1,
                    transition: "background-color var(--ease)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* Square Checkbox (3px ink border) */}
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        border: "3px solid var(--ink)",
                        backgroundColor: isSelected ? "var(--ink)" : "var(--white)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                      marginLeft: "12px",
                    }}
                  >
                    {isAlreadyLinked ? (
                      <span className="pill pill-paper-dashed">
                        <span className="pill-dot" />
                        <span>LINKED</span>
                      </span>
                    ) : (
                      <>
                        <StatusBadge status={task.status} type="task" />
                        <StatusBadge status={task.priority} type="priority" />
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
            borderTop: "2px dashed var(--ink-30)",
            paddingTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-white press"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLinkSelected}
            disabled={selectedIds.length === 0}
            className="btn btn-red press"
          >
            Link Selected ({selectedIds.length})
          </button>
        </div>
      </Modal>

      {/* Secondary Modal: Create New Task */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="CREATE NEW TASK"
        maxWidth={520}
      >
        <form onSubmit={handleSaveNewTask}>
          <TaskFormFields
            values={newTaskValues}
            onChange={setNewTaskValues}
            fieldErrors={newTaskErrors}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "16px",
              borderTop: "2px dashed var(--ink-30)",
              paddingTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn btn-white press"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingTask}
              className="btn btn-red press"
            >
              {savingTask ? <span className="spinner" /> : "Save & Link"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
