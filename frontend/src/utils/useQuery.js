import useMediaQuery from "@mui/material/useMediaQuery";
export const useSmallDevice = () => {
  return useMediaQuery("(max-width:800px)");
};
