const exec = require("child_process").execSync;
const { rimrafSync, native, nativeSync } = require('rimraf');
const execAsync = require("child_process").exec;
const CronJob = require("cron").CronJob;
const cron = require("cron");
const fs = require("fs");
const getChannelVideos = require("./services/get-channel-videos");
const LogService = require("./LogService");

const sep_mark = ":##:";
const request = require("request");

// 读取所有用户下的频道，并依次同步。
const everySecond = "* * * * * *";
const everyMinute = "* * * * *";
const everyHour = "0 */1 * * *";

const findFitVideoAndAudioFormatId = (videoId, logger) => {
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
      logger.write("download_videoInfo", `失败，${e}即将重试！`);
    } finally {
      //try-fix:解决进程卡住的问题，杀死完成的进程

      if (stdout) {
        const videoData = JSON.parse(stdout);
        const formats = videoData.formats;
        const video_format = formats
          .filter((item) => item.vcodec != "none" && item.acodec != "none")
          .sort((a, b) => b.width - a.width)[0];
        const audio_format = formats
          .filter((item) => item.vcodec == "none" && item.acodec != "none")
          .sort((a, b) => b.quality - a.quality)[0];
        logger.write("download_videoInfo", `成功`);
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
        return findFitVideoAndAudioFormatId(videoId, logger);
      }
    }
  });
};
// const
const downloadVideoAudio = (videoInfo, logger) => {
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
        //try-fix: 下载卡死的问题，设置超时为30分钟
        timeout: 30 * 60 * 1000,
      },
      (error, stdout, stderr) => {
        if (stderr) {
          logger.write(
            "std_error",
            `${videoInfo.title} ${videoInfo.id} ${stderr}`
          );
        }
        if (error) {
          logger.write(
            "download_file",
            `运行失败，${error},记录后稍后再重试！`
          );
          //try-fix: 先reject而不是立刻重试，可能这个视频暂时被youtube限制，稍后再看看情况？
          reject(error);
        } else if (
          stdout &&
          fs.existsSync("./channels/" + videoInfo.id) &&
          fs.readdirSync("./channels/" + videoInfo.id).length === 2
        ) {
          resolve(videoInfo);
        }
      }
    );
  });
};
const insertVideoByApi = async (videoInfo) => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: "post",
        url: "http://localhost:3000/api/write-video-db",
        qs: {
          id: videoInfo.id,
          release_date: videoInfo.release_date,
          channel_id: videoInfo.channel_id,
          title: videoInfo.title,
          description: videoInfo.description,
          duration: videoInfo.duration,
          duration_string: videoInfo.duration_string,
          view_count: videoInfo.view_count,
          out_video_filename: videoInfo.output.video_filename,
          out_audio_filename: videoInfo.output.audio_filename,
        },
      },
      function (error, response, body) {
        if (error) return reject(error);
        if (
          response.statusCode === 200 &&
          JSON.parse(body) &&
          JSON.parse(body).status == true
        ) {
          resolve();
        }
      }
    );
  });
};
const redownloadVideoAndAudio = async (videoInfoList,logger) => {
  logger.write("retry",`启动重试下载`);
  let videoInfo = null;
  for (
    let i = 0;
    i < videoInfoList.length;
    i++
  ) {
    const cur_videoInfo = videoInfoList[i];
    logger.write(
      "download_file",
      `开始下载:${cur_videoInfo.id} ${cur_videoInfo.title}`
    );
    try {
      const videoInfo = await downloadVideoAudio(cur_videoInfo, logger);
      logger.write(
        "download_file",
        `完成下载:${cur_videoInfo.id} ${cur_videoInfo.title}`
      );

      logger.write(
        "insert_db",
        `准备写入数据库表:${videoInfo.id},${videoInfo.title}`
      );

      //写入到数据库另一张表里，用户可以直接读取展示。
      let has_error_insertdb = false;
      try {
        await insertVideoByApi(videoInfo);
      } catch (err) {
        has_error_insertdb = true;
        logger.write(
          `run_error`,
          `写入数据库表错误:${videoInfo.id} ${videoInfo.title},${err}`
        );
      }
      if (has_error_insertdb) {
        return;
      }
      logger.write(
        "insert_db",
        `成功写入数据库表:${videoInfo.id},${videoInfo.title}`
      );
    } catch (e) {
      //try-fix: 先记录下记录，稍后再重试即可
      // download_video_failed_box.push(cur_videoInfo);
      logger.write('run_error',`重试下载失败 ${cur_videoInfo.title} ${cur_videoInfo.id}`)
      //删除下载产生的无效文件和文件夹
      rimrafSync(`./channels/${cur_videoInfo.id}`);
    }
    //todo:通知用户 新的视频下载完毕，可以观看了。
  }
}
const jobFunction = () => {
  const logger = new LogService();
  logger.write("Job开始执行");
  logger.write("query_db", `获取所有用户频道`);
  //api request
  request(
    "http://localhost:3000/api/get-subscribed-channels",
    async (error, response, body) => {
      console.log(response,body);
      let channel_ids = [];
      let has_error_query_channel = false;
      try {
        channel_ids = JSON.parse(body);
      } catch (e) {
        has_error_query_channel = true;
        logger.write("run_error", `获取所有用户频道 ${e}`);
      }
      if (has_error_query_channel) {
        return;
      }
      logger.write(`频道列表：${channel_ids.join()}`);

      //tobe:存放视频信息的数组
      const temp_videoInfo_arr = [];
      //下载文件目录
      if (!fs.existsSync("./channels")) {
        fs.mkdirSync("./channels");
      }
      const alreadyDownloadFiles = fs.readdirSync("./channels");

      //查询并提取频道的视频和直播存储到 temp_videoInfo_arr 数组里
      for (let i = 0; i < channel_ids.length; i++) {
        const channel_id = channel_ids[i];
        // 查询视频
        logger.write("download_videolist", `开始：${channel_id}`);
        const videosOptStr = await getChannelVideos(
          `https://www.youtube.com/channel/${channel_id}/videos`
        );
        logger.write("download_videolist", `完成：${channel_id}`);

        const video_items = videosOptStr
          .split("\n")
          .filter((str) => str.trim())
          .map((item) => item.split(sep_mark))
          //fix: 过滤掉即将开始（尚未开始）的项目  "live_status:is_upcoming",不是"NA",
          .filter((item) => item[3] == "NA");
        //查询直播回放视频

        logger.write("download_streamlist", `开始：${channel_id}`);
        const streamsOptStr = await getChannelVideos(
          `https://www.youtube.com/channel/${channel_id}/streams`
        );
        logger.write("download_streamlist", `完成：${channel_id}`);

        let stream_items = streamsOptStr
          .split("\n")
          .filter((str) => str.trim())
          //过滤掉正在直播的视频:duration字段表示为NA未知
          .map((item) => item.split(sep_mark))
          .filter((item) => item[2] !== "NA");

        //合并视频和直播并去掉已经下载过的项目
        const mergeed_items = video_items
          .concat(stream_items)
          .filter((item) => alreadyDownloadFiles.indexOf(item[0]) == -1);

        let i_v = 0;
        let i_s = 0;
        const total_count = mergeed_items.length;
        logger.write("download_videoInfo", `共${total_count}个新项目`);
        for (let v = 0; v < mergeed_items.length; v++) {
          logger.write(
            "download_videoInfo",
            `开始：第${v + 1}/${total_count}个`
          );
          const cur_video_id = mergeed_items[v][0];
          const videoInfo = await findFitVideoAndAudioFormatId(
            cur_video_id,
            logger
          );
          //todo: 存放到列表里
          temp_videoInfo_arr.push(videoInfo);

          logger.write(
            "download_videoInfo",
            `下载成功：${v + 1}/${total_count}个 ${videoInfo.title}`
          );
        }
      }

      logger.write("download_file", "准备下载音视频");

      const download_video_failed_box = [];
      // 遍历 temp_videoInfo_arr 并下载视频和音频
      for (
        let video_queue_id = 0;
        video_queue_id < temp_videoInfo_arr.length;
        video_queue_id++
      ) {
        const cur_videoInfo = temp_videoInfo_arr[video_queue_id];
        logger.write(
          "download_file",
          `开始下载:${cur_videoInfo.id} ${cur_videoInfo.title}`
        );
        try {
          const videoInfo = await downloadVideoAudio(cur_videoInfo, logger);
          logger.write(
            "download_file",
            `完成下载:${cur_videoInfo.id} ${cur_videoInfo.title}`
          );

          logger.write(
            "insert_db",
            `准备写入数据库表:${videoInfo.id},${videoInfo.title}`
          );

          //写入到数据库另一张表里，用户可以直接读取展示。
          let has_error_insertdb = false;
          try {
            await insertVideoByApi(videoInfo);
          } catch (err) {
            has_error_insertdb = true;
            logger.write(
              `run_error`,
              `写入数据库表错误:${videoInfo.id} ${videoInfo.title},${err}`
            );
          }
          if (has_error_insertdb) {
            return;
          }
          logger.write(
            "insert_db",
            `成功写入数据库表:${videoInfo.id},${videoInfo.title}`
          );
        } catch (e) {
          //try-fix: 先记录下记录，稍后再重试即可
          download_video_failed_box.push(cur_videoInfo);
          //删除下载产生的无效文件和文件夹
          rimrafSync(`./channels/${cur_videoInfo.id}`);
        }
        //todo:通知用户 新的视频下载完毕，可以观看了。
      }
      await redownloadVideoAndAudio(download_video_failed_box,logger);
      logger.write("Job执行完毕！\n");
    }
  );
};
const cron_str = "00 00 */6 * * *"; //每隔6个小时

const job = new CronJob(
  cron_str, // cronTime
  jobFunction, // onTick
  () => {
    logger.write("on complete Job执行完毕！\n");
  }, // onComplete
  true, // start
  "UTC+8" // timeZone
);
jobFunction(); //立即执行一次。
