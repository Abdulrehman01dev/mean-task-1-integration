const axios = require("axios");
const GithubIntegration = require("../models/GithubIntegration");
const GithubOrganization = require("../models/GithubOrganization");
const GithubRepo = require("../models/GithubRepo");
const GithubCommit = require("../models/GithubCommit");
const GithubPull = require("../models/GithubPull");
const GithubIssue = require("../models/GithubIssue");
const GithubUser = require("../models/GithubUser");

const syncGithubData = async (req, res) => {
  try {
    const { login } = req.params;
    const integration = await GithubIntegration.findOne({ login });
    if (!integration) return res.status(404).json({ error: "Integration not found" });

    const createdBy = login;
    const token = integration.accessToken;
    const gh = axios.create({
      baseURL: "https://api.github.com",
      headers: { Authorization: `Bearer ${token}` },
    });

    // 1. Get aLl orgs
    const { data: orgs } = await gh.get("/user/orgs");
    console.log("🚀 ~ syncGithubData ~ org:", orgs)
    await GithubOrganization.deleteMany({}); // optionallly clearing
    await GithubOrganization.insertMany(orgs.map(r => ({ ...r, createdBy })));

    // For each org I'm fetching repos
    for (const org of orgs) {
      const { data: repos = [] } = await gh.get(`/orgs/${org.login}/repos?per_page=100`);
      await GithubRepo.insertMany(repos?.map(r => ({ ...r, createdBy })));

      for (const repo of repos) {
        // Commits
        const { data: commits = [] } = await gh.get(`/repos/${org.login}/${repo.name}/commits?per_page=100`);
        await GithubCommit.insertMany(commits.map(r => ({ ...r, createdBy })));

        // Pull requests
        const { data: pulls = [] } = await gh.get(`/repos/${org.login}/${repo.name}/pulls?state=all&per_page=100`);
        await GithubPull.insertMany(pulls.map(r => ({ ...r, createdBy })));

        // Issues
        const { data: issues = [] } = await gh.get(`/repos/${org.login}/${repo.name}/issues?state=all&per_page=100`);
        await GithubIssue.insertMany(issues.map(r => ({ ...r, createdBy })));
      }
    }

    // Lastly,  Users ( extracting unique user objects from commits)
    const users = [];
    await GithubUser.insertMany(users);

    res.json({ message: "Sync is successfully completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error syncing the github data' });
  }
};


const getCollectionData = async (req, res) => {
  const { collection } = req.params;
  const { page = 1, limit = 10, search = "" } = req.query;

  const colMap = {
    github_commits: GithubCommit,
    github_repos: GithubRepo,
    github_issues: GithubIssue,
    github_pulls: GithubPull,
    github_users: GithubUser,
    github_organizations: GithubOrganization,
  };
  const Model = colMap[collection];
  if (!Model) return res.status(400).json({ error: "Invalid collection" });

  const query = {};

  if (search) {
    query.search =
    {
      $or:
        [{ message: new RegExp(search, "i") }, { login: new RegExp(search, "i") }]
    };
  }


  const total = await Model.countDocuments(query);
  const data = await Model.find(query)
    .limit(Number(limit))
    .skip((page - 1) * limit)
    .lean();
  console.log("🚀 ~ getCollectionData ~ data:", data)

  res.json({ data, total });
};


module.exports = {
  syncGithubData,
  getCollectionData
}
