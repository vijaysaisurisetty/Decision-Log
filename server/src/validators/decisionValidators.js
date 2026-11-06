import { body, param, query } from "express-validator";
import { stripTags } from "../utils/sanitize.js";

const VALID_STATUSES = ["Proposed", "Accepted", "Superseded", "Deprecated"];
const VALID_SORT_FIELDS = ["reviewDate", "decisionDate", "createdAt", "title"];
const VALID_ORDERS = ["asc", "desc"];

export const decisionIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid decision ID")
];

export const linkTaskParamsValidator = [
  param("id").isMongoId().withMessage("Invalid decision ID"),
  param("taskId").isMongoId().withMessage("Invalid task ID")
];

export const listDecisionsQueryValidator = [
  query("search")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Search term cannot exceed 100 characters"),
  query("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
  query("tag")
    .optional()
    .isString()
    .isLength({ min: 1, max: 30 })
    .withMessage("Tag must be 1 to 30 characters"),
  query("needsReconsideration")
    .optional()
    .isIn(["true", "false"])
    .withMessage("needsReconsideration query param must be 'true' or 'false'"),
  query("overdue")
    .optional()
    .isIn(["true", "false"])
    .withMessage("overdue query param must be 'true' or 'false'"),
  query("flagged")
    .optional()
    .isIn(["true", "false"])
    .withMessage("flagged query param must be 'true' or 'false'"),
  query("dueWithinDays")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("dueWithinDays must be an integer between 1 and 365"),
  query("sortBy")
    .optional()
    .isIn(VALID_SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${VALID_SORT_FIELDS.join(", ")}`),
  query("order")
    .optional()
    .isIn(VALID_ORDERS)
    .withMessage("order must be either 'asc' or 'desc'"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be an integer >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be an integer between 1 and 50")
];

export const createDecisionValidator = [
  body("title")
    .customSanitizer(stripTags)
    .isString()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be 3-150 characters"),
  body("context")
    .customSanitizer(stripTags)
    .isString()
    .withMessage("Context is required")
    .isLength({ min: 10, max: 3000 })
    .withMessage("Context must be 10-3000 characters"),
  body("options")
    .isArray()
    .withMessage("Add at least 2 options")
    .custom((val) => {
      if (!Array.isArray(val) || val.length < 2 || val.length > 10) {
        throw new Error("Add at least 2 options");
      }
      return true;
    })
    .custom((val) => {
      if (!Array.isArray(val)) return true;
      const names = val.map((o) => (o && o.name ? stripTags(o.name).toLowerCase() : ""));
      const uniqueNames = new Set(names);
      if (uniqueNames.size !== names.length) {
        throw new Error("Option names must be unique inside one decision");
      }
      return true;
    }),
  body("options.*.name")
    .customSanitizer(stripTags)
    .isString()
    .withMessage("Option name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Option name must be 1-100 characters"),
  body("options.*.description")
    .optional()
    .customSanitizer(stripTags)
    .isLength({ max: 1000 })
    .withMessage("Option description cannot exceed 1000 characters"),
  body("options.*.pros")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Option cannot have more than 10 pros"),
  body("options.*.pros.*")
    .customSanitizer(stripTags)
    .isLength({ min: 1, max: 300 })
    .withMessage("Each pro must be 1-300 characters"),
  body("options.*.cons")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Option cannot have more than 10 cons"),
  body("options.*.cons.*")
    .customSanitizer(stripTags)
    .isLength({ min: 1, max: 300 })
    .withMessage("Each con must be 1-300 characters"),
  body("chosenOption")
    .customSanitizer(stripTags)
    .isString()
    .withMessage("Chosen option is required")
    .custom((val, { req }) => {
      const trimmed = typeof val === "string" ? val.trim() : "";
      const options = req.body.options;
      if (!Array.isArray(options)) return true;
      const matched = options.some(
        (opt) => opt && typeof opt.name === "string" && stripTags(opt.name) === trimmed
      );
      if (!matched) {
        throw new Error("Chosen option must match one of the options");
      }
      return true;
    }),
  body("rationale")
    .customSanitizer(stripTags)
    .isString()
    .withMessage("Rationale is required")
    .isLength({ min: 10, max: 3000 })
    .withMessage("Rationale must be 10-3000 characters"),
  body("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
  body("decidedBy")
    .customSanitizer(stripTags)
    .isString()
    .withMessage("Decided by is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Decided by must be 2-100 characters"),
  body("decisionDate")
    .optional()
    .isISO8601()
    .withMessage("Decision date must be a valid ISO date"),
  body("reviewDate")
    .notEmpty()
    .withMessage("Review date is required")
    .isISO8601()
    .withMessage("Review date must be a valid ISO date")
    .custom((val, { req }) => {
      const decDate = req.body.decisionDate ? new Date(req.body.decisionDate) : new Date();
      if (new Date(val).getTime() < decDate.getTime()) {
        throw new Error("Review date cannot be before the decision date");
      }
      return true;
    }),
  body("needsReconsideration")
    .optional()
    .isBoolean()
    .withMessage("needsReconsideration must be a boolean"),
  body("reconsiderationReason")
    .optional()
    .customSanitizer(stripTags)
    .custom((val, { req }) => {
      if (req.body.needsReconsideration) {
        if (!val || typeof val !== "string" || val.trim().length < 5) {
          throw new Error("Reason is required when marking for reconsideration");
        }
      }
      if (val && val.length > 1000) {
        throw new Error("Reconsideration reason cannot exceed 1000 characters");
      }
      return true;
    }),
  body("tags")
    .optional()
    .isArray({ max: 10 })
    .withMessage("A decision can have at most 10 tags"),
  body("tags.*")
    .customSanitizer(stripTags)
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters")
];

export const updateDecisionValidator = [
  ...decisionIdParamValidator,
  ...createDecisionValidator
];

export const patchReconsiderValidator = [
  ...decisionIdParamValidator,
  body("needsReconsideration")
    .isBoolean()
    .withMessage("needsReconsideration must be a boolean"),
  body("reason")
    .optional()
    .customSanitizer(stripTags)
    .custom((val, { req }) => {
      if (req.body.needsReconsideration) {
        if (!val || typeof val !== "string" || val.trim().length < 5) {
          throw new Error("Reason is required when marking for reconsideration");
        }
        if (val.trim().length > 1000) {
          throw new Error("Reason cannot exceed 1000 characters");
        }
      }
      return true;
    })
];

export default {
  decisionIdParamValidator,
  linkTaskParamsValidator,
  listDecisionsQueryValidator,
  createDecisionValidator,
  updateDecisionValidator,
  patchReconsiderValidator
};

