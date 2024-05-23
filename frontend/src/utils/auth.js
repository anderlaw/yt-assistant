export const getAuth = () =>
  JSON.parse(localStorage.getItem("yt-assistant-auth"));

export const setAuth = (data) =>
  localStorage.setItem("yt-assistant-auth", JSON.stringify(data));
