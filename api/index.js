const express = require("express");
const router = express.Router();
const fs = require("fs");
const { spawn } = require("child_process");
const asyncExecDownloadVideo = (videoId, onProgress) => {
  return new Promise((resolve, reject) => {
    const lsProcess = spawn("yt-dlp", [
      `https://www.youtube.com/watch?v=${videoId}`,
      "-f",
      "b[ext=mp4]",
      "-o",
      "./files/%(id)s/file.%(ext)s",
    ]);
    lsProcess.stdout.on("data", (data) => {
      const str = data.toString();
      const processReg = /\[download\]\s+(\d+\.\d+%)/;
      if (processReg.test(str)) {
        onProgress(str.match(processReg)[1]);
      }
    });
    lsProcess.stderr.on("data", (data) => {});
    lsProcess.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
const asyncExecCheckVideo = (url) => {
  return new Promise((resolve, reject) => {
    const lsProcess = spawn("yt-dlp", [url, "-j", "-s", "--no-cache-dir"]);
    let outChunk = "";
    lsProcess.stdout.on("data", (data) => {
      console.log("stdout", data);
      outChunk += data.toString();
    });
    // lsProcess.stderr.on("data", (data) => {
    //   console.log(`stdout: ${data}`);
    // });
    lsProcess.on("exit", (code, message) => {
      if (code === 0) {
        resolve(outChunk);
      } else {
        reject(message);
      }
    });
  });
};
const asyncExec = (videoId) => {
  return new Promise((resolve, reject) => {
    const lsProcess = spawn("ffmpeg", [
      "-i",
      `./files/${videoId}/file.mp4`,
      `-c:v`,
      `copy`,
      `-c:a`,
      `copy`,
      `-f`,
      "segment",
      "-segment_format",
      "mpegts",
      "-segment_time",
      "5",
      "-segment_list",
      `./files/${videoId}/video.m3u8`,
      `./files/${videoId}/video%05d.ts`,
    ]);
    let outChunk = "";
    lsProcess.stdout.on("data", (data) => {
      console.log("stdout", data);
      outChunk += data.toString();
    });
    // lsProcess.stderr.on("data", (data) => {
    //   console.log(`stdout: ${data}`);
    // });
    lsProcess.on("exit", (code, message) => {
      if (code === 0) {
        resolve(outChunk);
      } else {
        reject(message);
      }
    });
  });
};
router.get("/download", async (req, res) => {
  //设置流式传输标头
  // res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Content-type", "application/octet-stream");
  const url = req.query.url;
  console.log("url -->", url);
  res.write("message:" + "查询视频...");
  const stdout1 = await asyncExecCheckVideo(url);
  const videoInfo = JSON.parse(stdout1);
  const videoId = videoInfo.id;
  const videoTitle = videoInfo.title;
  //读取本地目录，看是否有缓存视频
  let filenames = null;
  fs.existsSync(`./files/${videoId}`) &&
    (filenames = fs
      .readdirSync(`./files/${videoId}`)
      .filter(
        (name) => name.indexOf(".") !== 0 && name.indexOf("part") === -1
      ));

  if (filenames && filenames.length) {
    res.end("data:"+
      JSON.stringify({
        title: videoTitle,
        path: `/${videoId}`,
        filenames,
      })
    );
    //fix: Error [ERR_STREAM_WRITE_AFTER_END]: write after end
    return;
  }

  res.write("message:" + "视频查询完毕，准备下载...");
  // const execString = `yt-dlp https://www.youtube.com/watch?v=${videoId} -f "b[ext=mp4],ba[ext=m4a]" -o "./files/%(id)s/file.%(ext)s"`;
  const downloadOutput = await asyncExecDownloadVideo(
    videoId,
    (progressStr) => {
      res.write("progress:" + progressStr);
    }
  );
  res.write("message:" + "视频下载完毕，转码中...");
  //转码为m3u8格式的文件
  const transcodeOutput = await asyncExec(videoId);
  // todo: audio file
  // exec(`ffmpeg -i ./files/${videoId}/file.mp4 -segment_time 10 ./files/${videoId}/video.m3u8`, {
  //   maxBuffer: 1024 * 1024 * 1024,
  // });
  res.end(
    "data:" +
      JSON.stringify({
        title: videoTitle,
        path: `/${videoId}`,
        filenames: fs.readdirSync(`./files/${videoId}`),
      })
  );
});
module.exports = router;
