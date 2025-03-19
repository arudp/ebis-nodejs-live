import dotenv from "dotenv";
import { Connection, createConnection } from "mysql2/promise";

dotenv.config();

const connectionConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT as string),
  timezone: "+00:00",
};

let patched = false;

export const MySQL = {
  _connection: null as null | Connection,
  connect: async function () {
    this._connection = await createConnection(connectionConfig);
    console.log("Connected to MySQL");
  },
  disconnect: async function () {
    await this._connection?.end();
  },
  get: function (): Connection {
    if (!patched && this._connection) {
      const query = this._connection.query;
      // @ts-ignore: Monkey patching query method for logging
      this._connection.query = (...args) => {
        const queryCmd = query.apply(this._connection, args as any);
        console.log(args[0], JSON.stringify(args[1]));
        return queryCmd;
      };
    }

    if (!this._connection === null) {
      throw new Error("Not connected");
    }

    return this._connection as Connection;
  },
};

if (require.main === module) {
  async function testConnection() {
    try {
      await MySQL.connect();
      const results = await MySQL.get().query("select 1");
      console.log("Connection test successful");
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      await MySQL.disconnect();
    }
  }
  testConnection().catch(console.dir);
}
