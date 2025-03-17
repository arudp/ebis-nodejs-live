import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { Strategy, IStrategyOptionsWithRequest } from "passport-local";
import { User } from "src/db/models/user";

// Options object, we tell Passport what fields are the ones to use as
// username and password fields, in this case, email and password
const strategyOptions: IStrategyOptionsWithRequest = {
  passReqToCallback: true,
  usernameField: "email",
  passwordField: "password",
};

export const localStrategy = {
  name: "local",

  strategy: new Strategy(
    strategyOptions,
    async (req, email, password, done) => {
      let user;
      try {
        user = await User.findOne({ email });
      } catch (error) {
        return done(error);
      }
      if (!user) {
        // What's wrong with this message?
        return done(null, false, { message: "Incorrect email." });
      }

      if (user.password === password) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password" });
      }
    }
  ),
  getAuthenticationFunction: function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return passport.authenticate(
      this.name,
      (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).send({ message: info.message });
        }

        req.login(user, (err: Error) => {
          if (err) {
            next(err);
          }
          res.send(user);
        });
      }
    );
  },
  ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.sendStatus(401);
    }
  },
};
