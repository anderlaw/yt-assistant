import "./App.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

import Grid from "@mui/material/Unstable_Grid2";
import {Button, CardActions} from "@mui/material";
import Nav from "./compos/Nav";
import Header from "./compos/Header";
import Login from "./compos/login";
import {useEffect, useState} from "react";
import {useSmallDevice} from "./utils/useQuery";
import {getDbChannelVideos, getUserInfo, loginSignup, writeViewedVideoId} from "./api/index";
import {getAuth, setAuth} from "./utils/auth";
import DrawerComp from "./compos/Drawer";
import Plyr from 'plyr';
import PlayVideoDialog from "./compos/PlayVideoDialog";
import Box from "@mui/material/Box";

function App() {
    const [authState, setAuthState] = useState(null);
    const smallDeviceMatches = useSmallDevice();

    const [loginDialogOpen, setLoginDialogOpen] = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [curVideoPlayInfo, setCurVideoPlayInfo] = useState(null)
    const [playVideoOpen, setPlayVideoOpen] = useState(false);

    //主区域展示的视频书记
    const [originVideoList, setOriginVideoList] = useState([]);
    const [curChannelId, setCurChannelId] = useState('');
    const [curVideoList, setCurVideoList] = useState([]);
    //订阅的频道
    const [subscribeChannels, setSubscribeChannels] = useState([]);
    const [allChannelVideosObj, setAllChannelVideosObj] = useState({});

    const [newVideoList, setNewVideoList] = useState([]);
    //是否是新视频
    const [viewedVideoIdList, setViewedVideoIdList] = useState([]);
    const markAsViewed = (videoId) => {
        //发送到服务端并本地更新state
        setViewedVideoIdList(_prev => [videoId].concat(_prev))
    }
    useEffect(() => {
        if (authState && viewedVideoIdList && viewedVideoIdList.length) {
            //发布到服务端
            writeViewedVideoId({
                email: authState.email,
                viewed_video_ids: JSON.stringify(viewedVideoIdList)
            }).then(res => {
                console.log(res);
            })
        }
    }, [viewedVideoIdList, authState])
    useEffect(() => {
        if (viewedVideoIdList && originVideoList.length && subscribeChannels.length) {
            //视频发布地址，频道的插入日期。
            //新视频列表
            const newVideoList = originVideoList.filter(videoItem => {
                const videoRelease_date = new Date(`${videoItem.release_date.substr(0, 4)}-${videoItem.release_date.substr(4, 2)}-${videoItem.release_date.substr(6, 8)}`)
                const channel_added_date = new Date(subscribeChannels.find(item => item.channel_id === videoItem.channel_id).insert_date)
                return viewedVideoIdList.indexOf(videoItem.id) == -1 && Math.abs(channel_added_date - videoRelease_date) / 1000 / 60 / 60 / 24 <= 3;
            });
            setNewVideoList(newVideoList);
        }
    }, [viewedVideoIdList, originVideoList, subscribeChannels])
    useEffect(() => {
        if (curChannelId && originVideoList.length) {
            setCurVideoList(originVideoList.filter(item => item.channel_id === curChannelId))
        }
    }, [curChannelId, originVideoList, setCurVideoList])
    const fetchUserInfo = (authState) => {
        authState && getUserInfo({
            email: authState.email,
        }).then((res) => {
            if (res.status === 200 && res.data.length > 0) {
                //设置看过的视频id列表
                setViewedVideoIdList(res.data[0].viewed_video_ids || []);

                const channels = res.data[0].channels || [];
                setSubscribeChannels(channels);

                //获取所有视频
                Promise.all(channels.map(channel => getDbChannelVideos(channel.channel_id))).then(results => {
                    const allOk = results.every(res => res.status === 200 && res.data);
                    if (allOk) {
                        const mergedVideoList = results.reduce((prev, item) => {
                            return prev.concat(item.data)
                        }, []);
                        setOriginVideoList(mergedVideoList);

                        if (channels.length > 0) {
                            setCurChannelId(channels[0].channel_id)
                        }
                    }
                })


            }
        });
    }
    useEffect(() => {
        const auth = getAuth();
        auth && setAuthState(auth);
        fetchUserInfo(auth);
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
                onMenuClick={() => setDrawerOpen(true)}
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
                        newVideoList={newVideoList}
                        onChannelAdded={() => fetchUserInfo(authState)}
                        subscribeChannels={subscribeChannels}
                        onMenuItemClick={(item) => setCurChannelId(item.channel_id)}
                    />
                )}
                <Box sx={{
                    padding: "10px",
                    borderLeft: "1px solid #cccccc80"
                }}>
                    <Grid
                        style={{
                            flexGrow: 1,
                            marginBottom: '60px',
                            margin: '10px'
                        }}
                        container
                        spacing={3}
                    >
                        {curVideoList.map((videoItem) => {
                            //202011,12
                            // const videoReleaseDate = new Date(`${videoItem.release_date.substr(0, 4)}-${videoItem.release_date.substr(4, 2)}-${videoItem.release_date.substr(6, 8)}`);
                            // const channelAddedDate = new Date(subscribeChannels.find(item => item.channel_id === videoItem.channel_id).insert_date);
                            const is_new_video = !!newVideoList.find(item => item.id === videoItem.id);
                            return (
                                <Grid key={videoItem.id} xs={6} md={4}>
                                    <Card>

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
                                            <Button onClick={() => {
                                                playAudio(videoItem);
                                                markAsViewed(videoItem.id);
                                            }} size="small" color="primary">
                                                听音频
                                            </Button>
                                            <Button onClick={() => {
                                                setCurVideoPlayInfo(videoItem);
                                                setPlayVideoOpen(true);
                                                markAsViewed(videoItem.id);
                                            }} size="small" color="primary">
                                                观看视频（无广告）
                                            </Button>
                                            <Button size="small" color="primary">
                                                AI速览
                                            </Button>
                                            {
                                                is_new_video && <span style={{float: 'right', color: 'red'}}>New</span>
                                            }

                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>

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
            <DrawerComp open={drawerOpen} handleClose={() => setDrawerOpen(false)}>
                <Nav
                    newVideoList={newVideoList}
                    onChannelAdded={() => fetchUserInfo(authState)}
                    subscribeChannels={subscribeChannels}
                    onMenuItemClick={(item) => setCurChannelId(item.channel_id)}
                />
            </DrawerComp>
            <PlayVideoDialog videoInfo={curVideoPlayInfo} open={playVideoOpen}
                             handleClose={() => setPlayVideoOpen(false)}/>
        </div>
    );
}

export default App;
