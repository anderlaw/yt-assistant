const exec = require("child_process").exec;

module.exports = (keyword, cb) => {
  exec(`yt-dlp ytsearch:${keyword} -J`, (error, stdout, stderr) => {
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
