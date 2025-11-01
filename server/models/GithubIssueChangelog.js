const mongoose = require("mongoose");

const GithubIssueChangelogSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    event: String,
    actor: {
      login: String,
      id: Number,
      avatar_url: String,
      url: String,
    },
    issue: {
      id: Number,
      title: String,
      number: Number,
      url: String,
    },
    repoName: String,
    orgName: String,
    createdBy: String,
    created_at: Date,
    raw: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GithubIssueChangelog", GithubIssueChangelogSchema, "github_issue_changelogs");