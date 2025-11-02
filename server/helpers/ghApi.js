// ghApi.js
const axios = require("axios");
const GithubIntegration = require("../models/GithubIntegration");

// Factory function that returns a GitHub API client for a given token
const createGhApi = (token) => {
  const instance = axios.create({
    baseURL: "https://api.github.com",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  instance.interceptors.response.use(
    (res) => res,
    async (err) => {
      console.log("🚀 ~ GitHub API Error:", err?.response?.status, err);

      if (err.response?.status === 401 && token) {
        await GithubIntegration.deleteOne({ accessToken: token });
        console.log("GitHub token expired. Integration removed.");
        return Promise.reject(new Error("GitHub token expired. Please reconnect."));
      }

      return Promise.reject(err);
    }
  );

  return instance;
};

module.exports = { createGhApi };
