import { Router, Request, Response, NextFunction } from "express";
import { User } from "src/db/models/user";
import { HasDocument, QueryParams } from "src/types";
import { ObjectId } from "mongodb";
import { findOrFail } from "src/middlewares/route";
import passport from "passport";
import { localStrategy } from "src/middlewares/auth/local";
import { ensureAuthenticated, jwtStrategy } from "src/middlewares/auth/jwt";

const router = Router();
export default router;

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const params = req.query;

  const findParams: { [key: string]: any } = {};
  const { name, email, ids } = params as QueryParams;

  Object.entries({ name, email }).forEach(([k, v]) => {
    if (v !== undefined) findParams[k] = { $regex: v, $options: "i" };
  });
  if (ids != undefined) {
    findParams._id = { $in: ids.split(",").map((id) => new ObjectId(id)) };
  }

  try {
    res.send(await User.find(findParams).exec());
  } catch (error) {
    next(error);
  }
});
router.get("/me", ensureAuthenticated, (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.send(401);
  } else {
    res.send(req.user);
  }
});

router.get("/:id", findOrFail(User), (req: Request, res: Response) => {
  res.send((req as HasDocument).document.toObject());
});
