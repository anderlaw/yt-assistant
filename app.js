const express = require("express");
const bodyParser = require('body-parser')
const app = express();
const port = 3000;

const myLogger = function (req, res, next) {
  console.log("LOGGED");
  next();
};
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Content-Type", "application/json");
  next();
});
const apiRouter = require("./api/index.js");
//api路由

app.use("/api", apiRouter);
//前端页面通过static配置
app.use(express.static("frontend/build"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
