const exec = require("child_process").execSync;
const { ytdlpPath } = require("./CONST");

const sep_mark = ":##:";
const main = (link, cb) => {
  const execString = `${ytdlpPath} -O "%(id)s${sep_mark}%(title)s${sep_mark}%(duration)s" --flat-playlist -s  ${link} -I 1:5`;

  try {
    stdout = exec(execString, {
      maxBuffer: 1024 * 1024 * 1024,
    });
  } catch (e) {
    console.log("失败一次,1秒后重试...");
    setTimeout(() => main(link, cb), 1000);
  } finally {
    if (stdout) {
      cb(stdout);
    } else {
      cb(null);
    }
  }
};
module.exports = main;
