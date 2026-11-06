import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, X, ArrowLeft } from "lucide-react";
import PageHeader from "../components/PageHeader";
import OptionsEditor from "../components/OptionsEditor";
import Switch from "../components/Switch";
import ErrorMessage from "../components/ErrorMessage";
import {
  getDecision,
  createDecision,
  updateDecision,
} from "../api/client";
import { toInputDate } from "../utils/format";
import { validateDecision } from "../utils/validation";
import { useToast } from "../context/ToastContext";

export default function DecisionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [initialError, setInitialError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form state
  const defaultDate = toInputDate(new Date());
  const defaultReviewDate = toInputDate(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  );

  const DRAFT_KEY = "decisionlog_draft_new_decision";

  const getInitialValues = () => {
    if (!isEdit) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          return {
            ...parsed,
            decisionDate: parsed.decisionDate || defaultDate,
            reviewDate: parsed.reviewDate || defaultReviewDate,
            options:
              Array.isArray(parsed.options) && parsed.options.length >= 2
                ? parsed.options
                : [
                    { name: "", description: "", pros: [], cons: [] },
                    { name: "", description: "", pros: [], cons: [] },
                  ],
            tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          };
        }
      } catch (e) {
        // ignore draft parse error
      }
    }
    return {
      title: "",
      context: "",
      options: [
        { name: "", description: "", pros: [], cons: [] },
        { name: "", description: "", pros: [], cons: [] },
      ],
      chosenOption: "",
      rationale: "",
      status: "Accepted",
      decidedBy: "",
      decisionDate: defaultDate,
      reviewDate: defaultReviewDate,
      tags: [],
      needsReconsideration: false,
      reason: "",
    };
  };

  const [values, setValues] = useState(getInitialValues);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => !isEdit && Boolean(localStorage.getItem(DRAFT_KEY)));

  const [tagInput, setTagInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const formRef = useRef(null);

  // Set document title
  useEffect(() => {
    document.title = isEdit
      ? "Edit Decision · DecisionLog"
      : "New Decision · DecisionLog";
  }, [isEdit]);

  // Load decision if in edit mode
  useEffect(() => {
    if (!isEdit) return;
    setLoadingInitial(true);
    getDecision(id)
      .then((res) => {
        const d = res.data;
        setValues({
          title: d.title || "",
          context: d.context || "",
          options:
            d.options && d.options.length >= 2
              ? d.options
              : [
                  { name: "", description: "", pros: [], cons: [] },
                  { name: "", description: "", pros: [], cons: [] },
                ],
          chosenOption: d.chosenOption || "",
          rationale: d.rationale || "",
          status: d.status || "Accepted",
          decidedBy: d.decidedBy || "",
          decisionDate: toInputDate(d.decisionDate) || defaultDate,
          reviewDate: toInputDate(d.reviewDate) || defaultReviewDate,
          tags: d.tags || [],
          needsReconsideration: Boolean(d.needsReconsideration),
          reason: d.flagReason || "",
        });
      })
      .catch((err) => {
        setInitialError(err.message || "Failed to load decision");
      })
      .finally(() => setLoadingInitial(false));
  }, [id, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save new decision draft to localStorage
  useEffect(() => {
    if (!isEdit && isDirty) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch (e) {
        // ignore quota errors
      }
    }
  }, [values, isEdit, isDirty]);

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasRestoredDraft(false);
    setIsDirty(false);
    setValues({
      title: "",
      context: "",
      options: [
        { name: "", description: "", pros: [], cons: [] },
        { name: "", description: "", pros: [], cons: [] },
      ],
      chosenOption: "",
      rationale: "",
      status: "Accepted",
      decidedBy: "",
      decisionDate: defaultDate,
      reviewDate: defaultReviewDate,
      tags: [],
      needsReconsideration: false,
      reason: "",
    });
    setFieldErrors({});
    success("Draft cleared.");
  };

  // Warn on unsaved changes beforeunload
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

  // Handle generic field change
  const handleChange = (field, val) => {
    setIsDirty(true);
    setValues((prev) => {
      const updated = { ...prev, [field]: val };
      // If decisionDate changes, default reviewDate to decisionDate + 90 days if not touched
      if (field === "decisionDate" && !touched.reviewDate) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          updated.reviewDate = toInputDate(
            new Date(d.getTime() + 90 * 24 * 60 * 60 * 1000)
          );
        }
      }
      return updated;
    });

    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle blur validation
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { errors } = validateDecision(values);
    if (errors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }));
    }
  };

  // Handle Options change from OptionsEditor
  const handleOptionsChange = (updatedOptions) => {
    setIsDirty(true);
    const validNames = updatedOptions
      .map((o) => (o.name || "").trim())
      .filter(Boolean);

    setValues((prev) => {
      let chosen = prev.chosenOption;
      if (chosen && !validNames.includes(chosen)) {
        chosen = "";
      }
      return {
        ...prev,
        options: updatedOptions,
        chosenOption: chosen,
      };
    });

    if (fieldErrors.options || fieldErrors.chosenOption) {
      setFieldErrors((prev) => ({
        ...prev,
        options: undefined,
        chosenOption: undefined,
      }));
    }
  };

  // Tags management
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !tagInput && values.tags.length > 0) {
      removeTag(values.tags.length - 1);
    }
  };

  const addTag = () => {
    const raw = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (!raw) return;
    if (values.tags.includes(raw)) {
      setTagInput("");
      return;
    }
    if (values.tags.length >= 10) return;
    handleChange("tags", [...values.tags, raw]);
    setTagInput("");
  };

  const removeTag = (idx) => {
    handleChange(
      "tags",
      values.tags.filter((_, i) => i !== idx)
    );
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const { isValid, errors } = validateDecision(values);
    if (!isValid) {
      setFieldErrors(errors);
      // Focus and scroll to first invalid field
      const firstKey = Object.keys(errors)[0];
      if (formRef.current) {
        const errorEl = formRef.current.querySelector(
          `[name="${firstKey}"], #${firstKey}, .has-error input, .has-error textarea`
        );
        if (errorEl) {
          errorEl.focus();
          errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      error("Please fix the validation errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        const res = await updateDecision(id, values);
        setIsDirty(false);
        success("Decision updated successfully!");
        navigate(`/decisions/${res.data._id}`);
      } else {
        const res = await createDecision(values);
        setIsDirty(false);
        localStorage.removeItem(DRAFT_KEY);
        success("Decision created successfully!");
        navigate(`/decisions/${res.data._id}`);
      }
    } catch (err) {
      if (err.status === 409) {
        setFieldErrors((prev) => ({
          ...prev,
          title: "A decision with this exact title already exists.",
        }));
        const titleEl = document.getElementById("dec-title");
        if (titleEl) titleEl.focus();
      } else if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        error(err.message || "Failed to save decision.");
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
          style={{ height: "600px", maxWidth: "820px", margin: "0 auto", borderRadius: "12px" }}
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

  const optionNames = values.options
    .map((o) => (o.name || "").trim())
    .filter(Boolean);

  return (
    <main id="main-content" style={{ flex: 1, paddingBottom: "80px" }}>
      <PageHeader
        eyebrow={isEdit ? "MODIFY" : "NEW RECORD"}
        title={isEdit ? "EDIT DECISION" : "LOG A DECISION"}
        subtitle="Document technical choices, alternatives considered, rationale and review timing."
      />

      <div className="container" style={{ marginTop: "32px" }}>
        {/* Centered Panel (max-width 820px) */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="panel"
          style={{
            maxWidth: "820px",
            margin: "0 auto",
            backgroundColor: "var(--white)",
            padding: "36px 32px 40px",
          }}
          noValidate
        >
          {/* Back link */}
          <div style={{ marginBottom: "20px" }}>
            <Link
              to={isEdit ? `/decisions/${id}` : "/decisions"}
              className="btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <ArrowLeft size={16} strokeWidth={3} />
              <span>Back</span>
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

          {/* SECTION 1: BASICS */}
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                letterSpacing: "-0.01em",
                marginBottom: "20px",
                color: "var(--ink)",
              }}
            >
              BASICS
            </h2>

            {/* Title */}
            <div className={`field ${fieldErrors.title ? "has-error" : ""}`}>
              <label htmlFor="dec-title">
                <span>Decision Title *</span>
                <span className="char-counter">
                  {(values.title || "").length} / 150
                </span>
              </label>
              <input
                id="dec-title"
                name="title"
                type="text"
                value={values.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                onBlur={() => handleBlur("title")}
                placeholder="e.g. Choose MongoDB Atlas as Primary Application Store"
                required
              />
              {fieldErrors.title && (
                <div className="field-error" aria-live="polite">
                  <span className="field-error-icon">!</span>
                  <span>{fieldErrors.title}</span>
                </div>
              )}
            </div>

            {/* Decided By & Status Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              <div className={`field ${fieldErrors.decidedBy ? "has-error" : ""}`}>
                <label htmlFor="dec-decidedBy">
                  <span>Decided By *</span>
                  <span className="field-hint">Person or Team</span>
                </label>
                <input
                  id="dec-decidedBy"
                  name="decidedBy"
                  type="text"
                  value={values.decidedBy || ""}
                  onChange={(e) => handleChange("decidedBy", e.target.value)}
                  onBlur={() => handleBlur("decidedBy")}
                  placeholder="e.g. Architecture Team / Marcus"
                  required
                />
                {fieldErrors.decidedBy && (
                  <div className="field-error" aria-live="polite">
                    <span className="field-error-icon">!</span>
                    <span>{fieldErrors.decidedBy}</span>
                  </div>
                )}
              </div>

              <div className={`field ${fieldErrors.status ? "has-error" : ""}`}>
                <label htmlFor="dec-status">Status *</label>
                <select
                  id="dec-status"
                  name="status"
                  value={values.status || "Accepted"}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Proposed">Proposed</option>
                  <option value="Superseded">Superseded</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
                {fieldErrors.status && (
                  <div className="field-error" aria-live="polite">
                    <span className="field-error-icon">!</span>
                    <span>{fieldErrors.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dashed ink-30 divider */}
          <div style={{ borderTop: "2px dashed var(--ink-30)", margin: "32px 0" }} />

          {/* SECTION 2: CONTEXT */}
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                letterSpacing: "-0.01em",
                marginBottom: "20px",
                color: "var(--ink)",
              }}
            >
              CONTEXT
            </h2>

            <div className={`field ${fieldErrors.context ? "has-error" : ""}`}>
              <label htmlFor="dec-context">
                <span>Context and Background *</span>
                <span className="char-counter">
                  {(values.context || "").length} / 3000
                </span>
              </label>
              <textarea
                id="dec-context"
                name="context"
                rows={4}
                value={values.context || ""}
                onChange={(e) => handleChange("context", e.target.value)}
                onBlur={() => handleBlur("context")}
                placeholder="What situation or problem forced this architectural decision?"
                required
              />
              {fieldErrors.context && (
                <div className="field-error" aria-live="polite">
                  <span className="field-error-icon">!</span>
                  <span>{fieldErrors.context}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dashed ink-30 divider */}
          <div style={{ borderTop: "2px dashed var(--ink-30)", margin: "32px 0" }} />

          {/* SECTION 3: OPTIONS CONSIDERED */}
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                letterSpacing: "-0.01em",
                marginBottom: "20px",
                color: "var(--ink)",
              }}
            >
              OPTIONS CONSIDERED
            </h2>

            {fieldErrors.options && (
              <div
                className="field-error"
                style={{ marginBottom: "16px" }}
                aria-live="polite"
              >
                <span className="field-error-icon">!</span>
                <span>{fieldErrors.options}</span>
              </div>
            )}

            <OptionsEditor
              options={values.options}
              onChange={handleOptionsChange}
              fieldErrors={fieldErrors}
            />
          </div>

          {/* Dashed ink-30 divider */}
          <div style={{ borderTop: "2px dashed var(--ink-30)", margin: "32px 0" }} />

          {/* SECTION 4: THE DECISION */}
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                letterSpacing: "-0.01em",
                marginBottom: "20px",
                color: "var(--ink)",
              }}
            >
              THE DECISION
            </h2>

            {/* Chosen Option Select */}
            <div className={`field ${fieldErrors.chosenOption ? "has-error" : ""}`}>
              <label htmlFor="dec-chosenOption">
                <span>Chosen Approach *</span>
                <span className="field-hint">Must match one of the options</span>
              </label>
              <select
                id="dec-chosenOption"
                name="chosenOption"
                value={values.chosenOption || ""}
                onChange={(e) => handleChange("chosenOption", e.target.value)}
                onBlur={() => handleBlur("chosenOption")}
                required
              >
                <option value="">-- Select chosen option --</option>
                {optionNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {fieldErrors.chosenOption && (
                <div className="field-error" aria-live="polite">
                  <span className="field-error-icon">!</span>
                  <span>{fieldErrors.chosenOption}</span>
                </div>
              )}
            </div>

            {/* Rationale */}
            <div className={`field ${fieldErrors.rationale ? "has-error" : ""}`}>
              <label htmlFor="dec-rationale">
                <span>Rationale *</span>
                <span className="char-counter">
                  {(values.rationale || "").length} / 3000
                </span>
              </label>
              <textarea
                id="dec-rationale"
                name="rationale"
                rows={4}
                value={values.rationale || ""}
                onChange={(e) => handleChange("rationale", e.target.value)}
                onBlur={() => handleBlur("rationale")}
                placeholder="Why was this option chosen over the other alternatives?"
                required
              />
              {fieldErrors.rationale && (
                <div className="field-error" aria-live="polite">
                  <span className="field-error-icon">!</span>
                  <span>{fieldErrors.rationale}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dashed ink-30 divider */}
          <div style={{ borderTop: "2px dashed var(--ink-30)", margin: "32px 0" }} />

          {/* SECTION 5: REVIEW AND TAGS */}
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                letterSpacing: "-0.01em",
                marginBottom: "20px",
                color: "var(--ink)",
              }}
            >
              REVIEW AND TAGS
            </h2>

            {/* Decision Date and Review Date */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              <div className={`field ${fieldErrors.decisionDate ? "has-error" : ""}`}>
                <label htmlFor="dec-decisionDate">
                  <span>Decision Date *</span>
                </label>
                <input
                  id="dec-decisionDate"
                  name="decisionDate"
                  type="date"
                  value={values.decisionDate || ""}
                  onChange={(e) => handleChange("decisionDate", e.target.value)}
                  required
                />
                {fieldErrors.decisionDate && (
                  <div className="field-error" aria-live="polite">
                    <span className="field-error-icon">!</span>
                    <span>{fieldErrors.decisionDate}</span>
                  </div>
                )}
              </div>

              <div className={`field ${fieldErrors.reviewDate ? "has-error" : ""}`}>
                <label htmlFor="dec-reviewDate">
                  <span>Review Date *</span>
                  <span className="field-hint">≥ Decision Date</span>
                </label>
                <input
                  id="dec-reviewDate"
                  name="reviewDate"
                  type="date"
                  min={values.decisionDate}
                  value={values.reviewDate || ""}
                  onChange={(e) => handleChange("reviewDate", e.target.value)}
                  onBlur={() => handleBlur("reviewDate")}
                  required
                />
                {fieldErrors.reviewDate && (
                  <div className="field-error" aria-live="polite">
                    <span className="field-error-icon">!</span>
                    <span>{fieldErrors.reviewDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags Input */}
            <div className={`field ${fieldErrors.tags ? "has-error" : ""}`}>
              <label htmlFor="dec-tags">
                <span>Tags</span>
                <span className="field-hint">
                  {values.tags.length}/10 · Press Enter or comma to add
                </span>
              </label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 10px",
                  backgroundColor: "var(--white)",
                  border: "3px solid var(--ink)",
                  borderRadius: "8px",
                  minHeight: "44px",
                }}
              >
                {values.tags.map((tag, idx) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "var(--paper)",
                      border: "2px solid var(--ink)",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "12px",
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--red)",
                        display: "flex",
                        padding: 0,
                      }}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}

                {values.tags.length < 10 && (
                  <input
                    id="dec-tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                    placeholder={
                      values.tags.length === 0 ? "database, auth, cache..." : ""
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      padding: "4px",
                      fontSize: "14px",
                      fontWeight: 600,
                      flex: 1,
                      minWidth: "120px",
                      boxShadow: "none",
                      height: "auto",
                    }}
                  />
                )}
              </div>
              {fieldErrors.tags && (
                <div className="field-error" aria-live="polite">
                  <span className="field-error-icon">!</span>
                  <span>{fieldErrors.tags}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dashed ink-30 divider */}
          <div style={{ borderTop: "2px dashed var(--ink-30)", margin: "32px 0" }} />

          {/* SECTION 6: RECONSIDERATION (OPTIONAL) */}
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                letterSpacing: "-0.01em",
                marginBottom: "20px",
                color: "var(--ink)",
              }}
            >
              RECONSIDERATION (OPTIONAL)
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontWeight: 800,
                    fontSize: "14px",
                    color: "var(--ink)",
                  }}
                >
                  Flag as Needs Reconsideration
                </span>
                <p style={{ fontSize: "12px", color: "var(--ink-70)", margin: 0 }}>
                  Mark this decision as needing urgent team re-evaluation.
                </p>
              </div>

              <Switch
                checked={values.needsReconsideration}
                onChange={(checked) => handleChange("needsReconsideration", checked)}
                variant="red"
                ariaLabel="Toggle reconsideration flag"
              />
            </div>

            {values.needsReconsideration && (
              <div className={`field ${fieldErrors.reason ? "has-error" : ""}`}>
                <label htmlFor="dec-reason">
                  <span>Reason for Reconsideration *</span>
                  <span className="field-hint">Min 5 chars</span>
                </label>
                <textarea
                  id="dec-reason"
                  name="reason"
                  rows={3}
                  value={values.reason || ""}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  onBlur={() => handleBlur("reason")}
                  placeholder="Explain why this decision needs another look..."
                  required
                />
                {fieldErrors.reason && (
                  <div className="field-error" aria-live="polite">
                    <span className="field-error-icon">!</span>
                    <span>{fieldErrors.reason}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Form Actions */}
          <div
            className="form-actions-desktop"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "14px",
              borderTop: "2px solid var(--ink)",
              paddingTop: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/decisions/${id}` : "/decisions")}
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
                "Create Decision"
              )}
            </button>
          </div>

          {/* Mobile Sticky Bottom Action Bar */}
          <div
            className="form-actions-mobile"
            style={{
              display: "none",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "var(--white)",
              borderTop: "3px solid var(--ink)",
              boxShadow: "0 -4px 0 var(--ink)",
              padding: "12px 16px",
              zIndex: 90,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/decisions/${id}` : "/decisions")}
              disabled={isSaving}
              className="btn btn-white press"
              style={{ flex: 1, marginRight: "10px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-red press"
              style={{ flex: 1 }}
            >
              {isSaving ? <span className="spinner" /> : isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 650px) {
          .form-actions-desktop {
            display: none !important;
          }
          .form-actions-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </main>
  );
}
