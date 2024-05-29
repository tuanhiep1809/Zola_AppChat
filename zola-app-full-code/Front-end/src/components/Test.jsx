"use client";
import React from "react";
import Box from "@mui/material/Box";
const Test = ({ item }) => {
  const t = item;
  console.log(item);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div>abc {item}</div>
    </Box>
  );
};

export default Test;
