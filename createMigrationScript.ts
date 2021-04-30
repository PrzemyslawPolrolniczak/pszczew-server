import { MikroORM } from "@mikro-orm/core";
import { config as dotEnvConfig } from "dotenv";
import mikroOrmConfig from "./src/mikro-orm.config";

(async () => {
  dotEnvConfig();

  const orm = await MikroORM.init({
    ...mikroOrmConfig,
    dbName: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  });

  const migrator = orm.getMigrator();
  await migrator.createMigration();

  await orm.close(true);
})();
