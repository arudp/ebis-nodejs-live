import express, { Express, Request, Response } from "express";
import { readTasks, writeTasks } from "./file-ops";
import { Task } from "./types";

const app: Express = express();
const port: number = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.sendFile("form.html", { root: "public" });
});

// All endpoints will use the file tasks.json as a way to persist the data

app.get("/search", (req: Request, res: Response) => {
  // - Get all tasks if no index is given
  // - If req.query.index is provided, use that to get a task.
  // - If the index is out of bounds, return 404
  // TODO
});

app.post("/create", (req: Request, res: Response) => {
  // - A task is given in the body (name + description)
  // - If the name is not in the body or is empty, a 400 will be returned
  // - The description can be empty or not present
  // - The task is written to the file and 201 is returned
  // REMEMBER: The body is given URL Encoded (from a form)
  // TODO
});

app.post("/delete", (req: Request, res: Response) => {
  // - If no req.body.index is given or it's unmatched, return 200
  // - If req.body.index is matched, remove the task from the file
  // IMPORTANT: This is a POST, the data is in the body!
  // TODO
});

app.post("/update", (req: Request, res: Response) => {
  // - Follows the same rules as creation (name is required, description is optional)
  // - If no name is given, a 400 is returned
  // - The task, as given, replaces the current definition of the file for the task
  // - The body includes an index to know which task must be replaced with the new definition
  // - The file is left with the same number of tasks
  // - If the index is not given, is invalid or out of bounds, a 400 is returned
  // - If the operation is successful, a 200 is returned
  // IMPORTANT: This is a POST, the data is in the body!
  // TODO
});

// Start only if it's executed directly, not imported
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export { app };
