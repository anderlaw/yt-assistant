import * as React from "react";
import Avatar from "@mui/material/Avatar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";

import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { useEffect, useState } from "react";

import { useSmallDevice } from "../utils/useQuery";
export default ({onMenuClick }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const smallDeviceMatches = useSmallDevice();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar position="static">
      <Toolbar>
        {/* {smallDeviceMatches && (
          <IconButton
              onClick={()=>onMenuClick()}
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )} */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Youtube中转站
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
