import { Router, Request, Response, NextFunction } from "express";
import { ValidationError } from "src/errors";
import { User } from "src/db/models/user";
import passport from "passport";
import { localStrategy } from "src/middlewares/auth/local";
import {
  ensureAuthenticated,
  jwtStrategy,
  withToken,
} from "src/middlewares/auth/jwt";

const router = Router();
export default router;

passport.use(localStrategy.name, localStrategy.strategy);
passport.use(jwtStrategy.name, jwtStrategy.strategy);

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
  ensureAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    res.send(200); // No logging out with JWT - could add token to blacklist
  }
);

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    localStrategy.name,
    { session: false },
    (err: any, user?: Express.User | false | null) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).redirect("/login");
      }
      return res.send(withToken(user));
    }
  )(req, res, next);
});

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
