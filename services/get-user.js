
const connection = require("../db/conn.js");
/**
 *
 * @param {channel_id,title,description,avatar_url,banner_url} params
 */
module.exports = (params, cb) => {
  const email = params.email;
  connection.query(
    "SELECT * from `user` WHERE `email` = '"+ email + "'",
    function (error, results, fields) {
      if (error) throw error;
      if(results){
        cb(results)
      }
      
    }
  );
};
