import axios from "axios";

const { baseURL } = require("./config");

export const loginSignup = (email) => {
  return axios.post(`${baseURL}/add-user?email=${email}`);
};
export const getUserInfo = (payload) => {
  const email = payload.email;
  return axios.get(`${baseURL}/get-user?email=${email}`);
};
// 添加频道
export const addChannel = (payload) => {
  const email = (JSON.parse(localStorage.getItem("yt-assistant-auth")) || {})
    .email;
  return axios.post(
    `${baseURL}/add-channel`,
    Object.assign(payload, { email })
  );
};
export const queryChannel = ({ keyword, channelLink }) => {
  return axios.get(
    `${baseURL}/query-channel?keyword=${keyword}&channel-link=${channelLink}`
  );
};

export const getDbChannelVideos = (channel_id) => {
  return axios.get(`${baseURL}/get-channel-videos?channel_id=${channel_id}`);
};

export const writeViewedVideoId = (payload) => {
  return axios.post(
    `${baseURL}/write-viewed-video_id?viewed_video_ids=${payload.viewed_video_ids}&email=${payload.email}`
  );
};

export const downloadVideoByURL = (url, onDownloadProgress) => {
  return axios.get(`${baseURL}/download?url=${encodeURIComponent(url)}`, {
    onDownloadProgress: onDownloadProgress,
  });
};
