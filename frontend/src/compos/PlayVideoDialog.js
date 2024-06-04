import Backdrop from "@mui/material/Backdrop";
import { useEffect, useState } from "react";

import Plyr from "plyr";
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
export default ({ videoInfo, open, handleClose }) => {
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    if (videoInfo && open) {
      setTimeout(() => {
        const videoEle = document.querySelector("#video-player");
        if (!videoEle) {
          return;
        }
        //播放视频
        const m3u8_url = `http://${window.location.hostname}/media${videoInfo.path}/video.m3u8`;
        const file_url = `http://${window.location.hostname}/media${videoInfo.path}/file.mp4`;
        const player = new Plyr("#video-player");
        setPlayer(player);
        if (!window.Hls.isSupported()) {
          videoEle.src = file_url;
        } else {
          // For more Hls.js options, see https://github.com/dailymotion/hls.js
          const hls = new window.Hls();
          hls.loadSource(m3u8_url);
          hls.attachMedia(videoEle);
          window.hls = hls;
        }
        player.play();
      });
    }
  }, [videoInfo, open]);
  useEffect(() => {
    if (player && !open) {
      player.stop();
      player.destroy();
    }
  }, [player, open]);
  return (
    <Dialog open={open}>
      <DialogTitle>播放视频</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          minWidth: "300px",
          maxWidth: "800px",
        }}
      >
        <video
          style={{
            width: "100%",
          }}
          id="video-player"
        ></video>
      </DialogContent>
    </Dialog>
  );
};
