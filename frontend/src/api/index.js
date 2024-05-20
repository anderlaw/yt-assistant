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
