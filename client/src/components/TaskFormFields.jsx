import React from "react";

export default function TaskFormFields({
  values,
  onChange,
  fieldErrors = {},
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...values, [name]: value });
  };

  return (
    <div>
      {/* Title */}
      <div className={`field ${fieldErrors.title ? "has-error" : ""}`}>
        <label htmlFor="task-title">
          <span>Task Title *</span>
          <span className="field-hint">3–150 chars</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          value={values.title || ""}
          onChange={handleChange}
          placeholder="e.g. Migrate user authentication schema"
          required
        />
        {fieldErrors.title && (
          <div className="field-error" aria-live="polite">
            <span className="field-error-icon">!</span>
            <span>{fieldErrors.title}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className={`field ${fieldErrors.description ? "has-error" : ""}`}>
        <label htmlFor="task-description">
          <span>Description</span>
          <span className="char-counter">
            {(values.description || "").length} / 2000
          </span>
        </label>
        <textarea
          id="task-description"
          name="description"
          rows={3}
          value={values.description || ""}
          onChange={handleChange}
          placeholder="What needs to be done for this task?"
        />
        {fieldErrors.description && (
          <div className="field-error" aria-live="polite">
            <span className="field-error-icon">!</span>
            <span>{fieldErrors.description}</span>
          </div>
        )}
      </div>

      {/* Status & Priority Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <div className={`field ${fieldErrors.status ? "has-error" : ""}`}>
          <label htmlFor="task-status">Status</label>
          <select
            id="task-status"
            name="status"
            value={values.status || "Todo"}
            onChange={handleChange}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          {fieldErrors.status && (
            <div className="field-error" aria-live="polite">
              <span className="field-error-icon">!</span>
              <span>{fieldErrors.status}</span>
            </div>
          )}
        </div>

        <div className={`field ${fieldErrors.priority ? "has-error" : ""}`}>
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            name="priority"
            value={values.priority || "Medium"}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {fieldErrors.priority && (
            <div className="field-error" aria-live="polite">
              <span className="field-error-icon">!</span>
              <span>{fieldErrors.priority}</span>
            </div>
          )}
        </div>
      </div>

      {/* Assignee & Due Date Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <div className={`field ${fieldErrors.assignee ? "has-error" : ""}`}>
          <label htmlFor="task-assignee">Assignee</label>
          <input
            id="task-assignee"
            name="assignee"
            type="text"
            value={values.assignee || ""}
            onChange={handleChange}
            placeholder="Assignee name"
          />
          {fieldErrors.assignee && (
            <div className="field-error" aria-live="polite">
              <span className="field-error-icon">!</span>
              <span>{fieldErrors.assignee}</span>
            </div>
          )}
        </div>

        <div className={`field ${fieldErrors.dueDate ? "has-error" : ""}`}>
          <label htmlFor="task-dueDate">Due Date</label>
          <input
            id="task-dueDate"
            name="dueDate"
            type="date"
            value={values.dueDate || ""}
            onChange={handleChange}
          />
          {fieldErrors.dueDate && (
            <div className="field-error" aria-live="polite">
              <span className="field-error-icon">!</span>
              <span>{fieldErrors.dueDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
