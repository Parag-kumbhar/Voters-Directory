const express = require("express");
const voterController = require("../controller/voterController");

const router = express.Router();

// Endpoint to handle voter details form submission
router.post(
  "/voter-details",
  voterController.upload.single("education_certifications"),
  voterController.addUserDetails
);

module.exports = router;
