import { body, param, query } from "express-validator";
import { stripTags } from "../utils/sanitize.js";

const VALID_STATUSES = ["Todo", "In Progress", "Done"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];
const VALID_SORT_FIELDS = ["createdAt", "dueDate", "title", "priority"];
const VALID_ORDERS = ["asc", "desc"];

export const taskIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid task ID")
];

export const listTasksQueryValidator = [
  query("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
  query("priority")
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`),
  query("search")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Search term cannot exceed 100 characters"),
  query("unlinked")
    .optional()
    .isIn(["true", "false"])
    .withMessage("unlinked query param must be 'true' or 'false'"),
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

export const createTaskValidator = [
  body("title")
    .customSanitizer(stripTags)
    .isString()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be 3-150 characters"),
  body("description")
    .optional()
    .customSanitizer(stripTags)
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
  body("priority")
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`),
  body("assignee")
    .optional()
    .customSanitizer(stripTags)
    .isLength({ max: 100 })
    .withMessage("Assignee cannot exceed 100 characters"),
  body("dueDate")
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === "") return true;
      if (isNaN(new Date(val).getTime())) {
        throw new Error("Due date must be a valid ISO date");
      }
      return true;
    })
];

export const updateTaskValidator = [
  ...taskIdParamValidator,
  ...createTaskValidator
];

export default {
  taskIdParamValidator,
  listTasksQueryValidator,
  createTaskValidator,
  updateTaskValidator
};

