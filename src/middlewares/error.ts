import { NextFunction, Request, Response } from "express";

export function handleErrors(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction // Required for it to be called
) {
  switch (err?.name) {
    case "AuthError":
      res.status(401).send(err.message || "Unauthorized");
      break;
    case "ValidationError":
      res.status(400).send("Invalid data: " + err.message);
      break;
    case "NotFoundError":
      res.status(404).send(err.message || "Not Found");
      break;
    case "DuplicateEntityError":
      res.status(409).send(err.message);
      break;
    default:
      res.status(500).send("Something went wrong, try again later");
  }
}
