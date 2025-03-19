import { Sequelize } from "sequelize";

import dotenv from "dotenv";

dotenv.config();

const sequelizeConfig: { [key: string]: string } = {
  database: process.env.MYSQL_DATABASE as string,
  user: process.env.MYSQL_USER as string,
  password: process.env.MYSQL_PASSWORD as string,
  host: process.env.MYSQL_HOST as string,
  port: process.env.MYSQL_PORT as string,
};

export const sequelize = new Sequelize(
  sequelizeConfig.database,
  sequelizeConfig.user,
  sequelizeConfig.password,
  {
    host: sequelizeConfig.host,
    port: parseInt(sequelizeConfig.port),
    dialect: "mysql",
    timezone: "+00:00",
    logging: console.log,
  }
);

if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    } finally {
      process.exit();
    }
  })();
}
