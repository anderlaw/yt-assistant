
const mysql = require('mysql2');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "!Yanyan1234",
  database: "yt-assistant",
});
module.exports = connection