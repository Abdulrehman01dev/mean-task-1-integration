const express = require("express");
const router = express.Router();
const routes = require("./index");
// Destructure all routes from index.js

// Auth routes
router.use("/auth", routes.authRoutes);

// Github Data routes
router.use("/github", routes.githubDataRoutes);

module.exports = router;
