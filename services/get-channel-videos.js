const exec = require("child_process").exec;

const sep_mark = ":##:";
const main = async (link) => {
  const execString = `yt-dlp -O "%(id)s${sep_mark}%(title)s${sep_mark}%(duration)s${sep_mark}%(live_status)s" --flat-playlist -s  ${link} -I 1:2`;
  return new Promise((resolve, reject) => {
    exec(execString, (error, stdout, stderr) => {
      if (error) {
        return main(link);
      }
      if (stderr) {
        console.error(`${stderr}`);
      }
      resolve(stdout);
    });
  });
};
module.exports = main;
