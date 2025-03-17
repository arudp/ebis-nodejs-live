import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { Strategy, IStrategyOptionsWithRequest } from "passport-local";
import { User } from "src/db/models/user";
import { withToken } from "src/middlewares/auth/jwt";

// Options object, we tell Passport what fields are the ones to use as
// username and password fields, in this case, email and password
const strategyOptions: IStrategyOptionsWithRequest = {
  passReqToCallback: true,
  usernameField: "email",
  passwordField: "password",
};

const strategyName = "local";

export const localStrategy = {
  name: strategyName,

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
        return done(null, user.toObject());
      } else {
        return done(null, false, { message: "Incorrect password" });
      }
    }
  ),
};
