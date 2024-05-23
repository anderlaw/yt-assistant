import * as React from 'react';
import Drawer from '@mui/material/Drawer';
export default function DrawerComp({open,handleClose,children}) {
    return (
        <Drawer open={open} onClose={()=>handleClose(false)}>
            {children}
        </Drawer>
    );
}