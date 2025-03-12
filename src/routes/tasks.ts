import { Router, NextFunction, Request, Response } from "express";
import { Task } from "src/db/models/task";
import { ObjectId } from "mongodb";
import { findOrFail } from "src/middlewares/route";
import { HasDocument, QueryParams } from "src/types";

const router = Router();
export default router;

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const findParams: { [key: string]: any } = {};
  const { ids, name, description, done } = req.query as QueryParams;

  Object.entries({ name, description }).forEach(([k, v]) => {
    if (v !== undefined) findParams[k] = { $regex: v, $options: "i" };
  });
  if (ids != undefined) {
    findParams._id = { $in: ids.split(",").map((id) => new ObjectId(id)) };
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
