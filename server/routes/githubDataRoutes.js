const express = require("express");
const router = express.Router();
const githubDataController = require("../controllers/githubDataController");
const authMiddleware = require("../helpers/authMiddleware");

router.post("/resync", authMiddleware, githubDataController.syncGithubData);
router.get("/data/:collection", authMiddleware, githubDataController.getCollectionData);

module.exports = router;
