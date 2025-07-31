const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db/pool");

const JWT_SECRET = "your_jwt_secret_key";

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const query = "SELECT * FROM Registration_Text WHERE username = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    console.log("This is user", user);

    // Compare password (hashed)
    const isPassMatch = await bcrypt.compare(password, user.password); // Use `await` here
    if (isPassMatch) {
      const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, {
        expiresIn: "5000hr",
      });
      console.log(" Token Generated sucessfully :", token);
      // User authenticated successfully
      return res
        .status(200)
        .json({
          message: "Login Successful",
          userId: user.user_id,
          username: user.username,
          token: token,
        });
    } else {
      return res.status(400).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res
      .status(500)
      .json({
        error: "An error occurred during login",
        details: error.message,
      });
  }
};

module.exports = loginUser;
