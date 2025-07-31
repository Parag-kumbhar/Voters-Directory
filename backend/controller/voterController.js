const multer = require("multer");
const path = require("path");
const {
  createUserDetails,
  checkUserIdExists,
} = require("../models/voterModel");

// Set up file storage using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Add user details to the database
const addUserDetails = async (req, res) => {
  try {
    const userDetails = req.body;

    // If a file is uploaded, save the filename in the userDetails object
    if (req.file) {
      userDetails.education_certifications = req.file.filename;
    }

    // Check if mandatory fields are provided
    if (
      !userDetails.user_id ||
      !userDetails.employment_status ||
      !userDetails.job_role ||
      !userDetails.industry
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields for user details" });
    }

    // Verify if the user exists in the registration table
    const userExists = await checkUserIdExists(userDetails.user_id);
    if (!userExists) {
      return res
        .status(400)
        .json({ error: "User ID does not exist in Registration_Text" });
    }

    // Convert experience years into an integer
    if (userDetails.experience === "0-1") {
      userDetails.experience = 0;
    } else {
      userDetails.experience = parseInt(userDetails.experience, 10);
    }

    // Save user details to the database
    const savedDetails = await createUserDetails(userDetails);
    return res
      .status(201)
      .json({ message: "Voter Details Added Successfully", savedDetails });
  } catch (error) {
    console.error("Error while adding user details:", error);
    return res.status(500).json({ error: "Failed to add user details" });
  }
};

module.exports = { upload, addUserDetails };
  