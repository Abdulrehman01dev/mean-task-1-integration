const mongoose = require("mongoose");

const GithubPullSchema = new mongoose.Schema({
  pull_number: Number,
  repoName: String,
  title: String,
  state: String,           // open, closed, merged
  html_url: String,
  user: {
    login: String,
    avatar_url: String,
  },
  created_at: Date,
  updated_at: Date,
  merged_at: Date,
  createdBy : String,
}, { timestamps: true });

module.exports = mongoose.model("GithubPull", GithubPullSchema, "github_pulls");
