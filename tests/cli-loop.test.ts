jest.mock("fs");
jest.mock("readline");

import { Task } from "../src/types";

describe("cli-loop", () => {
  const mockInitTasks: Array<Task> = [
    { name: "Task 1", description: "Description 1" },
    { name: "Task 2", description: "Description 2" },
  ];

  let testTasks: Array<Task>;

  let rlMock: any;
  let stdout: any;
  let output: string;

  beforeEach(() => {
    jest.resetModules();

    const readline = require("readline");
    rlMock = readline.createInterface();

    output = "";
    stdout = jest.spyOn(process.stdout, "write").mockImplementation((data) => {
      output += data;
      return true;
    });

    testTasks = [...mockInitTasks];

    const fs = require("fs");
    fs.readFileSync.mockClear();
    fs.readFileSync.mockReturnValue(JSON.stringify(testTasks, null, 2));
    fs.writeFileSync.mockImplementation((file: string, tasks: any) => {
      testTasks = JSON.parse(tasks);
    });
  });

  afterEach(() => {
    stdout.mockRestore();
    jest.clearAllTimers();
  });

  it("should show all tasks", (done) => {
    rlMock.on = jest.fn().mockImplementationOnce((event, cb) => {
      cb("read-all");
      cb("exit");
    });

    // automatically calls main
    require("../src/cli-loop");
    setImmediate(() => {
      testTasks.forEach((task) => {
        expect(output).toContain(task.name);
        expect(output).toContain(task.description);
      });

      setImmediate(() => {
        expect(rlMock.close).toHaveBeenCalled();
        done();
      });
    });
  });
  it("should filter tasks by name", (done) => {
    rlMock.on = jest.fn().mockImplementationOnce((event, cb) => {
      cb("filter");
      // In the meantime, calls rl.question
      cb("exit");
    });
    rlMock.question = jest.fn().mockImplementationOnce((question, cb) => {
      cb("Task 1");
    });

    // automatically calls main
    require("../src/cli-loop");
    setImmediate(() => {
      expect(output).toContain("Task 1");
      expect(output).toContain("Description 1");
      expect(output).not.toContain("Task 2");
      expect(output).not.toContain("Description 2");

      setImmediate(() => {
        expect(rlMock.close).toHaveBeenCalled();
        done();
      });
    });
  });
  it("should delete by index", (done) => {
    rlMock.on = jest.fn().mockImplementationOnce((event, cb) => {
      cb("delete");
      // In the meantime, calls rl.question
      cb("exit");
    });
    rlMock.question = jest.fn().mockImplementationOnce((question, cb) => {
      cb("1"); // Task 2
    });

    // automatically calls main
    require("../src/cli-loop");

    setImmediate(() => {
      expect(output).toContain("0 - Task 1");
      expect(output).toContain("1 - Task 2");

      setImmediate(() => {
        expect(testTasks).toHaveLength(1);
        expect(testTasks[0].name).toBe("Task 1");

        setImmediate(() => {
          expect(rlMock.close).toHaveBeenCalled();
          done();
        });
      });
    });
  });
});
