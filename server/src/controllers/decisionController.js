import Decision from "../models/Decision.js";
import Task from "../models/Task.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { startOfToday, endOfDay, addDays } from "../utils/dates.js";
import { withFlags } from "../utils/decisionFlags.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getDecisions = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    tag,
    needsReconsideration,
    overdue,
    flagged,
    dueWithinDays,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 10
  } = req.query;

  const conditions = [];
  const today = startOfToday();

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    conditions.push({
      $or: [
        { title: { $regex: escaped, $options: "i" } },
        { context: { $regex: escaped, $options: "i" } },
        { rationale: { $regex: escaped, $options: "i" } },
        { tags: { $regex: escaped, $options: "i" } }
      ]
    });
  }

  if (status) {
    conditions.push({ status });
  }

  if (tag) {
    conditions.push({ tags: tag.toLowerCase().trim() });
  }

  if (needsReconsideration !== undefined) {
    conditions.push({ needsReconsideration: needsReconsideration === "true" });
  }

  if (overdue !== undefined) {
    if (overdue === "true") {
      conditions.push({
        reviewDate: { $lt: today },
        status: { $in: ["Proposed", "Accepted"] }
      });
    } else {
      conditions.push({
        $or: [
          { reviewDate: { $gte: today } },
          { status: { $nin: ["Proposed", "Accepted"] } }
        ]
      });
    }
  }

  if (flagged !== undefined) {
    if (flagged === "true") {
      conditions.push({
        $or: [
          { needsReconsideration: true },
          {
            reviewDate: { $lt: today },
            status: { $in: ["Proposed", "Accepted"] }
          }
        ]
      });
    } else {
      conditions.push({
        needsReconsideration: false,
        $or: [
          { reviewDate: { $gte: today } },
          { status: { $nin: ["Proposed", "Accepted"] } }
        ]
      });
    }
  }

  if (dueWithinDays !== undefined) {
    const days = parseInt(dueWithinDays, 10);
    const targetEnd = endOfDay(addDays(today, days));
    conditions.push({
      reviewDate: { $gte: today, $lte: targetEnd },
      status: { $in: ["Proposed", "Accepted"] }
    });
  }

  const filter = conditions.length > 0 ? { $and: conditions } : {};
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = order === "asc" ? 1 : -1;

  const total = await Decision.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum) || (total === 0 ? 0 : 1);

  const decisions = await Decision.find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const data = decisions.map((item) => {
    const linkedTasks = Array.isArray(item.linkedTasks) ? item.linkedTasks : [];
    return withFlags({
      ...item,
      linkedTasks,
      linkedTaskCount: linkedTasks.length
    });
  });

  res.json({
    success: true,
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    }
  });
});

export const getDecisionStats = asyncHandler(async (req, res) => {
  const today = startOfToday();
  const next14Days = endOfDay(addDays(today, 14));

  const [
    total,
    proposedCount,
    acceptedCount,
    supersededCount,
    deprecatedCount,
    needsReconsiderationCount,
    overdueReviewsCount,
    upcomingReviewsCount,
    flaggedCount
  ] = await Promise.all([
    Decision.countDocuments({}),
    Decision.countDocuments({ status: "Proposed" }),
    Decision.countDocuments({ status: "Accepted" }),
    Decision.countDocuments({ status: "Superseded" }),
    Decision.countDocuments({ status: "Deprecated" }),
    Decision.countDocuments({ needsReconsideration: true }),
    Decision.countDocuments({
      reviewDate: { $lt: today },
      status: { $in: ["Proposed", "Accepted"] }
    }),
    Decision.countDocuments({
      reviewDate: { $gte: today, $lte: next14Days },
      status: { $in: ["Proposed", "Accepted"] }
    }),
    Decision.countDocuments({
      $or: [
        { needsReconsideration: true },
        {
          reviewDate: { $lt: today },
          status: { $in: ["Proposed", "Accepted"] }
        }
      ]
    })
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: {
        Proposed: proposedCount,
        Accepted: acceptedCount,
        Superseded: supersededCount,
        Deprecated: deprecatedCount
      },
      accepted: acceptedCount,
      proposed: proposedCount,
      superseded: supersededCount,
      deprecated: deprecatedCount,
      needsReconsideration: needsReconsiderationCount,
      overdue: overdueReviewsCount,
      overdueReviews: overdueReviewsCount,
      upcomingReviews: upcomingReviewsCount,
      flagged: flaggedCount
    }
  });
});

export const getDecisionTags = asyncHandler(async (req, res) => {
  const tags = await Decision.distinct("tags");
  const sortedTags = tags.filter((t) => typeof t === "string" && t.trim().length > 0).sort();

  res.json({
    success: true,
    data: sortedTags
  });
});

export const getDecisionById = asyncHandler(async (req, res) => {
  const decision = await Decision.findById(req.params.id)
    .populate("linkedTasks", "title status priority assignee dueDate")
    .lean();

  if (!decision) {
    throw new AppError(404, "Decision not found");
  }

  res.json({
    success: true,
    data: withFlags(decision)
  });
});

export const createDecision = asyncHandler(async (req, res) => {
  const { linkedTasks, ...allowedData } = req.body;

  const existing = await Decision.findOne({
    title: { $regex: new RegExp(`^${escapeRegex(allowedData.title.trim())}$`, "i") }
  });

  if (existing) {
    throw new AppError(409, "A decision with this title already exists");
  }

  const decision = await Decision.create(allowedData);

  res.status(201).json({
    success: true,
    data: withFlags(decision.toObject())
  });
});

export const updateDecision = asyncHandler(async (req, res) => {
  const decision = await Decision.findById(req.params.id);
  if (!decision) {
    throw new AppError(404, "Decision not found");
  }

  const { linkedTasks, _id, createdAt, updatedAt, ...allowedData } = req.body;

  const existing = await Decision.findOne({
    _id: { $ne: req.params.id },
    title: { $regex: new RegExp(`^${escapeRegex(allowedData.title.trim())}$`, "i") }
  });

  if (existing) {
    throw new AppError(409, "A decision with this title already exists");
  }

  Object.assign(decision, allowedData);
  await decision.save();

  await decision.populate("linkedTasks", "title status priority assignee dueDate");

  res.json({
    success: true,
    data: withFlags(decision.toObject())
  });
});

export const deleteDecision = asyncHandler(async (req, res) => {
  const decision = await Decision.findById(req.params.id);
  if (!decision) {
    throw new AppError(404, "Decision not found");
  }

  // Remove references from tasks first
  await Task.updateMany(
    { linkedDecisions: req.params.id },
    { $pull: { linkedDecisions: req.params.id } }
  );

  await Decision.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Decision deleted"
  });
});

export const reconsiderDecision = asyncHandler(async (req, res) => {
  const decision = await Decision.findById(req.params.id);
  if (!decision) {
    throw new AppError(404, "Decision not found");
  }

  const { needsReconsideration, reason } = req.body;
  decision.needsReconsideration = Boolean(needsReconsideration);
  decision.reconsiderationReason = decision.needsReconsideration ? (reason || "").trim() : "";

  await decision.save();
  await decision.populate("linkedTasks", "title status priority assignee dueDate");

  res.json({
    success: true,
    data: withFlags(decision.toObject())
  });
});

export const linkTask = asyncHandler(async (req, res) => {
  const { id, taskId } = req.params;

  const decision = await Decision.findById(id);
  if (!decision) {
    throw new AppError(404, "Decision not found");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, "Task not found");
  }

  await Decision.updateOne({ _id: id }, { $addToSet: { linkedTasks: taskId } });
  await Task.updateOne({ _id: taskId }, { $addToSet: { linkedDecisions: id } });

  const updatedDecision = await Decision.findById(id).populate(
    "linkedTasks",
    "title status priority assignee dueDate"
  );

  res.json({
    success: true,
    data: withFlags(updatedDecision.toObject())
  });
});

export const unlinkTask = asyncHandler(async (req, res) => {
  const { id, taskId } = req.params;

  const decision = await Decision.findById(id);
  if (!decision) {
    throw new AppError(404, "Decision not found");
  }

  await Decision.updateOne({ _id: id }, { $pull: { linkedTasks: taskId } });
  await Task.updateOne({ _id: taskId }, { $pull: { linkedDecisions: id } });

  const updatedDecision = await Decision.findById(id).populate(
    "linkedTasks",
    "title status priority assignee dueDate"
  );

  res.json({
    success: true,
    data: withFlags(updatedDecision.toObject())
  });
});

export default {
  getDecisions,
  getDecisionStats,
  getDecisionTags,
  getDecisionById,
  createDecision,
  updateDecision,
  deleteDecision,
  reconsiderDecision,
  linkTask,
  unlinkTask
};

