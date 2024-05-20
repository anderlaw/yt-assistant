const exec = require("child_process").exec;

module.exports = (channelLink, cb) => {
  exec(
    `yt-dlp ${channelLink} -J --skip-download -I 0`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      if (stderr) {
        console.error(stderr);
      }
      cb(`${stdout}`);
    }
  );
};
