const express = require('express')
const cors = require("cors");

const conn = require('../backend/db/conn')

const app = express();


app.use(express.json());

const UserRoutes = require("./routes/userRoutes");




app.use("/usuario", UserRoutes);


app.listen(5555);