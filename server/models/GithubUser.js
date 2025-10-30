const mongoose = require("mongoose");

const GithubUserSchema = new mongoose.Schema({
  userId: Number,
  login: String,
  name: String,
  avatar_url: String,
  type: String,
  site_admin: Boolean,
  html_url: String,
  createdBy : String,
}, { timestamps: true });

module.exports = mongoose.model("GithubUser", GithubUserSchema, "github_users");
