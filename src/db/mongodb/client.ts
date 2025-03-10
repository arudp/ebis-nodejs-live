import { MongoClient, ServerApiVersion } from "mongodb";
import { mongoConfig } from "src/db/mongodb/config";

const client = new MongoClient(mongoConfig.getURI(), {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export { client };

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
