import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../components/PageHeader";
import TaskFormFields from "../components/TaskFormFields";
import ErrorMessage from "../components/ErrorMessage";
import { getTask, createTask, updateTask } from "../api/client";
import { toInputDate } from "../utils/format";
import { validateTask } from "../utils/validation";
import { useToast } from "../context/ToastContext";

export default function TaskForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [initialError, setInitialError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const TASK_DRAFT_KEY = "decisionlog_draft_new_task";

  const getInitialValues = () => {
    if (!isEdit) {
      try {
        const saved = localStorage.getItem(TASK_DRAFT_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      title: "",
      description: "",
      status: "Todo",
      priority: "Medium",
      assignee: "",
      dueDate: "",
    };
  };

  const [values, setValues] = useState(getInitialValues);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => !isEdit && Boolean(localStorage.getItem(TASK_DRAFT_KEY)));

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    document.title = isEdit
      ? "Edit Task · DecisionLog"
      : "New Task · DecisionLog";
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    setLoadingInitial(true);
    getTask(id)
      .then((res) => {
        const t = res.data;
        setValues({
          title: t.title || "",
          description: t.description || "",
          status: t.status || "Todo",
          priority: t.priority || "Medium",
          assignee: t.assignee || "",
          dueDate: toInputDate(t.dueDate) || "",
        });
      })
      .catch((err) => {
        setInitialError(err.message || "Failed to load task");
      })
      .finally(() => setLoadingInitial(false));
  }, [id, isEdit]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Auto-save new task draft to localStorage
  useEffect(() => {
    if (!isEdit && isDirty) {
      try {
        localStorage.setItem(TASK_DRAFT_KEY, JSON.stringify(values));
      } catch (e) {
        // ignore
      }
    }
  }, [values, isEdit, isDirty]);

  const handleClearDraft = () => {
    localStorage.removeItem(TASK_DRAFT_KEY);
    setHasRestoredDraft(false);
    setIsDirty(false);
    setValues({
      title: "",
      description: "",
      status: "Todo",
      priority: "Medium",
      assignee: "",
      dueDate: "",
    });
    setFieldErrors({});
    success("Task draft cleared.");
  };

  const handleFieldChange = (newValues) => {
    setIsDirty(true);
    setValues(newValues);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const { isValid, errors } = validateTask(values);
    if (!isValid) {
      setFieldErrors(errors);
      error("Please fix the validation errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        await updateTask(id, values);
        setIsDirty(false);
        success("Task updated successfully!");
        navigate("/tasks");
      } else {
        await createTask(values);
        setIsDirty(false);
        localStorage.removeItem(TASK_DRAFT_KEY);
        success("Task created successfully!");
        navigate("/tasks");
      }
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        error(err.message || "Failed to save task.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <main id="main-content" className="container" style={{ padding: "48px 16px" }}>
        <div
          className="skeleton"
          style={{ height: "400px", maxWidth: "680px", margin: "0 auto", borderRadius: "12px" }}
        />
      </main>
    );
  }

  if (initialError) {
    return (
      <main id="main-content" className="container" style={{ padding: "48px 16px" }}>
        <ErrorMessage message={initialError} />
      </main>
    );
  }

  return (
    <main id="main-content" style={{ flex: 1, paddingBottom: "80px" }}>
      <PageHeader
        eyebrow={isEdit ? "MODIFY" : "NEW RECORD"}
        title={isEdit ? "EDIT TASK" : "CREATE TASK"}
        subtitle="Manage sprint actions and track deliverables linked to decisions."
      />

      <div className="container" style={{ marginTop: "32px" }}>
        <form
          onSubmit={handleSubmit}
          className="panel"
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            backgroundColor: "var(--white)",
            padding: "36px 32px 40px",
          }}
          noValidate
        >
          {/* Back link */}
          <div style={{ marginBottom: "20px" }}>
            <Link
              to="/tasks"
              className="btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <ArrowLeft size={16} strokeWidth={3} />
              <span>Back to Tasks</span>
            </Link>
          </div>

          {/* Draft Restored Banner */}
          {hasRestoredDraft && !isEdit && (
            <div
              className="panel"
              style={{
                backgroundColor: "var(--yellow)",
                padding: "12px 16px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <span>💾 Draft auto-saved! Your inputs are preserved across page reloads.</span>
              <button
                type="button"
                onClick={handleClearDraft}
                className="btn-ghost"
                style={{
                  fontSize: "12px",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                Reset form
              </button>
            </div>
          )}

          {/* Reusable Form Fields */}
          <TaskFormFields
            values={values}
            onChange={handleFieldChange}
            fieldErrors={fieldErrors}
          />

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "14px",
              borderTop: "2px solid var(--ink)",
              paddingTop: "24px",
              marginTop: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              disabled={isSaving}
              className="btn btn-white press"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-red press"
              style={{ minWidth: "140px" }}
            >
              {isSaving ? (
                <span className="spinner" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
