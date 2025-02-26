import fs from "fs";
import request from "supertest";
import { app } from "src/index";
import { Task } from "src/types";

describe("app", () => {
  const mockInitTasks: Array<Task> = [
    { name: "Task 1", description: "Description 1" },
    { name: "Task 2", description: "Description 2" },
  ];

  let testTasks: Array<Task>;

  beforeEach(() => {
    jest.resetModules();

    testTasks = [...mockInitTasks];

    jest
      .spyOn(fs, "readFileSync")
      .mockImplementation(() => JSON.stringify(testTasks, null, 2));

    jest.spyOn(fs, "writeFileSync").mockImplementation((_, tasks: any) => {
      testTasks = JSON.parse(tasks);
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("GET /search", () => {
    it("should return all the tasks", async () => {
      const response = await request(app).get("/search");
      expect(response.status).toBe(200);
      testTasks.forEach((task) => {
        expect(response.text).toContain(task.name);
        expect(response.text).toContain(task.description);
      });
    });

    it("should return only the indexed task", async () => {
      const response = await request(app).get("/search?index=1");
      expect(response.status).toBe(200);

      const expectedTask = testTasks[1];

      expect(response.text).toContain(expectedTask.name);
      expect(response.text).toContain(expectedTask.description);
    });
    it("should return 404", async () => {
      const response = await request(app).get("/search?index=2");
      expect(response.status).toBe(404);
    });
  });
  describe("POST /create", () => {
    it("should create a task", async () => {
      const newTask = {
        name: "A new task",
        description: "New task description",
      };
      const response = await request(app)
        .post("/create")
        .type("form")
        .send(newTask);

      expect(response.status).toBe(201);

      expect(testTasks.length).toBe(3);
      expect(testTasks.find((t) => t === newTask)).toBeTruthy;
    });
    it("should create a task - no description", async () => {
      const newTask = {
        name: "A new task",
      };
      const response = await request(app)
        .post("/create")
        .type("form")
        .send(newTask);

      expect(response.status).toBe(201);

      expect(testTasks.length).toBe(3);
      expect(testTasks.find((t) => t === newTask)).toBeTruthy;
    });
    it("should fail at creating a task - no name", async () => {
      const newTask = {
        description: "New task description",
      };
      const response = await request(app)
        .post("/create")
        .type("form")
        .send(newTask);

      expect(response.status).toBe(400);

      expect(testTasks.length).toBe(2);
      expect(testTasks.find((t) => t === newTask)).toBeFalsy;
    });
  });

  describe("POST /delete", () => {
    it("should delete a task", async () => {
      const tasksPreDelete = [...testTasks];

      const response = await request(app)
        .post("/delete")
        .type("form")
        .send({ index: 0 });

      expect(response.status).toBe(200);

      expect(testTasks.length).toBe(1);
      expect(testTasks[0]).toEqual(tasksPreDelete[1]);
    });
    it("should delete nothing", async () => {
      const tasksPreDelete = [...testTasks];

      const response = await request(app)
        .post("/delete")
        .type("form")
        .send({ index: 2 });

      expect(response.status).toBe(200);

      expect(testTasks.length).toBe(2);
      expect(testTasks).toEqual(tasksPreDelete);
    });
  });

  describe("POST /update", () => {
    it("should update a task", async () => {
      const updatedTask = { name: "An updated task", index: 0 };
      const removedTask = testTasks[0];
      const response = await request(app)
        .post("/update")
        .type("form")
        .send(updatedTask);

      expect(response.status).toBe(200);

      expect(testTasks.length).toBe(2);
      expect(
        testTasks.find((t) => t.name === updatedTask.name && !t.description)
      ).toBeTruthy;
      expect(testTasks.find((t) => t === removedTask)).toBeFalsy;
    });
    it.each([
      ["no name", { description: "a description", index: 0 }],
      ["bad index", { name: "a name", index: -1 }],
      ["no index", { description: "a description" }],
    ])(
      "should fail - %s",
      async (
        _,
        body: { description?: string; name?: string; index?: number }
      ) => {
        const preUpdate = [...testTasks];
        const response = await request(app)
          .post("/update")
          .type("form")
          .send(body);

        expect(response.status).toBe(400);
        expect(testTasks).toEqual(preUpdate);
      }
    );
  });
});
