const exec = require("child_process").exec;
const { ytdlpPath } = require("./CONST");

module.exports = (keyword, cb) => {
  exec(`${ytdlpPath} ytsearch:${keyword} -J`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (stderr) {
      console.error(stderr);
    }
    cb(stdout);
  });
};
