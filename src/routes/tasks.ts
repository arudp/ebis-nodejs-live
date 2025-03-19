import { Router, NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { findOrFail } from "src/middlewares/route";
import { Body, HasDocument, QueryParams } from "src/types";
import { ValidationError } from "src/errors";
import { NotFoundError } from "src/db/errors";
import { Task } from "src/db/mysql/models/task";
import { Op } from "sequelize";

const router = Router();
export default router;

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const findParams: { [key: string]: any } = {
    offset: 0,
    limit: 3,
    where: {},
    order: [],
  };

  Object.entries(req.query as { [key: string]: string }).forEach(
    ([key, value]) => {
      if (["offset", "limit"].includes(key)) {
        findParams[key] = parseInt(value);
      } else if (["name", "description"].includes(key)) {
        // Text
        findParams.where[key] = { [Op.like]: `%${value}%` };
      } else if (key === "ids") {
        findParams.where["id"] = { [Op.in]: value.split(",") };
      } else if (key === "due_date") {
        findParams.where[key] = new Date(value);
      } else if (["from", "to"].includes(key)) {
        const op = { from: Op.gte, to: Op.lte }[key] as symbol;
        findParams.where["due_date"] = { [op]: new Date(value) };
      } else if (key === "sort") {
        let values: string[] = [value];
        if ((value as any) instanceof Array) {
          values = value as any;
        }
        values.forEach((sortConfig: string) => {
          findParams.order.push(sortConfig.split(","));
        });
      }
    }
  );

  try {
    res.send(await Task.findAll(findParams));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  // TODO: Validate in middleware that the given id corresponds to an ObjectId
  // format. If not valid, return 404. On DELETE, return 200
  // Reuse the same middleware for all :id routes
  const task = await Task.findByPk(req.params.id);
  res.send(task);
});

// TODO: Create a new route that returns tasks due in a date range, such as
// GET tasks/2025,03,23-2025,03,25 to get tasks with due dates between March's 23rd
// and 25th.
// This means the format is YYYYMMDD, not including hours, minutes or seconds!
// It must also validate that the second date is greater or equal to the first
// one or return a 400
// Use Date.UTC for consistent results!

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
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

  try {
    const task = await new Task(req.body).save();
    res.status(201).send(task);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      await Task.destroy({ where: { id } });
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const { name, description, done, due_date } = req.body;
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
    update.name = name;
  }

  if (!!description) update.description = description;
  if (done !== undefined) update.isDone = done;
  if (due_date) new Date(update.due_date);

  try {
    // Task.update(update, {where: {id}})
    const task = await Task.findByPk(id);
    if (!task) {
      res.sendStatus(404);
      return;
    }

    const updatedTask = await task.setAttributes(update).save();
    res.send(updatedTask);
  } catch (error) {
    next(error);
  }
});
