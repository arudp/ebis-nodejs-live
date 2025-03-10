import request from "supertest";
import { app } from "src/index";
import { mongoConfig } from "src/db/mongodb/config";
import mongoose from "mongoose";
import { Task } from "src/db/models/task";
import { ObjectId } from "mongodb";

const connect = async (config: any) => {
  try {
    await mongoose.connect(config.getURI(), {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
const disconnect = async () => await mongoose.disconnect();

describe("app", () => {
  const initTasks: Array<any> = [
    { name: "Task 1", description: "Description 1", isDone: true },
    { name: "Task 2", description: "Another description", isDone: false },
  ];
  let dbTasks: any[] = [];

  beforeAll(() => {
    const mongoTestConfig = mongoConfig;
    mongoTestConfig.dbName += "-test";

    connect(mongoTestConfig);
  });

  afterAll(disconnect);

  beforeEach(async () => {
    jest.resetModules();

    await Task.deleteMany();
    dbTasks = await Task.insertMany(initTasks);

    console.log("DB Refreshed");
  });

  afterEach(async () => {
    jest.clearAllTimers();
  });

  describe("GET /tasks", () => {
    it.each([
      ["done tasks", () => "done=1", [0]],
      ["not done tasks", () => "done=false", [1]],
      ["not done bad string", () => "done=random-string", [1]],
      ["no match", () => "done=true&name=a+2", []],
      ["id and done", () => `done=true&ids=${dbTasks[0]._id}`, [0]],
      ["by name", () => "name=tAsK", [0, 1]],
      ["by description", () => "description=ther", [1]],
      [
        "by ids",
        () =>
          `ids=${[new ObjectId().toString(), ...dbTasks.map((t: any) => t._id)].join(",")}`,
        [0, 1],
      ],
    ])(
      "should find - %s",
      async (
        _,
        getQueryParams: () => string,
        expectedTaskIndexes: Number[]
      ) => {
        const response = await request(app).get(`/tasks?${getQueryParams()}`);
        expect(response.status).toBe(200);
        const expectedTasks = dbTasks.filter((_: any, index: Number) =>
          expectedTaskIndexes.includes(index)
        );

        expect(response.body).toEqual(
          expectedTasks.map((t: any) => t.toObject())
        );
      }
    );

    it("should return only the indexed task", async () => {
      const response = await request(app).get(`/tasks/${dbTasks[1]._id}`);
      expect(response.status).toBe(200);

      const expectedTask = dbTasks[1];

      expect(response.body.name).toBe(expectedTask.name);
      expect(response.body.description).toBe(expectedTask.description);
    });
    it("should return 404", async () => {
      const unmatchedObjectId = new ObjectId().toString();
      const response = await request(app).get(`/tasks/${unmatchedObjectId}`);
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
      ["create task despite bad done type", { name: "a name", done: 1 }, 201],
    ])(
      "should %s",
      async (
        _,
        body: { name?: any; description?: any; done?: any },
        expectedStatus: number
      ) => {
        const response = await request(app).post("/tasks").send(body);
        dbTasks = await Task.find().exec();

        const isSuccessful = expectedStatus === 201;

        expect(response.status).toBe(expectedStatus);
        expect(dbTasks).toHaveLength(initTasks.length + Number(isSuccessful));

        if (isSuccessful) {
          const newTask: any = { name: body.name, isDone: !!body.done };
          if (body.description !== undefined) {
            newTask.description = body.description;
          }
          expect(dbTasks).toEqual(
            expect.arrayContaining([expect.objectContaining(newTask)])
          );
        } else {
          expect(dbTasks).toEqual(
            expect.arrayContaining(initTasks.map(expect.objectContaining))
          );
        }
      }
    );
  });

  describe("DELETE /tasks", () => {
    it.each([
      ["delete a task", () => dbTasks[0]._id, true],
      ["return 200", () => new ObjectId(), false],
    ])("should %s", async (_, getId: () => ObjectId, shouldDelete: boolean) => {
      const id = getId();
      const response = await request(app).delete(`/tasks/${id}`);

      expect(response.status).toBe(200);

      dbTasks = await Task.find();
      const expectedLength = initTasks.length - Number(shouldDelete);
      expect(dbTasks).toHaveLength(expectedLength);

      expect(dbTasks.find((dbTask) => dbTask._id === id)).toBeUndefined();
    });
  });

  describe("PUT /tasks", () => {
    it.each([
      [
        "update task with just a name",
        () => dbTasks[0]._id,
        { name: "Updated task" },
        200,
      ],
      [
        "update task with name and done",
        () => dbTasks[0]._id,
        { name: "Updated task", done: true },
        200,
      ],
      [
        "update task with name and description",
        () => dbTasks[0]._id,
        { name: "Updated task", description: "desc" },
        200,
      ],
      [
        "update task with all fields",
        () => dbTasks[0]._id,
        { name: "Updated task", description: "desc", done: false },
        200,
      ],
      [
        "update task with just description",
        () => dbTasks[1]._id,
        { description: "A description" },
        200,
      ],
      [
        "update task with just isDone",
        () => dbTasks[0]._id,
        { done: false },
        200,
      ],
      ["fail - 404", () => new ObjectId(), { name: "Something" }, 404],
      ["fail - existing name", () => dbTasks[0]._id, { name: "task 2" }, 409],
      ["fail - bad name type", () => dbTasks[1]._id, { name: 1 }, 400],
      [
        "updates task despite bad description type",
        () => dbTasks[0]._id,
        { description: 1 },
        200,
      ],
      [
        "updates task despite bad done type",
        () => dbTasks[0]._id,
        { done: 1 },
        200,
      ],
    ])(
      "should %s",
      async (
        _,
        getId: () => ObjectId,
        body: { name?: any; description?: any; done?: any },
        expectedStatus: number
      ) => {
        const id = getId();
        const response = await request(app).put(`/tasks/${id}`).send(body);

        const isSuccessful = expectedStatus === 200;

        expect(response.status).toBe(expectedStatus);

        const updatedTask = dbTasks.find((t) => t._id === id);
        dbTasks = await Task.find();
        expect(dbTasks).toHaveLength(initTasks.length);

        if (isSuccessful) {
          const updates = {
            name: body.name ?? updatedTask.name,
            description:
              (body.description && String(body.description)) ??
              updatedTask.description,
            isDone: (body.done && !!body.done) ?? updatedTask.isDone,
          };

          expect(dbTasks).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                ...updatedTask.toObject(),
                ...updates,
              }),
            ])
          );
        } else {
          expect(dbTasks).toEqual(
            expect.arrayContaining(initTasks.map(expect.objectContaining))
          );
        }
      }
    );
  });
});
