import { ObjectId } from "mongodb";
import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    isDone: { type: Boolean, default: false, required: true },
  },
  {
    virtuals: {
      id: {
        get() {
          return this._id.toString();
        },
        set(value: string) {
          this._id = new ObjectId(value);
        },
      },
    },
    // Add "virtual" fields when converting document to JSON or to Object
    // And drop DB values
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const TaskModel = model("Task", taskSchema, "tasks");
