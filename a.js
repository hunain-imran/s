const express = require("express");
const app = express();
const userRoutes = require("./users");

app.use(express.json());
app.use("/api", userRoutes);

app.listen(3000, () => {
  console.log("running 3000");
});