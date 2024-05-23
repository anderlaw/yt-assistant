import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import { queryChannel, addChannel, getUserInfo } from "../api/index";
import { getAuth } from "../utils/auth";
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
export default ({ onMenuItemClick }) => {
  const [subChannels, setSubChannels] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);

  const [channelInfo, setChannelInfo] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    auth &&
      getUserInfo({
        email: auth.email,
      }).then((res) => {
        console.log(res);
        if (res.status === 200 && res.data.length > 0) {
          setSubChannels(res.data[0].channels || []);
        }
      });
  }, []);
  return (
    <div
      style={{
        maxWidth: "200px",
      }}
    >
      {/*<button onClick={() => }>增加频道</button>*/}
      <List>
        {subChannels.map((item, index) => {
          return (
            <ListItem
              key={index}
              onClick={() => onMenuItemClick(item)}
              disablePadding
            >
              <ListItemButton>
                <Avatar
                  style={{
                    marginRight: "6px",
                  }}
                  alt={item.title}
                  src={item.avatar_url}
                />
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
        <ListItem>
          <IconButton onClick={()=>setDialogOpen(true)}>
            <AddCircleIcon/>
            <span style={{fontSize:'16px'}}>增加频道</span>
          </IconButton>
        </ListItem>

      </List>

      <Dialog onClose={(val) => setDialogOpen(val)} open={dialogOpen}>
        <DialogTitle>添加频道</DialogTitle>
        <DialogContent>
          {/* <DialogContentText id="alert-dialog-description">

          </DialogContentText> */}
          <TextField
            sx={{
              minWidth: "400px",
            }}
            id="standard-basic"
            label="请输入频道链接或关键字查询频道"
            variant="standard"
          />
          {queryLoading && <CircularProgress color="inherit" />}
          {!queryLoading && channelInfo && (
            <div>
              {/* 频道名 */}
              <img height="40px" alt="avatar" src={channelInfo?.avatar_url} />
              <p>{channelInfo?.title}</p>
              <p>{channelInfo?.description}</p>
              <p>{channelInfo?.tags.join("&nbsp;")}</p>
              <p>关注人数：{channelInfo?.channel_follower_count}</p>
              <button
                onClick={() => {
                  addChannel(channelInfo).then((res) => {
                    console.log(res);
                    if (res.status === 200 && res.data.status === true) {
                      alert("添加成功！");
                      setDialogOpen(false);
                      setChannelInfo(null);
                    }
                  });
                }}
              >
                添加
              </button>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={queryLoading} onClick={() => setDialogOpen(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              const value = document
                .querySelector("#standard-basic")
                .value.trim();
              if (value.length) {
                //重置状态
                setQueryLoading(true);
                setChannelInfo(null);
                //开始处理业务
                let channelLink = "";
                let keyword = "";
                if (value.startsWith("http")) {
                  //链接
                  channelLink = value;
                } else {
                  //关键字
                  keyword = value;
                }
                queryChannel({
                  keyword,
                  channelLink,
                }).then((res) => {
                  if (res.status === 200 && res.data) {
                    var data = res.data;
                    const title = data.title;
                    const channel_id = data.channel_id;
                    const channel_follower_count = data.channel_follower_count;
                    const description = data.description;
                    const tags = data.tags;
                    const avatar_url = (
                      data.thumbnails.find(
                        (item) => item.id === "avatar_uncropped"
                      ) || {}
                    ).url;

                    setChannelInfo({
                      title,
                      description,
                      channel_id,
                      channel_follower_count,
                      tags,
                      avatar_url,
                    });
                    setQueryLoading(false);
                  }
                });
              }
            }}
            autoFocus
            disabled={queryLoading}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
