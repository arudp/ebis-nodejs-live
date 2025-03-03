import fs from "fs";
import request from "supertest";
import { app } from "src/index";
import { Task } from "src/types";

describe("app", () => {
  const mockInitTasks: Array<Task> = [
    { name: "Task 1", description: "Description 1", isDone: true },
    { name: "Task 2", description: "Another description", isDone: false },
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

  describe("GET /tasks", () => {
    it.each([
      ["done tasks", "done=1", [0]],
      ["not done tasks", "done=false", [1]],
      ["not done bad string", "done=random-string", [1]],
      ["no match", "done=true&name=a+2", []],
      ["index and done", "done=true&index=1", [0]],
      ["by name", "name=tAsK", [0, 1]],
      ["by description", "description=ther", [1]],
      ["by indexes", "index=3,2,4,1", [0, 1]],
    ])(
      "should find - %s",
      async (_, queryParams: string, expectedTaskIndexes: Number[]) => {
        const response = await request(app).get(`/tasks?${queryParams}`);
        expect(response.status).toBe(200);
        const expectedTasks = testTasks.filter((_, index: Number) =>
          expectedTaskIndexes.includes(index)
        );

        expect(response.body).toEqual(expect.arrayContaining(expectedTasks));
      }
    );

    it("should return only the indexed task", async () => {
      const response = await request(app).get("/tasks/2");
      expect(response.status).toBe(200);

      const expectedTask = testTasks[1];

      expect(response.body.name).toBe(expectedTask.name);
      expect(response.body.description).toBe(expectedTask.description);
    });
    it("should return 404", async () => {
      const response = await request(app).get("/tasks/0");
      expect(response.status).toBe(404);
    });
  });
  describe("POST /tasks", () => {
    it.each([
      ["create new task with just a name", { name: "New task" }, 201],
      [
        "create new task with name and done",
        { name: "New task", done: true },
        201,
      ],
      [
        "create new task with name and description",
        { name: "New task", description: "desc" },
        201,
      ],
      [
        "create new task with all fields",
        { name: "New task", description: "desc", done: false },
        201,
      ],
      ["fail - empty name", { name: "" }, 400],
      ["fail - no name", { description: "A description" }, 400],
      ["fail - existing name", { name: "task 1" }, 409],
      ["fail - bad name type", { name: 1 }, 400],
      ["fail - bad description type", { description: 1 }, 400],
      ["fail - bad done type", { done: 1 }, 400],
    ])(
      "should %s",
      async (
        _,
        body: { name?: any; description?: any; done?: any },
        expectedStatus: number
      ) => {
        const response = await request(app).post("/tasks").send(body);

        const isSuccessful = expectedStatus === 201;

        expect(response.status).toBe(expectedStatus);
        expect(testTasks).toHaveLength(
          mockInitTasks.length + Number(isSuccessful)
        );

        if (isSuccessful) {
          const newTask: any = { name: body.name, isDone: body.done || false };
          if (body.description !== undefined) {
            newTask.description = body.description;
          }
          expect(testTasks).toContainEqual(newTask);
        } else {
          expect(testTasks).toEqual(mockInitTasks);
        }
      }
    );
  });

  describe("DELETE /tasks", () => {
    it.each([
      ["delete a task", 1],
      ["return 200", 10],
    ])("should %s", async (_, index: number) => {
      const response = await request(app).delete(`/tasks/${index}`);

      expect(response.status).toBe(200);

      const expectedLength =
        mockInitTasks.length - Number(index < mockInitTasks.length);
      expect(testTasks).toHaveLength(expectedLength);
      expect(testTasks).not.toContainEqual(mockInitTasks[index - 1]);
    });
  });

  describe("PUT /tasks", () => {
    it.each([
      ["update task with just a name", 1, { name: "Updated task" }, 200],
      [
        "update task with name and done",
        1,
        { name: "Updated task", done: true },
        200,
      ],
      [
        "update task with name and description",
        1,
        { name: "Updated task", description: "desc" },
        200,
      ],
      [
        "update task with all fields",
        1,
        { name: "Updated task", description: "desc", done: false },
        200,
      ],
      [
        "update task with just description",
        2,
        { description: "A description" },
        200,
      ],
      ["update task with just isDone", 1, { done: false }, 200],
      ["fail - 404", 0, { name: "Something" }, 404],
      ["fail - existing name", 1, { name: "task 2" }, 409],
      ["fail - bad name type", 2, { name: 1 }, 400],
      ["fail - bad description type", 1, { description: 1 }, 400],
      ["fail - bad done type", 1, { done: 1 }, 400],
    ])(
      "should %s",
      async (
        _,
        index: number,
        body: { name?: any; description?: any; done?: any },
        expectedStatus: number
      ) => {
        const response = await request(app).put(`/tasks/${index}`).send(body);

        const isSuccessful = expectedStatus === 200;

        expect(response.status).toBe(expectedStatus);
        expect(testTasks).toHaveLength(mockInitTasks.length);

        if (isSuccessful) {
          const updatedTask = mockInitTasks.find(
            (_, n: number) => n === index - 1
          ) as Task;
          const updates = {
            name: body.name ?? updatedTask.name,
            description: body.description ?? updatedTask.description,
            isDone: body.done ?? updatedTask.isDone,
          };
          expect(testTasks).toContainEqual({ ...updatedTask, ...updates });
        } else {
          expect(testTasks).toEqual(mockInitTasks);
        }
      }
    );
  });
});
