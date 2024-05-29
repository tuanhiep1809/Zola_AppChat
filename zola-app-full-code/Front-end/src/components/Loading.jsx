import React from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
const Loading = () => {
    return (
        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw"}}>
            <CircularProgress />
        </Box>
    );
};

export default Loading;
