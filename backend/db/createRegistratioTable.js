const { Client } = require("pg");
const databaseName = "voterdb";


// Connect to this database for table creation
const createTables = async () => {
  const client = new Client({
    user: "postgres",
    password: "188227",
    host: "localhost",
    port: 4000,
    database: databaseName, // Use the database that we created
  }); 
  try {
    await client.connect();
    console.log(`Connected to ${databaseName} database`);
    // SQL query to create the registration table
    const createRegistrationTableQuery = `
      CREATE TABLE IF NOT EXISTS Registration_Text (
        user_id SERIAL PRIMARY KEY,  -- Renamed from userid to user_id
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        dob DATE,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobileno VARCHAR(15),
        altmobileno VARCHAR(15),
        gender VARCHAR(10),
        address TEXT,
        village VARCHAR(100),
        taluka VARCHAR(100),
        district VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        languages TEXT[],
        "terms" BOOLEAN,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    // SQL query to create the user_documents table
    const createUserDocumentsTableQuery = `
      CREATE TABLE IF NOT EXISTS Registration_Files (
        document_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,  -- Renamed from userid to user_id
        photo TEXT,
        kycvideo TEXT,
        kycdocument_1 TEXT,
        kycdocument_2 TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Registration_Text(user_id) ON DELETE CASCADE  -- Updated foreign key reference
      );
    `;

    const voterDeatailQuery = `
    CREATE TABLE IF NOT EXISTS Voter_Detail2 (
    id SERIAL PRIMARY KEY,
     user_id INT  REFERENCES Registration_Text(user_id),
    employment_status VARCHAR(255),
    job_role VARCHAR(255),
    industry VARCHAR(255),
    experience VARCHAR(255),
    spouse_name VARCHAR(255),
    family_dependents INT,
    education_level VARCHAR(255),
    education_institute VARCHAR(255),
    education_certifications VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

    // Execute the queries to create the tables
    await client.query(createRegistrationTableQuery);
   // console.log("Registration table created successfully");
    await client.query(createUserDocumentsTableQuery);
    //console.log("User documents table created successfully");
    await client.query(voterDeatailQuery);
    //console.log("Voter Deatail table created successfully");
  } catch (err) {
    console.error("Error creating tables:", err.message);
  } finally {
    await client.end();
    //console.log("Disconnected from the database.");
  }
};
module.exports = createTables;
