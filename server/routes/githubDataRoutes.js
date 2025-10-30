const express = require("express");
const router = express.Router();
const githubDataController = require("../controllers/githubDataController");

router.post("/resync/:login", githubDataController.syncGithubData);
router.get("/data/:collection", githubDataController.getCollectionData);

module.exports = router;
