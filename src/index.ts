import express, { Express, Request, Response } from "express";
import { MongooseConnection } from "src/db/mongodb/mongoose";
import { handleErrors } from "src/middlewares/error";
import { logLoggedInInfo, logRequest } from "src/middlewares/application";
import taskRouter from "src/routes/tasks";
import userRouter from "src/routes/users";
import authRouter from "src/routes/auth";
import passport from "passport";

const app: Express = express();
const port: number = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(logRequest);

app.use(passport.initialize());

app.use(logLoggedInInfo);

app.use("/tasks", taskRouter);
app.use("/users", userRouter);
app.use("/", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.redirect("/tasks");
});

app.use(handleErrors);

export { app };

// Start only if it's executed directly, not imported
if (require.main === module) {
  (async () => {
    await MongooseConnection.connect();
    // await MySQL.connect();

    app
      .listen(port, () => {
        console.log(`Example app listening on port ${port}`);
      })
      .on("close", async () => {
        await MongooseConnection.disconnect();
      });
  })();
}
