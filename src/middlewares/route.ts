import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import { HasDocument } from "src/types";
import { NotFoundError } from "src/db/errors";

/**
 * Get a middleware for the given model that finds a document by ID or returns a 404 error.
 *
 * @param model - The Mongoose model to query
 */
export function findOrFail(
  model: Model<any>
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const document = await model.findById(req.params.id);
      if (document) {
        (req as HasDocument).document = document;
        next();
      } else {
        next(new NotFoundError(`${model.modelName} not found`));
      }
    } catch (error) {
      next(error);
    }
  };
}
