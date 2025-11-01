const GithubIntegration = require("../models/GithubIntegration");
const GithubOrganization = require("../models/GithubOrganization");
const GithubRepo = require("../models/GithubRepo");
const GithubCommit = require("../models/GithubCommit");
const GithubPull = require("../models/GithubPull");
const GithubIssue = require("../models/GithubIssue");
const GithubIssueChangelog = require("../models/GithubIssueChangelog");
const GithubUser = require("../models/GithubUser");
const { createGhApi } = require("../helpers/ghApi");
const catchAsync = require("../helpers/catchAsync");


const isDateField = (field) => {
  const commonFields = ['updated_at', 'created_at', 'createdAt', 'updatedAt', 'merged_at', 'pushed_at', 'user', 'labels',]
  return commonFields.includes(field?.toString()?.trim())
}

const syncGithubData = catchAsync(async (req, res) => {
  try {
    const createdBy = req.integration.login;
    const token = req.integration.accessToken;
    const gh = createGhApi(token);

    const { data: orgs } = await gh.get("/user/orgs");
    console.log("🚀 ~ syncGithubData ~ org:", orgs)
    await GithubOrganization.deleteMany({ createdBy });
    await GithubOrganization.insertMany(orgs.map(r => ({ ...r, createdBy })));

    // For each org I'm fetching repos
    for (const org of orgs) {
      const { data: repos = [] } = await gh.get(`/orgs/${org.login}/repos?per_page=100`);
      await GithubRepo.insertMany(repos.map((r) => ({ ...r, createdBy })));

      for (const repo of repos) {
        const [commits, pulls, issues, changelogs ] = await Promise.all([
          gh.get(`/repos/${org.login}/${repo.name}/commits?per_page=100`).then(r => r.data).catch(() => []),
          gh.get(`/repos/${org.login}/${repo.name}/pulls?state=all&per_page=100`).then(r => r.data).catch(() => []),
          gh.get(`/repos/${org.login}/${repo.name}/issues?state=all&per_page=100`).then(r => r.data).catch(() => []),
          gh.get(`/repos/${org.login}/${repo.name}/issues/events?per_page=100`).then(r => r.data).catch(() => []),
        ]);

        if (commits.length)
          await GithubCommit.insertMany(commits.map(r => ({ ...r, message: r?.commit?.message, createdBy })));

        if (pulls.length)
          await GithubPull.insertMany(pulls.map(r => ({ ...r, createdBy })));

        if (issues.length)
          await GithubIssue.insertMany(issues.map(r => ({ ...r, createdBy })));

        if (changelogs.length)
          await GithubIssueChangelog.insertMany(changelogs.map(r => ({ ...r, createdBy })));
      }
    }

    // Lastly,  Users ( extracting unique user objects from commits)
    const users = [];
    await GithubUser.insertMany(users);

    res.json({ message: "Sync is successfully completed" });
  } catch (err) {
    console.error("syncGithubData error:", err);
    res.status(500).json({ error: err.message || "Error syncing GitHub data" });
  }
});


const getCollectionData = catchAsync(async (req, res) => {
  const { collection } = req.params;
  const { page = 1, limit = 10, search = "", sortField = "_id", sortDir = "desc", filters } = req.query;
  const createdBy = req.integration.login;


  const colMap = {
    github_commits: GithubCommit,
    github_repos: GithubRepo,
    github_issues: GithubIssue,
    github_pulls: GithubPull,
    github_users: GithubUser,
    github_organizations: GithubOrganization,
    github_issues_changelog: GithubIssueChangelog,
  };
  const Model = colMap[collection];
  if (!Model) return res.status(400).json({ error: "Invalid collection" });


  let query = { createdBy };


  const filterObj = filters ? JSON.parse(filters) : {};

  if (Object.keys(filterObj)?.length > 0) {
    Object.keys(filterObj).forEach((key, i) => {
      const value = filterObj[key];
      const regex = new RegExp(value, "i");
      if (!isNaN(Date.parse(value))) {
        query[key] = value;
      }
      else if (!isNaN(value) && value.trim() !== "") {
        query[key] = Number(value);
      }
      else {
        query[key] = regex;
      }
    });
  };

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [{ login: regex }, { message: regex }, { name: regex }, { title: regex }];
  };

  console.log("🚀 ~ getCollectionData ~ query and Collection:", JSON.stringify(query) + "--------------" + collection)


  const total = await Model.countDocuments(query);
  const data = await Model.find(query)
    .sort({ [sortField]: sortDir === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  res.status(200).json({ data, total });
});


const removeIntegration = catchAsync(async (req, res) => {
  const login = req.integration.login;

  await GithubIntegration.deleteOne({ login });
  // also clear all user-specific data
  await Promise.all([
    GithubRepo.deleteMany({ createdBy: login }),
    GithubCommit.deleteMany({ createdBy: login }),
    GithubIssue.deleteMany({ createdBy: login }),
    GithubPull.deleteMany({ createdBy: login }),
    GithubOrganization.deleteMany({ createdBy: login }),
    GithubUser.deleteMany({ createdBy: login })
  ]);
  res.json({ message: "Integration removed successfully" });
});


module.exports = {
  syncGithubData,
  getCollectionData,
  removeIntegration
}
