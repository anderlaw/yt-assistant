import "./App.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

import Grid from "@mui/material/Unstable_Grid2";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Nav from "./compos/Nav";
import Header from "./compos/Header";
import Login from "./compos/login";
import { useEffect, useState } from "react";
import { loginSignup, getDbChannelVideos } from "./api/index";
function App() {
  const [authState, setAuthState] = useState(null);
  const [videoList, setVideoList] = useState([]);
  useEffect(() => {
    const hasAuth = JSON.parse(localStorage.getItem("yt-assistant-auth"));
    if (hasAuth) {
      setAuthState(hasAuth);
    }
  }, []);
  return (
    <div className="App">
      {authState ? (
        <>
          <Header authState={authState} />
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
          <Grid
            style={{
              marginLeft: "200px",
              marginTop: "60px",
            }}
            container
            spacing={2}
          >
            {videoList.map((videoItem, index) => {
              return (
                <Grid key={videoItem.id} xs={4}>
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
                      <Button size="small" color="primary">
                        听音频
                      </Button>
                      <Button size="small" color="primary">
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
        </>
      ) : (
        <Login
          onLogin={(email) => {
            const authData = {
              email: email,
            };
            loginSignup(email).then((res) => {
              if (res.data.status === true) {
                localStorage.setItem(
                  "yt-assistant-auth",
                  JSON.stringify(authData)
                );
                setAuthState(authData);
              }
            });
          }}
        />
      )}
    </div>
  );
}

export default App;
