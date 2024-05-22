//读取所有记录修改
const connection = require("./db/conn");
const exec = require("child_process").execSync;
connection.query(
  "SELECT * FROM `video`",
  async function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    if (results) {
      for (let i = 0; i < results.length; i++) {
        const item = results[i];
        if (!item.release_date || item.release_date === "undefined") {
          const stdout = exec(
            `yt-dlp -j -s --no-cache-dir https://www.youtube.com/watch?v=${item.id}`
          );
          const videoData = JSON.parse(stdout);
          connection.query(
            "update video SET release_date = " +
              (videoData.release_date || videoData.upload_date) +
              ' where id = "' +
              videoData.id +
              '"',
            function (error, results, fields) {
              if (error) throw error;
              console.log(videoData.title, "日期更新成功！");
            }
          );
        }
      }
    }
  }
);
