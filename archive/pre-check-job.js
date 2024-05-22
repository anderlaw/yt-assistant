const { rimrafSync, native, nativeSync } = require("rimraf");
const connection = require("../db/conn");
const fs = require("fs");

function isDirectory(path) {
  try {
    const stat = fs.statSync(path);
    return stat.isDirectory();
  } catch (e) {
    // 处理错误，例如路径不存在
    return false;
  }
}
//读取本地下载数据并清理无效的临时文件。
const check_disk_job = (logger) => {
  logger && logger.write(`准备清理下载时产生的无效文件/夹`);
  const dirname_list = fs.readdirSync("./channels/");
  for (let i = 0; i < dirname_list.length; i++) {
    const dir_path = `./channels/${dirname_list[i]}`;
    if (isDirectory(dir_path)) {
      const sub_filenames = fs.readdirSync(dir_path);
      const contains_part_file = sub_filenames.find(
        (media_filename) => media_filename.indexOf(".part") > -1
      );
      if (sub_filenames.length !== 2 || contains_part_file) {
        const result = rimrafSync(dir_path);
        if (result) {
          logger && logger.write(`清理临时文件夹 ${dir_name}`);
        }
      }
    }
  }
};
//读取本地数据并检查是否与数据库同步。
const check_db_job = (logger) => {
  logger && logger.write(`准备检查、同步下载资源到数据库`);
  const isVideo = (file_name) =>
    ["mp4", "mov", "m4v", "webm", "mkv", "wmv", "avi"].indexOf(
      file_name.split(".")[1].toLowerCase()
    ) > -1;

  const dirname_list = fs.readdirSync("./channels/");
  //跟db记录对比，缺少则添加，多余则删除。
  const needDeleteIds = [];
  const needAddIds = [];
  for (let i = 0; i < dirname_list.length; i++) {
    const dir_path = `./channels/${dirname_list[i]}`;
    if (isDirectory(dir_path)) {
      const sub_filenames = fs.readdirSync(dir_path);

      //断言视频和音频文件名
      let video_filename = "";
      let audio_filename = "";
      if (isVideo(sub_filenames[0])) {
        video_filename = sub_filenames[0];
        audio_filename = sub_filenames[1];
      } else {
        video_filename = sub_filenames[1];
        audio_filename = sub_filenames[0];
      }

      const contains_part_file = sub_filenames.find(
        (media_filename) => media_filename.indexOf(".part") > -1
      );
    }
  }
  connection.query;
};
check_job();
