import { Strategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "src/db/models/user";
import passport from "passport";

const jwtSecret = "key_to_verify_signature";

type JSONObject = { [key: string]: any };

export const withToken = (data: JSONObject): JSONObject => {
  return { ...data, token: jwt.sign(data, jwtSecret, { expiresIn: "1d" }) };
};

const strategyName = "jwt";

export const jwtStrategy = {
  name: strategyName,

  strategy: new Strategy(
    {
      // Indicates extractor where to obtain the token from
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Secret key to verify the signature of the token
      secretOrKey: jwtSecret,
    },
    async (jwt_payload: JwtPayload, done: VerifiedCallback) => {
      // This is a verification callback
      // It gets called for every request to verify that the user is authenticated
      try {
        const user = await User.findById(jwt_payload.id);
        return done(null, user || false);
      } catch (error) {
        return done(error, false);
      }
    }
  ),
};

export const ensureAuthenticated = passport.authenticate(jwtStrategy.name, {
  session: false,
});
