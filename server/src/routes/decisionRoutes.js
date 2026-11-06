import express from "express";
import {
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
} from "../controllers/decisionController.js";
import {
  decisionIdParamValidator,
  linkTaskParamsValidator,
  listDecisionsQueryValidator,
  createDecisionValidator,
  updateDecisionValidator,
  patchReconsiderValidator
} from "../validators/decisionValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.get("/", listDecisionsQueryValidator, validate, getDecisions);
router.get("/stats", getDecisionStats);
router.get("/tags", getDecisionTags);
router.get("/:id", decisionIdParamValidator, validate, getDecisionById);
router.post("/", createDecisionValidator, validate, createDecision);
router.put("/:id", updateDecisionValidator, validate, updateDecision);
router.delete("/:id", decisionIdParamValidator, validate, deleteDecision);
router.patch("/:id/reconsider", patchReconsiderValidator, validate, reconsiderDecision);
router.post("/:id/tasks/:taskId", linkTaskParamsValidator, validate, linkTask);
router.delete("/:id/tasks/:taskId", linkTaskParamsValidator, validate, unlinkTask);

export default router;

