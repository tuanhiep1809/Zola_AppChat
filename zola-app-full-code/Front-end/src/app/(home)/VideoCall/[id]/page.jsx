"use client";
import React, { useContext, useEffect, useState } from "react";

import AgoraUIKit from "agora-react-uikit";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthProvider";
import { useSocket } from "@/context/SocketProvider";

const Page = (conversationId) => {
  const [videoCall, setVideoCall] = useState(false);
  const router = useRouter();
  const currentUser = useContext(AuthContext);
  const { socket } = useSocket();

  useEffect(() => {
    setVideoCall(true);
  }, [conversationId]);

  useEffect(() => {
    socket.on("decline-call", (data) => {
      console.log("data", data);
      setVideoCall(false);
      window.location.href = `${window.location.origin}/tinNhan/${conversationId.params.id}`;
    });
  }, []);

  const rtcProps = {
    appId: "5a55004d2d524938a0edde0ecd2349ae",
    channel: conversationId.params.id,
  };
  // console.log(conversationId.params.id);

  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      socket.emit("end-call", {
        channel: conversationId.params.id,
      });
      window.location.href = `${window.location.origin}/tinNhan/${conversationId.params.id}`;
      // window.location.reload();
    },
  };

  return (
    <div className="App">
      {videoCall && (
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
          <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
        </div>
      )}
    </div>
  );
};

export default Page;
