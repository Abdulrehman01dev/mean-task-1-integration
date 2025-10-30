const mongoose = require("mongoose");

const GithubRepoSchema = new mongoose.Schema({
  repoId: Number,
  orgLogin: String, // organization name
  name: String,
  full_name: String,
  private: Boolean,
  html_url: String,
  description: String,
  fork: Boolean,
  created_at: Date,
  updated_at: Date,
  pushed_at: Date,
  size: Number,
  language: String,
  forks_count: Number,
  stargazers_count: Number,
  watchers_count: Number,
  default_branch: String,
  createdBy : String,
}, { timestamps: true });

module.exports = mongoose.model("GithubRepo", GithubRepoSchema, "github_repos");
