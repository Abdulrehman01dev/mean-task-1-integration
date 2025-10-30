const express = require("express");
const router = express.Router();
const { connectWithGithub, githubOAuthCallback, authenticate } = require("../controllers/authController");
const authMiddleware = require("../helpers/authMiddleware");

// On page load hit
router.get("/authenticate", authMiddleware, authenticate);

router.get("/github/oauth/url", connectWithGithub);
router.get("/github/oauth/callback", githubOAuthCallback);

module.exports = router;


