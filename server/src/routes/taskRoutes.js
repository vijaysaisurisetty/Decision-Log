import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";
import {
  taskIdParamValidator,
  listTasksQueryValidator,
  createTaskValidator,
  updateTaskValidator
} from "../validators/taskValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.get("/", listTasksQueryValidator, validate, getTasks);
router.get("/:id", taskIdParamValidator, validate, getTaskById);
router.post("/", createTaskValidator, validate, createTask);
router.put("/:id", updateTaskValidator, validate, updateTask);
router.delete("/:id", taskIdParamValidator, validate, deleteTask);

export default router;

