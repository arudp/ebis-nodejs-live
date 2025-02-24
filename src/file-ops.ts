import { readFileSync, writeFileSync } from "fs";
import { Task } from "src/types";
const tasksFile = "db/tasks.json";

export function readTasks(): Array<Task> {
  const data = readFileSync(tasksFile, "utf-8");

  const tasks = JSON.parse(data) as Array<Task>;

  return tasks;
}

export function writeTasks(tasks: Array<Task>): void {
  const tasksJson = JSON.stringify(tasks, null, 2);

  writeFileSync(tasksFile, tasksJson);
}
