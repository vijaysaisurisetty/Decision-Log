import Task from "../models/Task.js";
import Decision from "../models/Decision.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getTasks = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    search,
    unlinked,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 10
  } = req.query;

  const conditions = [];

  if (status) {
    conditions.push({ status });
  }

  if (priority) {
    conditions.push({ priority });
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    conditions.push({
      $or: [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { assignee: { $regex: escaped, $options: "i" } }
      ]
    });
  }

  if (unlinked !== undefined) {
    if (unlinked === "true") {
      conditions.push({
        $or: [
          { linkedDecisions: { $size: 0 } },
          { linkedDecisions: { $exists: false } }
        ]
      });
    } else {
      conditions.push({ "linkedDecisions.0": { $exists: true } });
    }
  }

  const filter = conditions.length > 0 ? { $and: conditions } : {};
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = order === "asc" ? 1 : -1;

  const total = await Task.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum) || (total === 0 ? 0 : 1);

  const tasks = await Task.find(filter)
    .populate("linkedDecisions", "title status")
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.json({
    success: true,
    data: tasks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    }
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("linkedDecisions", "title status reviewDate")
    .lean();

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  res.json({
    success: true,
    data: task
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const { linkedDecisions, ...allowedData } = req.body;

  const task = await Task.create(allowedData);

  res.status(201).json({
    success: true,
    data: task
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError(404, "Task not found");
  }

  const { linkedDecisions, _id, createdAt, updatedAt, ...allowedData } = req.body;

  Object.assign(task, allowedData);
  await task.save();

  await task.populate("linkedDecisions", "title status");

  res.json({
    success: true,
    data: task
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError(404, "Task not found");
  }

  // Remove references from decisions first
  await Decision.updateMany(
    { linkedTasks: req.params.id },
    { $pull: { linkedTasks: req.params.id } }
  );

  await Task.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Task deleted"
  });
});

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};

