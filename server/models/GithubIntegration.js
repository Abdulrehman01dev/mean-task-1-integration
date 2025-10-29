const mongoose = require("mongoose");

const GithubIntegrationSchema = new mongoose.Schema({
    githubId: { type: String, required: true },
    login: String,
    name: String,
    avatar_url: String,
    accessToken: String,
    connectedAt: { type: Date, default: Date.now },
    
}, { timestamps: true });

module.exports = mongoose.model("GithubIntegration", GithubIntegrationSchema, "github-integration");
