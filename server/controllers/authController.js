const axios = require("axios");
const GithubIntegration = require("../models/GithubIntegration");


const connectWithGithub = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callback = process.env.GITHUB_CALLBACK_URL;
  const scope = encodeURIComponent("repo,read:org,user");

  if (!clientId || !callback) {
    return res.status(500).json({ message: "GitHub OAuth env vars missing" });
  }

  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    callback
  )}&scope=${scope}`;
  return res.json({ url: redirectUri });
}

const githubOAuthCallback = async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";

  if (!code) {
    return res.redirect(`${frontendUrl}/integrations/github?status=error&reason=missing_code`);
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data && tokenResponse.data.access_token;
    console.log("🚀 ~ githubOAuthCallback ~ accessToken:", accessToken)
    if (!accessToken) {
        return res.status(500).json({succes: false, message: 'Token is not authorize'});
    }

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userData = userResponse.data || {};
    console.log("🚀 ~ githubOAuthCallback ~ userData:", userData)

    // Save or update integration in MongoDB
    try {
      await GithubIntegration.findOneAndUpdate(
        { githubId: String(userData.id) },
        {
          githubId: String(userData.id),
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          url: userData.url,
          accessToken: accessToken,
          connectedAt: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      // continue even if DB write fails (keeping it simple)
      console.error("GitHub integration DB save error:", dbErr?.message || dbErr);
    }

    // Redirect to frontend with token so client can store it
    return res.status(200).json({succes: true, token: accessToken});

  } catch (err) {
    console.error("GitHub OAuth error:", err?.response?.data || err?.message || err);
    return res.status(500).json({succes: false, message: 'Unable to authorize.'});
  }
}

// Simple authenticate endpoint to check if a provided token is valid with GitHub
const authenticate = async (req, res) => {
  try {
    // Token
    const authHeader = req.headers.authorization || "";
    const bearerMatch = authHeader.match(/^Bearer\s+(.*)$/i);
    const token = bearerMatch?.[1] || req.query.token || req.body?.token;

    if(!token){
      return res.status(401).json({message: "No token provided!"});
    }

    // Checking if user exists in DB
    const integration = await GithubIntegration.findOne({ accessToken: token } ).sort({ connectedAt: -1 });

    if (!integration) {
      return res.status(500).json({ connected: false });
    }

    // 2️⃣ Return data from DB (no GitHub API call here)
    return res.status(200).json({
      connected: true,
      user: {
        login: integration.login,
        name: integration.name,
        avatar_url: integration.avatar_url,
        url: integration?.url,
        connectedAt: integration.connectedAt,
      },
    });
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(200).json({ connected: false, reason: "error" });
  }
};


module.exports = {
  connectWithGithub,
  githubOAuthCallback,
  authenticate,
};


