import { Task } from "src/types";
import { WithId, Document, InsertOneResult, ObjectId } from "mongodb";

import { client } from "src/db/mongodb/client";
import { DAO } from "src/db/dao/dao";
import { DBError, NotFoundError } from "src/db/errors";

export class TaskDAO implements DAO<Task> {
  async getAll(): Promise<Task[]> {
    try {
      const taskDocuments: WithId<Document>[] = await client
        .db("tasks")
        .collection("tasks")
        .find()
        .toArray();
      const tasks: Task[] = taskDocuments.map(
        (taskDocument: WithId<Document>) => {
          const { _id, name, done, description } = taskDocument;
          return { id: _id.toString(), name, description, isDone: !!done };
        }
      );
      return tasks;
    } catch (error) {
      console.error("Error reading tasks from DB:", error);
      throw new DBError();
    }
  }

  async get(id: string): Promise<Task> {
    const taskDocument: WithId<Document> | null = await client
      .db("tasks")
      .collection("tasks")
      .findOne({ _id: new ObjectId(id) });

    if (!taskDocument) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    const { _id, name, done, description } = taskDocument;
    return { id: _id.toString(), name, isDone: done, description };
  }

  async create(task: Task): Promise<void> {
    try {
      const result: InsertOneResult<Document> = await client
        .db("tasks")
        .collection("tasks")
        .insertOne({ ...task });
      task.id = result.insertedId.toString();

      console.log("Task added", task);
    } catch (error) {
      console.error("Error adding task to DB:", error);
      throw new DBError();
    }
  }

  async update(task: Task): Promise<Task> {
    try {
      const updatedTask = await client
        .db("tasks")
        .collection("tasks")
        .findOneAndUpdate(
          { _id: new ObjectId(task.id) },
          { $set: { ...task } },
          { returnDocument: "after" }
        );

      if (updatedTask === null) {
        throw new NotFoundError();
      }

      console.log("Task updated", updatedTask);

      const { _id, name, done, description } = updatedTask;
      return { id: _id.toString(), name, isDone: done, description };
    } catch (error) {
      console.error("Error updating task in DB:", error);
      throw new DBError();
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await client
        .db("tasks")
        .collection("tasks")
        .deleteOne({ _id: new ObjectId(id) });

      console.log(`Tasks deleted: ${result.deletedCount}`);
    } catch (error) {
      console.error("Error deleting tasks in DB:", error);
      throw new DBError();
    }
  }
}
