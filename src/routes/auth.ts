import { Router, Request, Response, NextFunction } from "express";
import { AuthError, ValidationError } from "src/errors";
import { User } from "src/db/models/user";
import passport from "passport";
import { localStrategy } from "src/middlewares/auth/local";
import { Document } from "mongoose";

const router = Router();
export default router;

passport.use(localStrategy.name, localStrategy.strategy);

passport.serializeUser((user: any, done) => {
  process.nextTick(() => done(null, user.id));
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

router.get("/login", (req: Request, res: Response) => {
  res.send("Let's log you in");
});

router.post(
  "/logout",
  localStrategy.ensureAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    req.logout((err?: Error) => {
      if (err) {
        next(err);
      } else {
        res.redirect("/login");
      }
    });
  }
);

router.post(
  "/login",
  passport.authenticate(localStrategy.name, { failureRedirect: "/login" }),
  (req: Request, res: Response, next: NextFunction) => {
    res.redirect("/");
  }
);

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    if (
      [name, email, password].find(
        (field) => !field || typeof field != "string"
      )
    ) {
      next(new ValidationError("name, email and password required"));
      return;
    }

    const [beforeAt, afterAt] = String(email).split("@");
    if (!beforeAt || !afterAt || afterAt.split(".").length != 2) {
      next(new ValidationError("email has to follow pattern xxx@yyy.zzz"));
      return;
    }

    const newUser = new User({ name, email, password });

    try {
      await newUser.save();
      res.sendStatus(201);
    } catch (error) {
      next(error);
    }
  }
);
