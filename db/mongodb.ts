import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  connectionOptions: {
    retryWrites: "true",
    w: "majority",
    appName: "Cluster0",
  },

  getURI: function () {
    const urlParams = new URLSearchParams(this.connectionOptions);

    return `mongodb+srv://${this.user}:${this.password}@${this.host}/?${urlParams}`;
  },
};

const client = new MongoClient(mongoConfig.getURI(), {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbName = process.env.DB_NAME;
if (!dbName) {
  process.exit("DB_NAME is required");
}

export { client, dbName as String };

// Only run this if the file is executed directly
if (require.main === module && process.argv.includes("--test")) {
  // Test the connection
  async function main() {
    try {
      await client.connect();
      console.log("Connected successfully to MongoDB");

      // List all databases
      const dbs = await client.db().admin().listDatabases();
      console.log("Databases:", dbs.databases);
    } catch (err) {
      console.error("Failed to connect:", err);
    } finally {
      await client.close();
    }
  }

  main().catch(console.error);
}
