"use client";
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import openNotificationWithIcon from "@/components/OpenNotificationWithIcon";
const Home = ({params}) => {
    return (
        <div className="loading">
            {params?.changePassword && openNotificationWithIcon("success", "Change password successed!","Change password successed!")}
            <div className="">
                <h1>
                    Welcome to zola
                </h1>
            </div>
        </div>
    );
};

export default Home;
