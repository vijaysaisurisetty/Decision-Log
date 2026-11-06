export const validateDecision = (values) => {
  const errors = {};

  // Title
  const title = (values.title || "").trim();
  if (!title) {
    errors.title = "Title is required";
  } else if (title.length < 3 || title.length > 150) {
    errors.title = "Title must be 3-150 characters";
  }

  // Context
  const context = (values.context || "").trim();
  if (!context) {
    errors.context = "Context is required";
  } else if (context.length < 10 || context.length > 3000) {
    errors.context = "Context must be 10-3000 characters";
  }

  // Options
  const options = Array.isArray(values.options) ? values.options : [];
  if (options.length < 2) {
    errors.options = "Add at least 2 options";
  } else if (options.length > 10) {
    errors.options = "Options cannot exceed 10";
  }

  const optionNames = [];
  options.forEach((opt, idx) => {
    const optName = (opt?.name || "").trim();
    if (!optName) {
      errors[`options[${idx}].name`] = "Option name is required";
    } else if (optName.length > 100) {
      errors[`options[${idx}].name`] = "Option name cannot exceed 100 characters";
    }
    const lower = optName.toLowerCase();
    if (lower) {
      if (optionNames.includes(lower)) {
        errors.options = "Option names must be unique inside one decision";
      }
      optionNames.push(lower);
    }

    if (opt?.description && opt.description.length > 1000) {
      errors[`options[${idx}].description`] = "Option description cannot exceed 1000 characters";
    }
  });

  // Chosen option
  const chosenOption = (values.chosenOption || "").trim();
  if (!chosenOption) {
    errors.chosenOption = "Chosen option is required";
  } else {
    const hasMatch = options.some(
      (opt) => opt && (opt.name || "").trim() === chosenOption
    );
    if (!hasMatch) {
      errors.chosenOption = "Chosen option must match one of the options";
    }
  }

  // Rationale
  const rationale = (values.rationale || "").trim();
  if (!rationale) {
    errors.rationale = "Rationale is required";
  } else if (rationale.length < 10 || rationale.length > 3000) {
    errors.rationale = "Rationale must be 10-3000 characters";
  }

  // Decided By
  const decidedBy = (values.decidedBy || "").trim();
  if (!decidedBy) {
    errors.decidedBy = "Decided by is required";
  } else if (decidedBy.length < 2 || decidedBy.length > 100) {
    errors.decidedBy = "Decided by must be 2-100 characters";
  }

  // Dates
  const decisionDateStr = values.decisionDate;
  const reviewDateStr = values.reviewDate;

  if (!reviewDateStr) {
    errors.reviewDate = "Review date is required";
  } else {
    const decDate = decisionDateStr ? new Date(decisionDateStr) : new Date();
    const revDate = new Date(reviewDateStr);
    if (isNaN(revDate.getTime())) {
      errors.reviewDate = "Review date must be a valid ISO date";
    } else if (revDate.getTime() < decDate.getTime()) {
      errors.reviewDate = "Review date cannot be before the decision date";
    }
  }

  // Reconsideration
  if (values.needsReconsideration) {
    const reason = (values.reconsiderationReason || "").trim();
    if (!reason || reason.length < 5) {
      errors.reconsiderationReason = "Reason is required when marking for reconsideration";
    } else if (reason.length > 1000) {
      errors.reconsiderationReason = "Reconsideration reason cannot exceed 1000 characters";
    }
  }

  // Tags
  if (Array.isArray(values.tags)) {
    if (values.tags.length > 10) {
      errors.tags = "A decision can have at most 10 tags";
    }
    values.tags.forEach((tag, idx) => {
      if (typeof tag === "string" && (tag.length < 1 || tag.length > 30)) {
        errors.tags = "Each tag must be between 1 and 30 characters";
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTask = (values) => {
  const errors = {};

  const title = (values.title || "").trim();
  if (!title) {
    errors.title = "Title is required";
  } else if (title.length < 3 || title.length > 150) {
    errors.title = "Title must be 3-150 characters";
  }

  const description = (values.description || "").trim();
  if (description.length > 2000) {
    errors.description = "Description cannot exceed 2000 characters";
  }

  const assignee = (values.assignee || "").trim();
  if (assignee.length > 100) {
    errors.assignee = "Assignee cannot exceed 100 characters";
  }

  if (values.dueDate) {
    const d = new Date(values.dueDate);
    if (isNaN(d.getTime())) {
      errors.dueDate = "Due date must be a valid date";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateDecision,
  validateTask
};

