const express = require("express");
const app = express();
const userRoutes = require("./users");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");


app.use(express.json());
app.use("/api", userRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(3000, () => {
  console.log("running 3000");
});