import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PassportStatic } from 'passport';
import prisma from '../client';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
};

export default (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: jwt_payload.userId } });
        if (user) return done(null, user);
        else return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
