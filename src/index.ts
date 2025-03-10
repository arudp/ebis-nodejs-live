import express, { Express, Request, Response } from "express";
import { readUsers, writeUsers } from "./file-ops";
import { Task, User } from "./types";
import { TaskDAO } from "src/db/dao/tasks";
import { NotFoundError } from "./db/errors";
import { MongooseConnection } from "./db/mongodb/mongoose";
import { TaskModel } from "src/db/models/task";

const app: Express = express();
const port: number = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.redirect("/tasks");
});

const tasksDAO = new TaskDAO();

app.get("/tasks", async (req: Request, res: Response) => {
  // TODO: Allow filtering by name/description/isDone/comma-separated ids
  // as we did with the file-based tasks
  try {
    res.send(await TaskModel.find());
  } catch (error) {
    console.error("Error reading tasks from DB:", error);
    res.status(500).send();
  }
});

app.get("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (task) {
      res.send(task);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error reading task from DB:", error);
    res.status(500).send("Error reading task");
  }
});

app.post("/tasks", async (req: Request, res: Response) => {
  const { name, description, done } = req.body;
  // TODO: Error on repeated names and bad params as we did on the file ones
  const newTask = new TaskModel({ name, description, isDone: done });

  try {
    await newTask.save();
    console.log("Task added", newTask);
    res.sendStatus(201);
  } catch (error) {
    console.error("Error adding task to DB:", error);
    res.sendStatus(500);
  }
});

app.delete("/tasks/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    await TaskModel.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting tasks in DB:", error);
    res.sendStatus(500);
  }
});

app.put("/tasks/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, description, done } = req.body;
  const update: any = {};

  if (!!name) update.name = name;
  if (!!description) update.description = description;
  if (!!done) update.isDone = done;

  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      res.sendStatus(404);
    } else {
      res.send(updatedTask);
    }
  } catch (error) {
    console.error("Error updating task in DB:", error);
    res.status(500).send("Error updating task");
  }
});

app.get("/users", (req, res) => {
  const params = req.query;

  let users: User[] = readUsers();

  if (params) {
    const { name, email, index } = params;

    users = users.filter((user, userIndex) => {
      if (
        name &&
        !user.name.toLowerCase().includes(String(name).toLowerCase())
      ) {
        return false;
      }
      if (
        email &&
        !user.email.toLowerCase().includes(String(email).toLowerCase())
      ) {
        return false;
      }
      if (index && userIndex != Number(index)) {
        return false;
      }
      return true;
    });
  }

  res.send(users.map((user: User) => ({ name: user.name, email: user.email })));
});

app.get("/users/:index", (req, res) => {
  const user = readUsers()[Number(req.params.index) - 1];
  if (user) {
    res.send({ name: user.name, email: user.email });
  } else {
    res.status(404).send();
  }
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (
    !name ||
    !email ||
    !password ||
    typeof name != "string" ||
    typeof email != "string" ||
    typeof password != "string"
  ) {
    res.status(400).send("name, email and password required");
  } else {
    const [beforeAt, afterAt] = String(email).split("@");
    if (!beforeAt || !afterAt || afterAt.split(".").length != 2) {
      res.status(400).send("email has to follow pattern xxx@yyy.zzz");
    } else {
      writeUsers([...readUsers(), { name, email, password }]);
      res.send(201);
    }
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("email and password required");
  } else {
    const user = readUsers().find(
      (user) => user.email === email && user.password === password
    );
    console.log(email, password, user);
    if (user) {
      res.send({ name: user.name, email: user.email });
    } else {
      res.status(401).send("Wrong credentials");
    }
  }
});

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
