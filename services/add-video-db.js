const connection = require("../db/conn.js");
const genSQLValue = (content) => {
  return "'+ content +'";
}
/**
 *
 * @param {channel_id,title,description,avatar_url,banner_url} params
 */
module.exports = (params, cb) => {
  console.log("服务service里接收到数据--->",params);
  connection.query(
    "INSERT IGNORE INTO `video` (\
      `id`,`channel_id`,`title`,`description`,`duration`,`duration_string`,\
      `view_count`,`release_date`,\
      `out_video_filename`,`out_audio_filename`\
      ) VALUES(" + 
      "'" + params.id + "'"
      +",'" + params.channel_id + "'"
      +",'" + params.title + "'"
      +",'" + params.description + "'"
      +",'" + params.duration + "'"
      +",'" + params.duration_string + "'"
      +",'" + params.view_count + "'"
      +",'" + params.release_date + "'"
      +",'" + params.out_video_filename + "'"
      +",'" + params.out_audio_filename + "'"
      + ")",
    function (error, results, fields) {
      if (error) throw error;
      if (results)
        cb({
          status: true,
        });
    }
  );
};
