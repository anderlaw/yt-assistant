const fs = require("fs");
export class LogService {
  constructor() {
    const date = new Date();
    const date_string = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    const time_string = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    const log_dir = "./logs";
    if (!fs.existsSync(log_dir)) {
      fs.mkdirSync(log_dir);
    }

    const sub_dir = `./logs/${date_string}`;
    if (!fs.existsSync(sub_dir)) {
      fs.mkdirSync(sub_dir);
    }
    this.log_file_path = `${sub_dir}/${time_string}.txt`;
  }
  write(type, message) {
    const date = new Date();
    const date_string = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    const time_string = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    /**
     * type: query_db,insert_db,download_file,download_videolist,download_streamlist,stderror,runerror
     *
     */
    let message_body = `\n${date_string} ${time_string}\n`;
    switch (type) {
      // 操作数据库。
      case "query_db":
        message_body += `查询数据库 [${message}]`;
        break;
      case "insert_db":
        message_body += `插入数据库 [${message}]`;
        break;
      case "download_file":
        message_body += `下载文件 [${message}]`;
        break;
      case "download_videolist":
        message_body += `下载频道的视频列表 [${message}]`;
        break;
      case "download_streamlist":
        message_body += `下载频道的直播回放列表 [${message}]`;
        break;
      case "stderror":
        message_body += `标准输出错误或警告 [${message}]`;
        break;
      case "runerror":
        message_body += `程序运行错误错误或警告 [${message}]`;
        break;
    }
    fs.appendFileSync(this.log_file_path, message_body);
  }
}
// new LogService().write("query_db","hello,world", 3);
// fs.writeFileSync("./log/1231.txt", "123");
