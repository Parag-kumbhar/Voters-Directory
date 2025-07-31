const { Client } = require("pg");
const defaultClient = new Client({
  user: "postgres",
  password: "188227",
  host: "localhost",
  port: 4000,
  database: "postgres", // Connect to the default database first
});
const databaseName = "voterdb"; // here we create the database
// Function to set up the database
const setupDatabase = async () => {
  try {
    await defaultClient.connect();
    console.log("Connected to PostgreSQL");
    // Check if the database exists
    const result = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName]
    );
    if (result.rowCount === 0) {
      console.log(`Database "${databaseName}" does not exist, creating it...`);
      await defaultClient.query(`CREATE DATABASE ${databaseName}`);
      console.log(`Database "${databaseName}" created successfully`);
    } else {
      console.log(`Database "${databaseName}" already exists`);
    }
    await defaultClient.end(); // Disconnect from the default database
  } catch (err) {
    console.error("Error setting up database:", err.message);
  }
};
module.exports = setupDatabase;
