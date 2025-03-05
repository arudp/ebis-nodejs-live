import { readFileSync, writeFileSync } from "fs";
import { Task, User } from "src/types";
const tasksFile = "db/tasks.json";
const usersFile = "db/users.json";

export function readTasks(): Array<Task> {
  const data = readFileSync(tasksFile, "utf-8");

  const tasks = JSON.parse(data) as Array<Task>;

  return tasks;
}

export function writeTasks(tasks: Array<Task>): void {
  const tasksJson = JSON.stringify(tasks, null, 2);

  writeFileSync(tasksFile, tasksJson);
}

export function readUsers(): Array<User> {
  const data = readFileSync(usersFile, "utf-8");

  const users = JSON.parse(data) as Array<User>;

  return users;
}

export function writeUsers(users: Array<User>): void {
  const usersJson = JSON.stringify(users, null, 2);

  writeFileSync(usersFile, usersJson);
}
