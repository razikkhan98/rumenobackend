const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const userRoute = require("./routes/user/userRoute");
const userFramData = require("./routes/framData/framDataRoute");
const adminRoute = require("./routes/admin/adminRoute");

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rumeno
app.use("/rumeno", userRoute);

// Fram Data
app.use("/rumeno", userFramData);

//Admin
app.use("/rumeno", adminRoute);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
