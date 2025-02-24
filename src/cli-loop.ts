import readline, { Interface as ReadlineInterface } from "readline";

import { readTasks, writeTasks } from "src/file-ops";
import { Task } from "src/types";

let rl: ReadlineInterface;

export function main() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Welcome to the task manager!");
  showUsage();
  rl.on("line", (line) => {
    const args = line.split(" ");

    switch (args[0]) {
      case "":
      case "help":
        break;
      case "read-all":
        showTasks();
        break;
      case "filter":
        showTasksByName();
        break;
      case "create":
        creationMenu();
        break;
      case "delete":
        deleteTasksByIndex();
        break;
      case "exit":
        console.log("Exiting...");
        rl.close();
        return;
      default:
        console.log("Unknown command");
        break;
    }

    showUsage();
  });
}

function showUsage() {
  console.log("Commands: help, read-all, filter, create, delete, exit");
}

/**
 * Reads tasks from the file and logs them to the console.
 */
function showTasks(): void {
  // TODO
}

/**
 * Asks the user for a name and filters tasks that contain that name, then
 * console.log it.
 */
function showTasksByName(): void {
  // TODO
}

/**
 * 1. Shows the tasks preceded by an index. (0 - Task 1)
 * 2. Asks the user for an index and deletes the task at that index.
 * 3. If a wrong index is provided, it shows an error message.
 */
function deleteTasksByIndex(): void {
  // TODO
}

function creationMenu() {
  console.log("Creating a new task");
  rl.question("Name: ", (name) => {
    rl.question("Description: ", (description) => {
      createTask(name, description);
    });
  });
}

function createTask(name: string, description?: string | null): void {
  const newTask = { name, description } as Task;

  const tasks = readTasks();

  tasks.push(newTask);

  writeTasks(tasks);

  console.log(`New task added: \n\n${name}\n${description}`);
}

main();
