const connection = require("../db/conn.js");
/**
 *
 * @param {channel_id,title,description,avatar_url,banner_url} params
 */
module.exports = (params, cb) => {
  const email = params.email;
  const values_sql = `VALUES("${params.channel_id}","${params.title}","${params.description}","${params.avatar_url}","${params.banner_url}")`;
  connection.query(
    "SELECT `channels` from `user` WHERE `email` = '" + email + "'",
    function (error, results, fields) {
      if (error) throw error;
      console.log(results.length);
      if (results.length) {
        const data = results[0].channels || [];
        const channel_exist = !!data.find(
          (item) => item.channel_id == params.channel_id
        );
        if (!channel_exist) {
          const { email, ...channelInfo } = params;
          //将描述文本序列化，处理里面的\n为\\n防止后面序列化时出错。
          channelInfo.description = channelInfo.description.replaceAll("\n","#new-line#");
          channelInfo.tags = channelInfo.tags.map(item =>replaceAll("\"","“"));
          data.push(channelInfo);
          console.log("新数据---", data);
          console.log(
            "sal--->",
            "UPDATE `user` SET `channels`= '" +
              JSON.stringify(data) +
              "' WHERE email = '" +
              email +
              "'"
          );
          connection.query(
            "UPDATE `user` SET `channels`= '" +
              JSON.stringify(data) +
              "' WHERE email = '" +
              email +
              "'",
            function (error, results, fields) {
              if (error) throw error;
              cb({
                status: true,
                message: "频道已经添加",
              });
            }
          );
        } else {
          cb({
            status: false,
            message: "频道已经添加",
          });
        }
        // 返回查询结果
      } else {
        //do something
        cb({
          status: false,
          message: "未知用户",
        });
      }
    }
  );
};
