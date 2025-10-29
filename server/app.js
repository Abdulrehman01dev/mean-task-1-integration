const express = require("express");
const app = express();
require("dotenv").config();
const connectDb = require("./helpers/connectDb");



app.use(express.json());
app.get('/api/health', (req,res)=>res.json({ok:true}));


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



