const mysql = require('mysql2');

var connection = mysql.createConnection({
    host: "43.133.193.236",
    user: "root",
    password: "!Yanyan1234",
    database: "yt-assistant",
});
module.exports = connection