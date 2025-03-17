import { Router, NextFunction, Request, Response } from "express";
import { Task } from "src/db/models/task";
import { ObjectId } from "mongodb";
import { findOrFail } from "src/middlewares/route";
import { Body, HasDocument, QueryParams } from "src/types";
import { ValidationError } from "src/errors";
import { NotFoundError } from "src/db/errors";

const router = Router();
export default router;

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const findParams: { [key: string]: any } = {};
  const { ids, name, description, done } = req.query as QueryParams;

  Object.entries({ name, description }).forEach(([k, v]) => {
    if (v !== undefined) findParams[k] = { $regex: v, $options: "i" };
  });
  if (ids != undefined) {
    findParams._id = {
      $in: ids.split(",").map((id: string) => new ObjectId(id)),
    };
  }
  if (done !== undefined) {
    findParams.isDone = ["true", "1"].includes(done);
  }

  try {
    res.send(await Task.find(findParams).exec());
  } catch (error) {
    next(error);
  }
});

router.get("/:id", findOrFail(Task), async (req: Request, res: Response) => {
  // TODO: Validate in middleware that the given id corresponds to an ObjectId
  // format. If not valid, return 404. On DELETE, return 200
  // Reuse the same middleware for all :id routes

  res.send((req as HasDocument).document.toObject());
});

// TODO: Create a new route that returns tasks due in a date range, such as
// GET tasks/2025,03,23-2025,03,25 to get tasks with due dates between March's 23rd
// and 25th.
// This means the format is YYYYMMDD, not including hours, minutes or seconds!
// It must also validate that the second date is greater or equal to the first
// one or return a 400
// Use Date.UTC for consistent results!

router.post(
  "/tasks",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, done } = req.body as Body;

    // TODO: Validate in middleware (use the same one for PUT)
    // - Task name between 3 - 20 chars if given
    // - Description from 0 to 100 chars if given
    // - Due date - ISO 8601 (comes as due_date and is stored as dueDate)
    // - Date can't be earlier than now
    // - Types are the expected ones for all fields, when present
    // TODO: Extra POST validation
    // - Task name is required
    // - isDone defaults to false if not present

    const newTask = new Task({ name, description, isDone: done });

    try {
      await newTask.save();
      res.sendStatus(201);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/tasks/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      await Task.findByIdAndDelete(id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/tasks/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { name, description, done } = req.body;
    const update: any = {};

    // TODO: Validate in middleware (use the same one for POST)
    // - Task name between 3 - 20 chars if given
    // - Description from 0 to 100 chars if given
    // - Due date - ISO 8601 (comes as due_date and is stored as dueDate)
    // - Date can't be earlier than now
    // - Types are the expected ones for all fields, when present otherwise 400

    if (!!name) {
      if (typeof name !== "string") {
        next(new ValidationError("Name is required"));
        return;
      }
    }

    if (!!description) update.description = description;
    if (done !== undefined) update.isDone = done;

    try {
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true, runValidators: true }
      );
      if (!updatedTask) {
        next(new NotFoundError(Task.modelName));
      } else {
        res.send(updatedTask);
      }
    } catch (error) {
      next(error);
    }
  }
);
