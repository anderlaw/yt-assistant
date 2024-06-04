const express = require("express");
const router = express.Router();
const fs = require("fs");
const exec = require("child_process").execSync;

router.get("/download", (req, res) => {
  console.log('请求进来了')
  const url = req.query.url;
  console.log('url -->',url)
  const stdout1 = exec(`yt-dlp -j -s --no-cache-dir ${url}`);
  const videoInfo = JSON.parse(stdout1);
  const videoId = videoInfo.id;
  const videoTitle = videoId.title;

  //读取本地目录，看是否有缓存视频
  let filenames = null;
  fs.existsSync(`./files/${videoId}`) &&
    (filenames = fs
      .readdirSync(`./files/${videoId}`)
      .filter(
        (name) => name.indexOf(".") !== 0 && name.indexOf("part") === -1
      ));

  if (filenames && filenames.length) {
    res.json({
      title: videoTitle,
      path: `/${videoId}`,
      filenames,
    });
    return;
  }
  console.log("下载视音频频中");
  const execString = `yt-dlp https://www.youtube.com/watch?v=${videoId} -f "b[ext=mp4],ba[ext=m4a]" -o "./files/%(id)s/file.%(ext)s"`;
  exec(execString, {
    maxBuffer: 1024 * 1024 * 1024,
  });
  //转码为m3u8格式的文件
  exec(`ffmpeg -i ./files/${videoId}/file.mp4 -c:v copy -c:a copy -f segment -segment_format mpegts -segment_time 10 -segment_list ./files/${videoId}/video.m3u8 ./files/${videoId}/video%05d.ts`, {
    maxBuffer: 1024 * 1024 * 1024,
  });
  // todo: audio file
  // exec(`ffmpeg -i ./files/${videoId}/file.mp4 -segment_time 10 ./files/${videoId}/video.m3u8`, {
  //   maxBuffer: 1024 * 1024 * 1024,
  // });
  res.json({
    title: videoTitle,
    path: `/${videoId}`,
    filenames: fs.readdirSync(`./files/${videoId}`),
  });
});
module.exports = router;
