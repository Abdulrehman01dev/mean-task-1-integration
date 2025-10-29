const express = require("express");
const router = express.Router();
const { connectWithGithub, githubOAuthCallback, authenticate } = require("../controllers/authController");

// On page load hit
router.get("/authenticate", authenticate);

router.get("/github/oauth/url", connectWithGithub);
router.get("/github/oauth/callback", githubOAuthCallback);

module.exports = router;


