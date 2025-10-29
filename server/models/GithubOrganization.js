const mongoose = require("mongoose");

const GithubOrganizationSchema = new mongoose.Schema({
  orgId: Number,
  login: String,
  name: String,
  description: String,
  url: String,
  repos_url: String,
  members_url: String,
  avatar_url: String,
  type: String,
  created_at: Date,
  updated_at: Date,
}, { timestamps: true });

module.exports = mongoose.model("GithubOrganization", GithubOrganizationSchema, "github_organizations");
