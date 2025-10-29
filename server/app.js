const express = require("express");
const app = express();
require("dotenv").config();
const connectDb = require("./helpers/connectDb");
const serverRoutes = require("./routes/serverRoutes");
const routeNotHandler = require("./helpers/routeNotFound");
const globalErrorHandler = require("./helpers/errorHandler");
const cors = require("cors");

// Access req.body || parse cookies from front-end & set limit of data to 10kb
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));


// Enable CORS for all routes
app.use(cors());


///// All types of routes declaration here //////
// Home route
app.get("/", (_, res) => { res.status(200).send("Welcome to the Integration Service API for SRED IO task-1") });

// Health check route
app.get('/api/health', (req,res)=>res.json({ok:true}));

// Load Routes
app.use("/api/v1", serverRoutes);

// some kind of middleWare for express to undefined routes to send custom json || html
app.use(routeNotHandler);

// global middleWare error handler for operational errors
app.use(globalErrorHandler);


// Database connection logic
const connectionString = process.env.DB_URL;
if(!connectionString){
    console.warn("DATABASE URL MISSING IN ENV VARIABLES");
    process.exit(1);
}

// Default port would run on 3000
const port = process.env.PORT || 3000;

connectDb(connectionString).then(() =>{
    app.listen(port, ()=>{
      console.log(`App is listening at port ${port}`);
    });
}).catch((err) =>{
    console.error("Failed to connect to database:", err);
    process.exit(1);
})



