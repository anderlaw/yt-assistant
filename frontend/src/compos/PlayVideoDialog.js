import Backdrop from "@mui/material/Backdrop";
import {useEffect,useState} from "react";

import Plyr from 'plyr';
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
export default ({videoInfo,open,handleClose}) => {
    const [player,setPlayer] = useState(null);
    useEffect(()=>{
        if(videoInfo && open){
            setTimeout(()=>{
                console.log('视频信息改变！！！！',videoInfo);
                console.log(document.querySelector('#video-player'))
                //播放视频
                const videoEle = document.querySelector('#video-player');
                videoEle.src = `http://43.133.193.236/media/${videoInfo.id}/${videoInfo.out_video_filename}`;
                const player = new Plyr('#video-player');
                player.play();
                setPlayer(player);
            })

        }
    },[videoInfo,open])
    useEffect(()=>{
        if(player && !open ){
            player.stop();
            player.destroy();
        }
    },[player,open])
    return (
        <Dialog
            open={open}
        >
            <DialogTitle>播放视频</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{
                minWidth:'300px',
                maxWidth:'800px'
            }}>
                <video style={{
                    maxWidth:'800px',
                    width:'100%'
                }} id="video-player"></video>
            </DialogContent>
        </Dialog>
    );
}