const GithubIntegration = require("../models/GithubIntegration");


const authMiddleware = async (req, res, next) => {

    try {
        const authHeader = req.headers.authorization || "";
        const bearerMatch = authHeader.match(/^Bearer\s+(.*)$/i);
        const accessToken = bearerMatch?.[1] || req.query.token || req.body?.token;

        if (!accessToken) {
            return res.status(401).json({ message: "Not Authorized!" });
        }

        // Checking if user exists in DB
        const integration = await GithubIntegration.findOne({ accessToken }).sort({ connectedAt: -1 });
        if (!integration) return res.status(401).json({ error: "No valid session" });

        req.integration = integration;
        return next();

    } catch (error) {
        console.log("🚀 ~ authMiddleware ~ error:", error)
        return res.status(401).json({ message: "Not Authorized!" });
    }
};

module.exports = authMiddleware;
