import express, { Express, NextFunction, Request, Response } from "express";
import { MongooseConnection } from "src/db/mongodb/mongoose";
import { Task } from "src/db/models/task";
import { ObjectId } from "mongodb";
import { User } from "src/db/models/user";
import { NotFoundError } from "src/db/errors";
import { AuthError, ValidationError } from "src/errors";
import { handleErrors } from "src/middlewares/error";
import { logRequest } from "src/middlewares/application";
import { findOrFail } from "src/middlewares/route";
import { Body, HasDocument, QueryParams } from "src/types";
import taskRouter from "src/routes/tasks";

const app: Express = express();
const port: number = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(logRequest);

app.use("/tasks", taskRouter);

app.get("/", (req: Request, res: Response) => {
  res.redirect("/tasks");
});

// TODO: Create a new route that returns tasks due in a date range, such as
// GET tasks/2025,03,23-2025,03,25 to get tasks with due dates between March's 23rd
// and 25th.
// This means the format is YYYYMMDD, not including hours, minutes or seconds!
// It must also validate that the second date is greater or equal to the first
// one or return a 400
// Use Date.UTC for consistent results!

app.post("/tasks", async (req: Request, res: Response, next: NextFunction) => {
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
});

app.delete(
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

app.put(
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

app.get("/users", async (req: Request, res: Response, next: NextFunction) => {
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

app.get("/users/:id", findOrFail(User), (req: Request, res: Response) => {
  res.send((req as HasDocument).document.toObject());
});

app.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    if (
      [name, email, password].find(
        (field) => !field || typeof field != "string"
      )
    ) {
      next(new ValidationError("name, email and password required"));
      return;
    }

    const [beforeAt, afterAt] = String(email).split("@");
    if (!beforeAt || !afterAt || afterAt.split(".").length != 2) {
      next(new ValidationError("email has to follow pattern xxx@yyy.zzz"));
      return;
    }

    const newUser = new User({ name, email, password });

    try {
      await newUser.save();
      res.sendStatus(201);
    } catch (error) {
      next(error);
    }
  }
);

app.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new ValidationError("Name and password are required"));
    return;
  }

  const user = await User.findOne({ email, password }).exec();
  if (!user) {
    next(new AuthError("Email or password are wrong"));
  } else {
    res.sendStatus(200);
  }
});

app.use(handleErrors);

export { app };

// Start only if it's executed directly, not imported
if (require.main === module) {
  MongooseConnection.connect().then(() => {
    app
      .listen(port, () => {
        console.log(`Example app listening on port ${port}`);
      })
      .on("close", async () => {
        await MongooseConnection.disconnect();
      });
  });
}
