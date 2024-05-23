import "./App.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

import Grid from "@mui/material/Unstable_Grid2";
import { Button, CardActions } from "@mui/material";
import Nav from "./compos/Nav";
import Header from "./compos/Header";
import Login from "./compos/login";
import { useEffect, useState } from "react";
import { useSmallDevice } from "./utils/useQuery";
import { loginSignup, getDbChannelVideos } from "./api/index";
import { getAuth, setAuth } from "./utils/auth";
import DrawerComp from "./compos/Drawer";
import Plyr from 'plyr';

import Backdrop from '@mui/material/Backdrop';
import PlayVideoDialog from "./compos/PlayVideoDialog";

function App() {
  const [authState, setAuthState] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [headerHeight, setHeaderHeight] = useState("auto");
  const smallDeviceMatches = useSmallDevice();

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const [drawerOpen,setDrawerOpen] = useState(false)
    const [curVideoPlayInfo,setCurVideoPlayInfo] = useState(null)
    const [playVideoOpen,setPlayVideoOpen] = useState(false)

  useEffect(() => {
    const auth = getAuth();
    auth && setAuthState(auth);
    setHeaderHeight(getComputedStyle(document.querySelector(".MuiToolbar-root")).height);
  }, []);
  const playAudio = (videoInfo) => {
      const audioPlayerContainer = document.querySelector('#audio-player-container');
      audioPlayerContainer.style.display = 'block';
      const audioEle = document.querySelector('#audio-player')
      const player = new Plyr('#audio-player');
      audioEle.src = `http://43.133.193.236/media/${videoInfo.id}/${videoInfo.out_audio_filename}`;
      player.play();
  }

  return (
    <div className="App">
      <Header
        authState={authState}
        onMenuClick={()=>setDrawerOpen(true)}
        onLoginClick={() => setLoginDialogOpen(true)}
        onLogoutClick={() => {
          setAuthState(null);
          setAuth(null);
        }}
      />
      <div
        style={{
          display: "flex",
        }}
      >
        {!smallDeviceMatches && authState && (
          <Nav
            onMenuItemClick={(item) => {
              console.log(item);
              //获取频道下的视频列表。
              getDbChannelVideos(item.channel_id).then((res) => {
                if (res.status === 200 && res.data) {
                  setVideoList(res.data);
                }
              });
            }}
          />
        )}
        <Grid
          style={{
            flexGrow: 1,
            marginBottom:'60px'
          }}
          container
          spacing={2}
        >
          {videoList.map((videoItem) => {
            return (
              <Grid key={videoItem.id} xs={6} md={4}>
                <Card sx={{ maxWidth: 345 }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`https://i.ytimg.com/vi/${videoItem.id}/hqdefault.jpg`}
                    alt={`thumbnail ${videoItem.title}`}
                  />
                  <CardContent>
                    <Typography
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                      gutterBottom
                      variant="h5"
                      component="div"
                    >
                      {videoItem.title}
                    </Typography>
                    <Typography
                      style={{
                        maxHeight: "60px",
                        overflow: "hidden",
                      }}
                      variant="body2"
                      color="text.secondary"
                    >
                      {videoItem.description}
                    </Typography>
                      <span>{videoItem.duration_string}</span>
                      &nbsp;
                      <span>{videoItem.view_count}次观看</span>
                    <Typography
                      style={{
                        marginTop: "6px",
                      }}
                      variant="body2"
                      color="text.secondary"
                    >
                      发布于：{videoItem.release_date.substr(0, 4)}-
                      {videoItem.release_date.substr(4, 2)}-
                      {videoItem.release_date.substr(6, 2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button onClick={()=>playAudio(videoItem)} size="small" color="primary">
                      听音频
                    </Button>
                    <Button onClick={()=>{
                        setCurVideoPlayInfo(videoItem);
                        setPlayVideoOpen(true);
                    }} size="small" color="primary">
                      观看视频（无广告）
                    </Button>
                    <Button size="small" color="primary">
                      AI速览
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </div>
      {/* login dialog */}
      {!authState && (
        <Login
          open={loginDialogOpen}
          handleClose={() => setLoginDialogOpen(false)}
          onLogin={(email) => {
            const authData = {
              email: email,
            };
            loginSignup(email).then((res) => {
              if (res.data.status === true) {
                setAuth(authData);
                setAuthState(authData);
              }
            });
          }}
        />
      )}
    <DrawerComp open={drawerOpen} handleClose={()=>setDrawerOpen(false)}>
            <Nav
                onMenuItemClick={(item) => {
                    console.log(item);
                    //获取频道下的视频列表。
                    getDbChannelVideos(item.channel_id).then((res) => {
                        if (res.status === 200 && res.data) {
                            setVideoList(res.data);
                        }
                    });
                }}
            />
        </DrawerComp>
    <PlayVideoDialog videoInfo={curVideoPlayInfo} open={playVideoOpen} handleClose={()=>setPlayVideoOpen(false)}/>
    </div>
  );
}

export default App;
