import express, { Express, Request, Response } from "express";
import { readTasks, writeTasks } from "./file-ops";
import { Task } from "./types";

const app: Express = express();
const port: number = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.redirect("/tasks");
});

// TODO: All index-based endpoints work on a zero-based array. However, it'd be
// more intuitive to work with one-based indexes
// For the tests to pass, they need to be updated accordingly

app.get("/tasks", (req: Request, res: Response) => {
  const params = req.query;

  let tasks: Task[] = readTasks();
  if (params) {
    const { name, description, index, done } = params;

    // TODO: Change how we process "index" so that it filters by a list of
    // indexes. In other words, if "/tasks?index=1,3" I'll get the tasks
    // indexed either 1 or 3 (i.e. 0 and 2 since the reindexing still applies)

    tasks = tasks.filter((task: Task, taskIndex: number) => {
      if (
        name &&
        !task.name.toLowerCase().includes(String(name).toLowerCase())
      ) {
        return false;
      }
      if (
        description &&
        !task.description
          .toLowerCase()
          .includes(String(description).toLowerCase())
      ) {
        return false;
      }
      if (done && task.isDone != ["true", "1"].includes(String(done))) {
        return false;
      }
      if (index && taskIndex != Number(index)) {
        return false;
      }
      return true;
    });
  }

  res.send(tasks);
});
app.get("/tasks/:id", (req: Request, res: Response) => {
  // TODO
  res.send("Not implemented");
});

app.post("/tasks", (req: Request, res: Response) => {
  const { name, description, done } = req.body;
  // ? Why do we use `true` as a boolean here?
  const isDone = done !== undefined && done !== null && done === true;

  // TODO: The creation must comply with the following requirements:
  // - If data is bad (name not there or empty), return 400
  // - If type is bad for any field (e.g. int for name), also return 400
  // - If there's a repeated name (case insensitive), return 409
  const newTask: Task = { name, description, isDone };

  writeTasks([...readTasks(), newTask]);

  res.status(201).send(newTask);
});

app.delete("/tasks/:index", (req: Request, res: Response) => {
  // TODO: find and delete the task by index. If not found -> return 200
  res.send("Not implemented");
});

app.put("/tasks/:index", (req: Request, res: Response) => {
  // TODO: fix the endpoint so that if a field is not given, it doesn't get
  // updated.
  // TODO: The update follows the same rules as the creation:
  // - If data is bad (name not there or empty), return 400
  // - If type is bad for any field (e.g. int for name), also return 400
  // - If there's a repeated name (case insensitive, not the target task), return 409

  const toBeUpdated: Task | undefined = readTasks().find(
    (_, index: number) => index === Number(req.params.index)
  );

  if (toBeUpdated === undefined) {
    res.status(404).send("Not Found");
  } else {
    const { name, description, done } = req.body;
    // ? What's the problem here?
    const isDone = done !== undefined && done !== null && done === true;
    const updatedTask = { name, description, isDone };
    writeTasks(
      readTasks().map((task: Task, index: number) => {
        if (index === Number(req.params.index)) {
          return updatedTask;
        } else {
          return task;
        }
      })
    );

    res.send();
  }
});

// TODO: New User Entrypoints
// Create a users.json file in the same directory as tasks.json
// A User has a name, an email and a password, all strings
// We'll have the following endpoints
//
// GET /users
// Return for each user the name and email, but not the password
//
// GET /users/:index
// Return a user (again no password) by index. 404 if it doesn't exist
//
// POST /register
// Create a new user, all three fields are required and must be a string
// The email has to have
// - Some text (one or more characters)
// - An "@" symbol
// - Some more text
// - a "."
// - Then some more text
// If any of these constraints fail -> return a 400
// Otherwise create the user and return a 201
//
// POST /login
// Receive an email and a password
// Return 200 if both match a user in the file, otherwise 401

// Start only if it's executed directly, not imported
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export { app };
