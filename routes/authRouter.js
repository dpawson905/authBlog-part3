const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

/* GET home page. */
router.get("/", authController.authPlaceholder);

module.exports = router;