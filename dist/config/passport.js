"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const client_1 = __importDefault(require("../client"));
const opts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
};
exports.default = (passport) => {
    passport.use(new passport_jwt_1.Strategy(opts, async (jwt_payload, done) => {
        try {
            const user = await client_1.default.user.findUnique({ where: { id: jwt_payload.userId } });
            if (user)
                return done(null, user);
            else
                return done(null, false);
        }
        catch (err) {
            return done(err, false);
        }
    }));
};
