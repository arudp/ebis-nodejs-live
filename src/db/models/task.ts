import { ObjectId } from "mongodb";
import { Schema, Error, model } from "mongoose";
import { DuplicateEntityError } from "src/db/errors";

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      // Set is called when the document gets constructed (not the model)
      set: (value: any) => {
        if (typeof value !== "string") {
          // Since cast fails -> eventually we get a ValidationError
          throw new Error(`String expected for name - ${value}`);
        }
        return value;
      },
    },
    description: String,
    isDone: { type: Boolean, default: false, required: true },
    dueDate: { type: Date },
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
(taskSchema.query as any).byName = function (name: string) {
  return this.where({ name: { $regex: `^${name}$`, $options: "i" } });
};

// Add the type declaration to extend Mongoose's Query interface
declare module "mongoose" {
  interface Query<ResultType, DocType extends Document> {
    byName(name: string): Query<ResultType, DocType>;
  }
}

taskSchema.pre("save", async function (next) {
  const exists = await (this.constructor as any)
    .exists()
    .byName(this.name)
    .where("_id")
    .ne(this._id)
    .exec();
  if (exists) {
    next(new DuplicateEntityError(`Name must be unique - ${this.name}`));
  } else {
    next();
  }
});

export const Task = model("Task", taskSchema, "tasks");
