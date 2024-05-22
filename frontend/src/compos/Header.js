import * as React from 'react';
import Avatar from '@mui/material/Avatar';


export default ({authState})=>{
    return <div style={{
        position: 'fixed',
        left:0,
        right:0,
        top:0,
        height:'60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding:'0 20px',
        zIndex:10,
        backgroundColor:'#FFFFFF',
    }}>
      <a href="#">Logo</a>
      <Avatar>{authState && authState.email[0]}</Avatar>
    </div>
};
