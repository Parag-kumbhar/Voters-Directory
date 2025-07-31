const { Pool } = require("pg");
const pool = require("../db/pool");

const checkUserIdExists = async (user_id) => {
  const client = await pool.connect();
  try {
    const query = "SELECT user_id FROM Registration_Text WHERE user_id = $1";
    const result = await client.query(query, [user_id]);

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking user_id:", error);
    throw error;
  } finally {
    client.release();   
  }
};

const createUserDetails = async (userDetails) => {
  const client = await pool.connect();
  try {
    const userDetailsQuery = `
      INSERT INTO Voter_Detail2
        (user_id, employment_status, job_role, industry, experience, spouse_name, 
         family_dependents,  education_level,education_institute,  education_certifications) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const userDetailsValues = [
      userDetails.user_id,
      userDetails.employment_status,
      userDetails.job_role,
      userDetails.industry,
      userDetails.experience,
      userDetails.spouse_name,
      userDetails.family_dependents,
      userDetails.education_level,
      userDetails.education_institute,
      userDetails.education_certifications,
    ];

    const result = await client.query(userDetailsQuery, userDetailsValues);
    return {
      message: "Voter details saved successfully",
      userDetailsId: result.rows[0].id,
    };
  } catch (error) {
    console.error("Error inserting user details:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createUserDetails, checkUserIdExists };
