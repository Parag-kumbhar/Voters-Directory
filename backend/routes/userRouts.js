// const express = require("express");
// const router = express.Router();
// const {
//   updateProfile,
//   getUserDetails,
// } = require("../controller/userController");

// // PUT route to update firstname
// router.put("/updateProfile/:id", updateProfile);

// // GET route to fetch user details
// router.get("/:id", getUserDetails);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getUserDetails,
  upload,
} = require("../controller/userController");

// PUT route to update profile with file uploads
router.put(
  "/updateProfile/:id",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "kycvideo", maxCount: 1 },
    { name: "kycdocument_1", maxCount: 1 },
    { name: "kycdocument_2", maxCount: 1 },
  ]),
  updateProfile
);

// GET route to fetch user details
router.get("/:id", getUserDetails);

module.exports = router;
