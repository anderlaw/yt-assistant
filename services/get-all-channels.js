const connection = require("../db/conn.js");
/**
 *
 * @param {} params
 */
module.exports = (cb) => {
  connection.query("SELECT * FROM `user`", function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    if (results) {

      const channel_ids = results.reduce((_pre,item) => {
        return _pre.concat((item.channels||[]).map(innerItem => innerItem.channel_id));
      },[]);
      cb(channel_ids);
    }
  });
};
