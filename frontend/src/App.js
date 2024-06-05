import "./App.css";
import { Button, CardActions } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Nav from "./compos/Nav";
import Header from "./compos/Header";
import { useEffect, useState } from "react";
import { useSmallDevice } from "./utils/useQuery";
import TextField from "@mui/material/TextField";
import axios from "axios";
import DrawerComp from "./compos/Drawer";
import Plyr from "plyr";
import PlayVideoDialog from "./compos/PlayVideoDialog";
import Box from "@mui/material/Box";
import { downloadVideoByURL } from "./api/index";
function App() {
  const [loading, setLoading] = useState(false);
  const smallDeviceMatches = useSmallDevice();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [curVideoPlayInfo, setCurVideoPlayInfo] = useState(null);
  const [playVideoOpen, setPlayVideoOpen] = useState(false);
  const [progressTips, setProgressTips] = useState("");

  return (
    <div className="App">
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <Box
        sx={{
          padding: "10px",
          borderLeft: "1px solid #cccccc80",
        }}
      >
        <h3>输入视频链接,即刻观看（无广告）！</h3>
        <TextField
          fullWidth
          id="video-url"
          label="视频链接"
          variant="standard"
        />
        <Box
          sx={{
            marginTop: "18px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <LoadingButton
            loading={loading}
            variant="contained"
            onClick={() => {
              const url = document.querySelector("#video-url").value.trim();
              if (url) {
                setLoading(true);
                let offset = 0;
                downloadVideoByURL(url, ({ event }) => {
                  const { responseText } = event.target;
                  const content = responseText.substring(offset);
                  offset = responseText.length;
                  if (content.indexOf("message:") === 0) {
                    const uMessage = content.split("message:")[1];
                    setProgressTips(uMessage);
                  } else if (content.indexOf("progress:") === 0) {
                    const progress = content.split("progress:")[1];
                    setProgressTips(progress);
                  } else if (content.indexOf("data:") === 0) {
                    setLoading(false);
                    setProgressTips("");
                    const progress = content.split("data:")[1];
                    console.log(`data:`,progress);
                    const videoInfo = JSON.parse(progress);
                    setPlayVideoOpen(true);
                    setCurVideoPlayInfo(videoInfo);
                  }
                });
              }
            }}
          >
            确定
          </LoadingButton>
          <span style={{ marginLeft: "10px" }}>{progressTips}</span>
        </Box>
      </Box>

      {/* <DrawerComp open={drawerOpen} handleClose={() => setDrawerOpen(false)}>
        <Nav
          newVideoList={newVideoList}
          onChannelAdded={() => fetchUserInfo(authState)}
          subscribeChannels={subscribeChannels}
          onMenuItemClick={(item) => setCurChannelId(item.channel_id)}
        />
      </DrawerComp> */}
      <PlayVideoDialog
        videoInfo={curVideoPlayInfo}
        open={playVideoOpen}
        handleClose={() => setPlayVideoOpen(false)}
      />
    </div>
  );
}

export default App;
