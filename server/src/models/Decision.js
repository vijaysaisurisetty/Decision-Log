import mongoose from "mongoose";
import { startOfToday } from "../utils/dates.js";

const optionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Option name is required"],
      trim: true,
      minlength: [1, "Option name must be at least 1 character"],
      maxlength: [100, "Option name cannot exceed 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Option description cannot exceed 1000 characters"],
      default: ""
    },
    pros: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (val) => !val || val.length <= 10,
          message: "An option cannot have more than 10 pros"
        },
        {
          validator: (val) =>
            !val || val.every((item) => typeof item === "string" && item.trim().length >= 1 && item.trim().length <= 300),
          message: "Each pro must be between 1 and 300 characters"
        }
      ]
    },
    cons: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (val) => !val || val.length <= 10,
          message: "An option cannot have more than 10 cons"
        },
        {
          validator: (val) =>
            !val || val.every((item) => typeof item === "string" && item.trim().length >= 1 && item.trim().length <= 300),
          message: "Each con must be between 1 and 300 characters"
        }
      ]
    }
  },
  { _id: false }
);

const decisionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be 3-150 characters"],
      maxlength: [150, "Title must be 3-150 characters"]
    },
    context: {
      type: String,
      required: [true, "Context is required"],
      trim: true,
      minlength: [10, "Context must be 10-3000 characters"],
      maxlength: [3000, "Context must be 10-3000 characters"]
    },
    options: {
      type: [optionSchema],
      required: [true, "Options are required"],
      validate: [
        {
          validator: (val) => Array.isArray(val) && val.length >= 2 && val.length <= 10,
          message: "Add at least 2 options"
        },
        {
          validator: (val) => {
            if (!Array.isArray(val)) return false;
            const names = val.map((o) => (o && o.name ? o.name.trim().toLowerCase() : ""));
            return new Set(names).size === names.length;
          },
          message: "Option names must be unique inside one decision"
        }
      ]
    },
    chosenOption: {
      type: String,
      required: [true, "Chosen option is required"],
      trim: true,
      validate: {
        validator: function (val) {
          if (!this.options || !Array.isArray(this.options)) return false;
          const trimmed = typeof val === "string" ? val.trim() : "";
          return this.options.some((opt) => opt && typeof opt.name === "string" && opt.name.trim() === trimmed);
        },
        message: "Chosen option must match one of the options"
      }
    },
    rationale: {
      type: String,
      required: [true, "Rationale is required"],
      trim: true,
      minlength: [10, "Rationale must be 10-3000 characters"],
      maxlength: [3000, "Rationale must be 10-3000 characters"]
    },
    status: {
      type: String,
      enum: {
        values: ["Proposed", "Accepted", "Superseded", "Deprecated"],
        message: "Invalid status: {VALUE}"
      },
      default: "Proposed"
    },
    decidedBy: {
      type: String,
      required: [true, "Decided by is required"],
      trim: true,
      minlength: [2, "Decided by must be 2-100 characters"],
      maxlength: [100, "Decided by must be 2-100 characters"]
    },
    decisionDate: {
      type: Date,
      required: [true, "Decision date is required"],
      default: Date.now
    },
    reviewDate: {
      type: Date,
      required: [true, "Review date is required"],
      validate: {
        validator: function (val) {
          if (!val) return false;
          const decDate = this.decisionDate ? new Date(this.decisionDate) : new Date();
          return new Date(val).getTime() >= decDate.getTime();
        },
        message: "Review date cannot be before the decision date"
      }
    },
    needsReconsideration: {
      type: Boolean,
      default: false
    },
    reconsiderationReason: {
      type: String,
      trim: true,
      maxlength: [1000, "Reconsideration reason cannot exceed 1000 characters"],
      default: "",
      validate: {
        validator: function (val) {
          if (this.needsReconsideration) {
            return typeof val === "string" && val.trim().length >= 5;
          }
          return true;
        },
        message: "Reason is required when marking for reconsideration"
      }
    },
    tags: {
      type: [String],
      default: [],
      set: (val) => {
        if (!Array.isArray(val)) return val;
        const cleaned = val
          .filter((t) => typeof t === "string" && t.trim().length > 0)
          .map((t) => t.trim().toLowerCase());
        return [...new Set(cleaned)];
      },
      validate: [
        {
          validator: (val) => Array.isArray(val) && val.length <= 10,
          message: "A decision cannot have more than 10 tags"
        },
        {
          validator: (val) =>
            Array.isArray(val) &&
            val.every((item) => typeof item === "string" && item.length >= 1 && item.length <= 30),
          message: "Each tag must be between 1 and 30 characters"
        }
      ]
    },
    linkedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

decisionSchema.pre("validate", function (next) {
  if (!this.needsReconsideration) {
    this.reconsiderationReason = "";
  }
  next();
});

decisionSchema.virtual("isReviewOverdue").get(function () {
  if (!this.reviewDate) return false;
  const today = startOfToday();
  const isEligible = this.status === "Proposed" || this.status === "Accepted";
  return new Date(this.reviewDate) < today && isEligible;
});

// Indexes
decisionSchema.index(
  { title: "text", rationale: "text", context: "text" },
  { weights: { title: 5, rationale: 2, context: 1 } }
);
decisionSchema.index({ status: 1 });
decisionSchema.index({ reviewDate: 1 });
decisionSchema.index({ needsReconsideration: 1 });
decisionSchema.index({ tags: 1 });
decisionSchema.index({ title: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const Decision = mongoose.model("Decision", decisionSchema);
export default Decision;

