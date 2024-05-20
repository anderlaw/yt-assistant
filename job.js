const exec = require("child_process").execSync;
const execAsync = require("child_process").exec;
const CronJob = require("cron").CronJob;
const cron = require("cron");
const fs = require("fs");
const getChannelVideos = require("./services/get-channel-videos");
const writeLog = (message) => {
  const dateStr = `${new Date().toUTCString()}\n`;
  fs.appendFileSync("./logs.txt", dateStr + message + "\n");
  console.log(dateStr + message + "\n");
};
const sep_mark = ":##:";
const request = require("request");

// 读取所有用户下的频道，并依次同步。
const everySecond = "* * * * * *";
const everyMinute = "* * * * *";
const everyHour = "0 */1 * * *";
// const downloadFileByURL = (uri, filename, callback) => {
//   var stream = fs.createWriteStream(filename);
//   request(uri).pipe(stream).on("close", callback);
// };
const waiting_video_ids = [];
const failed_video_ids = [];
const findFitVideoAndAudioFormatId = (videoId) => {
  const link = `https://www.youtube.com/watch?v=${videoId}`;
  const execString = `yt-dlp -j -s --no-cache-dir ${link}`;

  let stdout = "";
  return new Promise((resolve, reject) => {
    try {
      stdout = exec(execString, {
        maxBuffer: 1024 * 1024 * 1024,
        // timeout:
      });
    } catch (e) {
      writeLog("失败一次");
    } finally {
      if (stdout) {
        const videoData = JSON.parse(stdout);
        const formats = videoData.formats;
        const video_format = formats
          .filter((item) => item.vcodec != "none" && item.acodec != "none")
          .sort((a, b) => b.width - a.width)[0];
        const audio_format = formats
          .filter((item) => item.vcodec == "none" && item.acodec != "none")
          .sort((a, b) => b.quality - a.quality)[0];
        writeLog("提取到数据！");
        const videoInfo = {
          id: videoData.id,
          release_date: videoData.release_date,
          channel_id: videoData.channel_id,
          title: videoData.title,
          description: videoData.description,
          duration: videoData.duration,
          duration_string: videoData.duration_string,
          view_count: videoData.view_count,
          video_format,
          audio_format,
        };
        resolve(videoInfo);
      } else {
        return findFitVideoAndAudioFormatId(videoId);
      }
    }
  });
};
// const
const downloadVideoAudio = (videoInfo) => {
  writeLog(`--------->开始下载文件：${videoInfo.title}`);
  const video_filename = `file.${videoInfo.video_format.ext}`;
  const audio_filename = `file.${videoInfo.audio_format.ext}`;

  const output_format_templ = `"./channels/${videoInfo.id}/file.%(ext)s"`;
  videoInfo.output = {
    video_filename,
    audio_filename,
  };
  return new Promise((resolve, reject) => {
    //new start
    execAsync(
      `yt-dlp https://www.youtube.com/watch?v=${videoInfo.id} -f ${videoInfo.video_format.format_id},${videoInfo.audio_format.format_id} -o ${output_format_templ}`,
      {
        maxBuffer: 1024 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (stderr) {
          writeLog(`stderr: ${stderr}`);
        }
        if (error) {
          writeLog(
            `<---------文件下载失败${videoInfo.id}:\n${error}，即将重试！`
          );
          return downloadVideoAudio(videoInfo);
        } else if (
          stdout &&
          fs.existsSync("./channels/" + videoInfo.id) &&
          fs.readdirSync("./channels/" + videoInfo.id).length === 2
        ) {
          writeLog(`<---------文件下载成功${videoInfo.title}`);
          resolve(videoInfo);
        }
      }
    );
  });
};
const downloadFromCachedData = async () => {
  const temp_videoInfo_arr = JSON.parse(
    fs.readFileSync("./data-queue.json").toString()
  );
  for (
    let video_queue_id = 0;
    video_queue_id < temp_videoInfo_arr.length;
    video_queue_id++
  ) {
    await downloadVideoAudio(temp_videoInfo_arr[video_queue_id]);
  }
};

const jobFunction = () => {
  writeLog("Job开始执行\n");
  //api request
  request(
    "http://localhost:3000/api/get-subscribed-channels",
    async (error, response, body) => {
      writeLog("获取所有频道",body);
      const channel_ids = JSON.parse(body);
      //tobe:存放视频信息的数组
      const temp_videoInfo_arr = [];
      //已经下载的文件，用于后续的比对。
      const alreadyDownloadFiles = fs.readdirSync("./channels");

      writeLog(`-> 频道列表 ${channel_ids.join()}`);
      //查询并提取频道的视频和直播存储到 temp_videoInfo_arr 数组里
      for (let i = 0; i < channel_ids.length; i++) {
        const channel_id = channel_ids[i];
        // 查询视频
        writeLog(`---> 获取频道 ${channel_id} 视频列表`);
        const videosOptStr = await getChannelVideos(
          `https://www.youtube.com/channel/${channel_id}/videos`
        );
        writeLog(`<--- 频道 ${channel_id} 视频列表成功获取`);

        const video_items = videosOptStr
          .split("\n")
          .filter((str) => str.trim())
          .map((item) => item.split(sep_mark));
        writeLog(`---> 获取频道 ${channel_id} 直播回放列表`);
        //查询直播回放视频
        const streamsOptStr = await getChannelVideos(
          `https://www.youtube.com/channel/${channel_id}/streams`
        );
        writeLog(`<--- 频道 ${channel_id} 直播回放列表成功获取`);

        let stream_items = streamsOptStr
          .split("\n")
          .filter((str) => str.trim())
          .map((item) => item.split(sep_mark));
        //过滤掉正在直播的视频:duration字段表示为NA未知
        stream_items = stream_items.filter((item) => item[2] !== "NA");
        let i_v = 0;
        let i_s = 0;
        const total_count = video_items.length + stream_items.length;
        for (; i_v < video_items.length; i_v++) {
          const cur_video_id = video_items[i_v][0];
          if (alreadyDownloadFiles.indexOf(cur_video_id) == -1) {
            writeLog(`------> 提取视频文件信息 ${cur_video_id}`);
            const videoInfo = await findFitVideoAndAudioFormatId(cur_video_id);
            //todo: 存放到列表里
            temp_videoInfo_arr.push(videoInfo);
            writeLog(`<------ 成功提取视频文件 ${cur_video_id}`);
          } else {
            writeLog(`------!> 跳过提取直播回放文件 ${cur_video_id}`);
          }
          writeLog(`进度：${i_v + 1}/${total_count}`);
        }

        for (; i_s < stream_items.length; i_s++) {
          // const cur_videoItem = video_items[i_v];
          const cur_stream_id = stream_items[i_s][0];

          if (alreadyDownloadFiles.indexOf(cur_stream_id) == -1) {
            writeLog(`------> 提取直播回放文件 ${cur_stream_id}`);
            const videoInfo = await findFitVideoAndAudioFormatId(cur_stream_id);
            //todo: 存放到列表里
            temp_videoInfo_arr.push(videoInfo);
            writeLog(`<------ 成功提取直播回放文件 ${cur_stream_id}`);
          } else {
            writeLog(`------!> 跳过提取直播回放文件 ${cur_stream_id}`);
          }
          writeLog(`进度：${video_items.length + i_s + 1}/${total_count}`);
        }
      }
      writeLog("视频数据准备完毕，准备下载 ！！！！！！");
      // 遍历 temp_videoInfo_arr 并下载视频和音频

      fs.writeFileSync(`./data-queue.json`, JSON.stringify(temp_videoInfo_arr));
      for (
        let video_queue_id = 0;
        video_queue_id < temp_videoInfo_arr.length;
        video_queue_id++
      ) {
        await downloadVideoAudio(temp_videoInfo_arr[video_queue_id]);
        //todo:通知用户 新的视频下载完毕，可以观看了。
        //写入到数据库另一张表里，用户可以直接读取展示。
      }
      writeLog("Job执行完毕！\n");
    }
  );
};
const cron_str = "00 35 06 * * *"; //每天下午五点


jobFunction();
return;
const job = new CronJob(
  cron_str, // cronTime
  jobFunction, // onTick
  () => {
    writeLog("on complete Job执行完毕！\n");
  }, // onComplete
  false, // start
  "UTC+8" // timeZone
);
job.start();
