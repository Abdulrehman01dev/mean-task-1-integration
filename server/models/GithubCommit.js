const mongoose = require("mongoose");

const GithubCommitSchema = new mongoose.Schema({
  sha: String,
  repoName: String,
  orgName: String,
  author: {
    name: String,
    email: String,
    date: Date,
  },
  committer: {
    name: String,
    email: String,
    date: Date,
  },
  message: String,
  html_url: String,
  createdBy : String,
}, { timestamps: true });

module.exports = mongoose.model("GithubCommit", GithubCommitSchema, "github_commits");
