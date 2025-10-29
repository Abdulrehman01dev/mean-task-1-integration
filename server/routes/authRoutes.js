const express = require("express");
const router = express.Router();
const { connectWithGithub, githubOAuthCallback } = require("../controllers/authController");

router.get("/github/oauth/url", connectWithGithub);
router.get("/github/oauth/callback", githubOAuthCallback);

module.exports = router;


