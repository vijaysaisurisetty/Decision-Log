import { startOfToday, daysBetween } from "./dates.js";

export const withFlags = (decision) => {
  if (!decision) return decision;

  const doc = typeof decision.toObject === "function" 
    ? decision.toObject({ virtuals: true }) 
    : { ...decision };

  if ("__v" in doc) {
    delete doc.__v;
  }

  const today = startOfToday();
  const reviewDate = doc.reviewDate ? new Date(doc.reviewDate) : null;
  const isReviewEligibleStatus = doc.status === "Proposed" || doc.status === "Accepted";

  const isReviewOverdue = Boolean(reviewDate && reviewDate < today && isReviewEligibleStatus);
  const daysUntilReview = reviewDate ? daysBetween(today, reviewDate) : null;
  const needsReconsideration = Boolean(doc.needsReconsideration);
  const reconsiderationFlag = Boolean(needsReconsideration || isReviewOverdue);

  let flagReason = null;
  if (needsReconsideration) {
    flagReason = "Marked manually";
  } else if (isReviewOverdue) {
    flagReason = "Review date passed";
  }

  return {
    ...doc,
    isReviewOverdue,
    daysUntilReview,
    reconsiderationFlag,
    flagReason
  };
};

export default {
  withFlags
};

