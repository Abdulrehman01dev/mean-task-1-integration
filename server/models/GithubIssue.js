const mongoose = require("mongoose");

const GithubIssueSchema = new mongoose.Schema({
  issue_number: Number,
  repoName: String,
  title: String,
  body: String,
  state: String,
  user: {
    login: String,
    avatar_url: String,
  },
  labels: [],
  comments: Number,
  created_at: Date,
  updated_at: Date,
  closed_at: Date,
  createdBy : String,
}, { timestamps: true });

module.exports = mongoose.model("GithubIssue", GithubIssueSchema, "github_issues");
