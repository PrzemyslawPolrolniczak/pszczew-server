import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import { config as dotEnvConfig } from "dotenv";
import express from "express";
import session from "express-session";
import redis from "redis";
import { buildSchema } from "type-graphql";

import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { ReservationResolver } from "./resolvers/reservation";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";

const main = async () => {
  dotEnvConfig();

  const orm = await MikroORM.init({
    ...mikroOrmConfig,
    dbName: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  });
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      secret: process.env.SESSION_SECRET!,
      resave: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__,
      },
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, ReservationResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(process.env.APP_PORT, () => {
    console.log(`server started on localhost:${process.env.APP_PORT}`);
  });
};

main();
