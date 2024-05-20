const express = require("express");
const router = express.Router();

const addUser = require("../services/add-user");
const getUser = require("../services/get-user");
const queryChannel = require("../services/query-channel");
const searchChannel = require("../services/search-channel");
const addChannel = require("../services/add-channel");

//用户注册
router.post("/add-user", (req, res) => {
  addUser(
    {
      email: req.query.email,
    },
    (data) => {
      console.log(data);
      res.json(data);
    }
  );
});
//获取用户信息
router.get("/get-user", (req, res) => {
  getUser(
    {
      email: req.query.email,
    },
    (data) => {
      console.log(data);
      res.json(data);
    }
  );
});
// 搜索频道：根据关键字或者链接搜索频道
router.get("/query-channel", (req, res) => {
  const keyword = req.query.keyword;
  const channelLink = req.query["channel-link"];
  const payload = channelLink || keyword;
  if (channelLink) {
    // 直接查询
    queryChannel(channelLink, (data) => {
      res.send(data);
    });
  } else if (keyword) {
    //关键字查询
    searchChannel(payload, (json) => {
      const data_obj = JSON.parse(json);
      if (data_obj.entries && data_obj.entries.length) {
        const channelLink = data_obj.entries[0].channel_url;
        queryChannel(channelLink, (data) => {
          res.send(data);
        });
      } else {
        res.send(JSON.stringify(null));
      }
    });
  } else {
    //前端没有传送query
    res.status(400).send("Bad Request");
    res.status(400).send("Bad Request");
  }
});
// 增加频道
router.post("/add-channel", (req, res) => {
  // req
  const payload = req.body;
  console.log(req.body);
  if (!payload.email) {
    res.status(400).send("Bad Request");
  } else {
    addChannel(payload, (data) => {
      console.log(data);
      res.json(data);
    });
  }
  // const channel_info = {
  //   channel_id: req.query.channel_id,
  //   title: req.query.title,
  //   description: req.query.description,
  //   avatar_url: req.query.avatar_url,
  //   tags: req.query.tags,
  //   email: req.query.email,
  //   channel_follower_count:req.body.channel_follower_count

  //   /**
  //    * {
  //    * avatar_url:thumbnails.find(item => item.id ==='avatar_uncropped').url,
  //    * banner_url:thumbnails.find(item => item.resolution === '1280x720').url
  //    * }
  //    */
  // };

  //写入。channel-watch
});
module.exports = router;
