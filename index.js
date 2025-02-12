const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoute = require("./routes/user/userRoute");
const userFramData = require("./routes/framData/framDataRoute");


dotenv.config();

// Connect to the database

connectDB();

// Initiate express app

const app = express();

const port = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Rumeno
app.use("/rumeno", userRoute);

// Fram Data

app.use("/rumeno", userFramData);


// Starting the server

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



