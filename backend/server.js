const express = require("express");
const cors = require("cors");
const setupDatabase = require("./db/setup");
const registrationRoutes = require("./routes/registration");
const loginUser = require("./controller/logincontroller");
const voterRoutes = require("./routes/voterRoutes");
const userRoutes = require("./routes/userRouts");

const app = express();

app.use("/uploads", express.static("uploads"));

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Setup the database and server
const startServer = async () => {
  try {
    // console.log("Starting database setup");
    await setupDatabase();
    //console.log("Database setup completed and connected to the database");

    // Create the regisuccessfullystration table (ensuring it's done after DB setup)
    const createRegistrationTable = require("./db/createRegistratioTable");
    await createRegistrationTable();
    //console.log("Registration table created successfully");

    // Routes
    app.use("/registration", registrationRoutes);
    app.use("/login", loginUser);
    app.use(voterRoutes);
    app.use("/api/users", userRoutes);

    // Start the server
    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error during server setup:", err.message);
  }
};
startServer(); // Call the function to start the server after database setup
