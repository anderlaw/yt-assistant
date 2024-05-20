const exec = require("child_process").exec;
const { ytdlpPath } = require("./CONST");

const sep_mark = ":##:";
const main = async (link) => {
  const execString = `${ytdlpPath} -O "%(id)s${sep_mark}%(title)s${sep_mark}%(duration)s" --flat-playlist -s  ${link} -I 1:5`;
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
