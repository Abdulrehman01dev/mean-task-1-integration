const axios = require("axios");


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

    // Will Save to MongoDb laterr on
    // await Integration.create({
    //   githubId: userData.id,
    //   login: userData.login,
    //   accessToken,
    //   connectedAt: new Date()
    // });

    return res.status(200).send(`${frontendUrl}/integrations/github?status=success`);
  } catch (err) {
    console.error("GitHub OAuth error:", err?.response?.data || err?.message || err);
    return res.status(500).json({succes: false, message: 'Unable to authorize.'});
  }
}

module.exports = {
  connectWithGithub,
  githubOAuthCallback
};


