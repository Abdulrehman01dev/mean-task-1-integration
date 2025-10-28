const express = require("express");
const app = express();

app.use(express.json());
app.get('/api/health', (req,res)=>res.json({ok:true}));


app.listen(3000, ()=>console.log('Server on 3000'));

