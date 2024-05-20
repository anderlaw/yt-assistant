
const mysql = require('mysql2');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "yt-assistant",
});
module.exports = connection
/**
 * id
 * email
 * channels:[{
 * channelId:"xxxx",
 * avatar:"xxxx",
 * banner:"xxxxx",
 * name:"xxxx",
 * videos:[
 *  {
 *      title:""",
 * description:""",
 * videoId:"xxx",
 * thumbnai:"xxx",
 *  }
 * ]
 * },{videos:[]}],
 * videos:
 */
