const express = require("express");
const router = express.Router();
const githubDataController = require("../controllers/githubDataController");
const authMiddleware = require("../helpers/authMiddleware");

// Re-Sync github data
router.post("/resync", authMiddleware, githubDataController.syncGithubData);
// Get github data
router.get("/data/:collection", authMiddleware, githubDataController.getCollectionData);
// Delete github data
router.delete("/remove", authMiddleware, githubDataController.removeIntegration);
// Search data across all collections
router.get("/search", authMiddleware, githubDataController.removeIntegration);

module.exports = router;
