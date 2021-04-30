import { MikroORM } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import path from "path";

import { __prod__ } from "./constants";

export default {
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: ["./dist/entities/**/*.js"],
  entitiesTs: ["./src/entities/**/*.ts"],
  type: "postgresql",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
