import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be 3-150 characters"],
      maxlength: [150, "Title must be 3-150 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: ""
    },
    status: {
      type: String,
      enum: {
        values: ["Todo", "In Progress", "Done"],
        message: "Invalid status: {VALUE}"
      },
      default: "Todo"
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Invalid priority: {VALUE}"
      },
      default: "Medium"
    },
    assignee: {
      type: String,
      trim: true,
      maxlength: [100, "Assignee cannot exceed 100 characters"],
      default: ""
    },
    dueDate: {
      type: Date,
      default: null
    },
    linkedDecisions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Decision"
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

taskSchema.index({ title: "text", description: "text" });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });

export const Task = mongoose.model("Task", taskSchema);
export default Task;

