const exec = require("child_process").exec;
const { ytdlpPath } = require("./CONST");

module.exports = (channelLink, cb) => {
  exec(
    `${ytdlpPath} ${channelLink} -J --skip-download -I 0`,
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
