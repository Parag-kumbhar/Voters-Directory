const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const upload = require("../middlewres/multerConfig");
// login is
const bcrypt = require("bcrypt");

// POST: Handle registration
router.post(
  "/",
  upload.fields([
    { name: "photo" },
    { name: "kycvideo" },
    { name: "kycdocument_1" },
    { name: "kycdocument_2" },
  ]),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        firstname,
        lastname,
        dob,
        email,
        mobileno,
        altmobileno,
        gender,
        address,
        village,
        taluka,
        district,
        state,
        pincode,
        languages,
        username,
        password,
      } = req.body;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Process uploaded files
      const photo = req.files.photo ? req.files.photo[0].path : null;
      const kycvideo = req.files.kycvideo ? req.files.kycvideo[0].path : null;
      const kycdocument_1 = req.files.kycdocument_1
        ? req.files.kycdocument_1[0].path
        : null;
      const kycdocument_2 = req.files.kycdocument_2
        ? req.files.kycdocument_2[0].path
        : null;
      // Begin transaction
      await client.query("BEGIN");
      // Insert into Registration_Text table
      const registrationQuery = `
        INSERT INTO Registration_Text (
          firstname, lastname, dob, email, mobileno, altmobileno, gender, address,
          village, taluka, district, state, pincode, languages, username, password
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING user_id  -- Changed from userid to user_id
      `;
      const registrationValues = [
        firstname,
        lastname,
        dob,
        email,
        mobileno,
        altmobileno,
        gender,
        address,
        village,
        taluka,
        district,
        state,
        pincode,
        `{${Array.isArray(languages) ? languages.join(",") : languages}}`, // Convert to PostgreSQL array
        username,
        hashedPassword,
      ];
      const registrationResult = await client.query(
        registrationQuery,
        registrationValues
      );
      const user_id = registrationResult.rows[0].user_id; // Changed from userid to user_id
      // Insert into Registration_Files table
      const documentsQuery = `
        INSERT INTO Registration_Files (user_id, photo, kycvideo, kycdocument_1, kycdocument_2)
        VALUES ($1, $2, $3, $4, $5)  -- Changed from userid to user_id
      `;
      const documentsValues = [
        user_id,
        photo,
        kycvideo,
        kycdocument_1,
        kycdocument_2,
      ];
      await client.query(documentsQuery, documentsValues);
      // Commit transaction
      await client.query("COMMIT");
      res.json({ user_id, message: "User registered successfully" }); // Changed from userid to user_id
    } catch (error) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      console.error("Error during registration:", error.message);
      res.status(500).send("Server Error");
    } finally {
      client.release();
    }
  }
);
// GET: Fetch all registrations
router.get("/", async (req, res) => {
  try {
    const allRegistrationsQuery = `
      SELECT
        r.*,
        d.photo, d.kycvideo, d.kycdocument_1, d.kycdocument_2
      FROM Registration_Text r
      LEFT JOIN Registration_Files d ON r.user_id = d.user_id  -- Changed from userid to user_id
    `;
    const allRegistrations = await pool.query(allRegistrationsQuery);
    res.json(allRegistrations.rows);
  } catch (error) {
    console.error("Error fetching registrations:", error.message);
    res.status(500).send("Server Error");
  }
});
// GET: Fetch a specific registration by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const registrationQuery = `
      SELECT
        r.*,
        d.photo, d.kycvideo, d.kycdocument_1, d.kycdocument_2
      FROM Registration_Text r
      LEFT JOIN Registration_Files d ON r.user_id = d.user_id  -- Changed from userid to user_id
      WHERE r.user_id = $1  -- Changed from userid to user_id
    `;
    const registration = await pool.query(registrationQuery, [id]);
    if (registration.rows.length === 0) {
      return res.status(404).send("Registration not found");
    }
    res.json(registration.rows[0]);
  } catch (error) {
    console.error("Error fetching registration by ID:", error.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
