// const pool = require("../db/pool");

// const updateProfile = async (req, res) => {
//   const { id } = req.params;
//   const {
//     firstname,
//     lastname,
//     email,
//     mobileno,
//     altmobileno,
//     dob,
//     gender,
//     address,
//     village,
//     taluka,
//     district,
//     state,
//     pincode,
//     languages,
//   } = req.body;

//   // Validate if the required fields are provided
//   if (
//     !firstname ||
//     !lastname ||
//     !email ||
//     !mobileno ||
//     !altmobileno ||
//     !dob ||
//     !gender ||
//     !address ||
//     !village ||
//     !taluka ||
//     !district ||
//     !state ||
//     !pincode ||
//     !languages
//   ) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     const query = `
//             UPDATE Registration_Text
//             SET firstname = $1, lastname = $2,email=$3 , mobileno = $4,altmobileno = $5, dob = $6, gender = $7, address=$8, village=$9 , taluka=$10 , district=$11, state=$12, pincode=$13, languages = $14
//             WHERE user_id = $15
//             RETURNING *;
//         `;
//     const values = [
//       firstname,
//       lastname,
//       email,
//       mobileno,
//       altmobileno,
//       dob,
//       gender,
//       address,
//       village,
//       taluka,
//       district,
//       state,
//       pincode,
//       languages,
//       id,
//     ];

//     const result = await pool.query(query, values);

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res
//       .status(200)
//       .json({ message: "Profile Updated Successfully", user: result.rows[0] });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // Fetch user details
// const getUserDetails = async (req, res) => {
//   const { id } = req.params;

//   try {
//     //const query =
//     // "SELECT firstname, lastname,email, mobileno,altmobileno, dob, gender, address , village, taluka, district,state, pincode, languages FROM Registration_Text WHERE user_id = $1;";
//     const query = `
//       SELECT rt.firstname, rt.lastname, rt.dob , rt.email, rt.mobileno, rt.altmobileno, rt.address, rt.village, rt.taluka, rt.district, rt.state, rt.gender, rt.pincode, rt.languages, rf.photo , rf.kycvideo , rf.kycdocument_1,  rf.kycdocument_2
//       FROM Registration_Text rt
//       JOIN Registration_Files rf ON rt.user_id = rf.user_id
//       WHERE rt.user_id = $1;
//   `;
//     const values = [id];

//     const result = await pool.query(query, values);

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(result.rows[0]);
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// module.exports = { updateProfile, getUserDetails };


const multer = require("multer");
const path = require("path");
const pool = require("../db/pool");

// Setup Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext; // Use timestamp to avoid filename conflicts
    cb(null, filename);
  },
});

// Initialize multer with storage configuration
const upload = multer({ storage: storage });

const updateProfile = async (req, res) => {
  const { id } = req.params;
  const {
    firstname,
    lastname,
    email,
    mobileno,
    altmobileno,
    dob,
    gender,
    address,
    village,
    taluka,
    district,
    state,
    pincode,
    languages,
  } = req.body;

  // Ensure languages is an array (if it's not an array already)
  const languagesArray = Array.isArray(languages) ? languages : [languages];

  // Convert languages array to PostgreSQL array format
  const languagesFormatted = `{${languagesArray.join(",")}}`;

  // Accessing the uploaded files directly
  const { photo, kycvideo, kycdocument_1, kycdocument_2 } = req.files;

  if (
    !firstname ||
    !lastname ||
    !email ||
    !mobileno ||
    !altmobileno ||
    !dob ||
    !gender ||
    !address ||
    !village ||
    !taluka ||
    !district ||
    !state ||
    !pincode ||
    !languages
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // SQL query to update profile
    const query = `
      UPDATE Registration_Text
      SET 
        firstname = $1, 
        lastname = $2, 
        email = $3, 
        mobileno = $4, 
        altmobileno = $5, 
        dob = $6, 
        gender = $7, 
        address = $8, 
        village = $9, 
        taluka = $10, 
        district = $11, 
        state = $12, 
        pincode = $13, 
        languages = $14
      WHERE user_id = $15
      RETURNING *;
    `;

    const values = [
      firstname,
      lastname,
      email,
      mobileno,
      altmobileno,
      dob,
      gender,
      address,
      village,
      taluka,
      district,
      state,
      pincode,
      languagesFormatted,
      id,
    ];
    const result = await pool.query(query, values);

    // Check if the user was found and updated
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // If files exist, update the Registration_Files table
    if (photo || kycvideo || kycdocument_1 || kycdocument_2) {
      const fileQuery = `
        UPDATE Registration_Files
        SET 
          photo = $1, 
          kycvideo = $2, 
          kycdocument_1 = $3, 
          kycdocument_2 = $4
        WHERE user_id = $5;
      `;
      const fileValues = [
        photo ? photo[0].path : null,
        kycvideo ? kycvideo[0].path : null,
        kycdocument_1 ? kycdocument_1[0].path : null,
        kycdocument_2 ? kycdocument_2[0].path : null,
        id,
      ];
      await pool.query(fileQuery, fileValues);
    }

    res
      .status(200)
      .json({ message: "Profile Updated Successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch user details with file paths
const getUserDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT rt.firstname, rt.lastname,rt.email,rt.mobileno,rt.altmobileno, rt.dob, rt.gender,rt.address,rt.village,rt.taluka,rt.district,rt.state,rt.pincode, rt.languages, 
             rf.photo, rf.kycvideo, rf.kycdocument_1, rf.kycdocument_2
      FROM Registration_Text rt
      JOIN Registration_Files rf ON rt.user_id = rf.user_id
      WHERE rt.user_id = $1;
    `;
    const values = [id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateProfile, getUserDetails, upload };
