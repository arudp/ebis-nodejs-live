import dotenv from "dotenv";

dotenv.config();

export const mongoConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dbName: process.env.DB,
  connectionOptions: {
    retryWrites: "true",
    w: "majority",
    appName: "Cluster0",
  },

  getURI: function () {
    const urlParams = new URLSearchParams(this.connectionOptions);

    return `mongodb+srv://${this.user}:${this.password}@${this.host}/${this.dbName}?${urlParams}`;
  },
};
