import { parseArgs } from "node:util";
import { readTasks, writeTasks } from "src/file-ops";
import { Task } from "src/types";

/**
 * Options accepted from the command line.
 */
const parsingOptions = {
  // Action to take
  create: { type: "boolean" } as const,
  read: { type: "boolean" } as const,
  name: { type: "string" } as const,
  description: { type: "string" } as const,
};

function main () {
  const args = getArgs();

  if (args.read) {
    console.log(readTasks());
  } else if (args.create && args.name) {
    createTask(args.name, args.description);
  } else {
    console.log("Nothing to do:\n", args);
  }
}

function getArgs() {
  try {
    const { values } = parseArgs({ options: parsingOptions});

    return values;
  } catch (error) {
    const typedError = error as Error;
    console.error(`${typedError.name}"\n${typedError.message}`);

    process.exit(1);
  }
}

function createTask(name: string, description?: string|null): void {
  const newTask = {name, description} as Task;

  const tasks = readTasks();

  tasks.push(newTask);

  writeTasks(tasks);

  console.log(`New task added: \n\n${name}\n${description}`);
}

main();
