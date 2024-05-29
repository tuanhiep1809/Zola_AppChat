  "use client";
  import React, { useContext, useEffect, useState } from "react";
  import "./styles.scss";
  import Image from "next/image";
  import ChatIcon from "@mui/icons-material/Chat";
  import ChatOutlined from "@mui/icons-material/ChatOutlined";
  import ContactsIcon from "@mui/icons-material/Contacts";
  import ContactsOutlined from "@mui/icons-material/ContactsOutlined";
  import SettingsIcon from "@mui/icons-material/Settings";
  import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
  import LogoutIcon from "@mui/icons-material/Logout";
  import Link from "next/link";
  import Loading from "@/components/Loading";
  import { useRouter } from "next/navigation";
  import { AuthContext } from "@/context/AuthProvider";
  import { auth } from "@/firebase";
  import axios from "axios";
  import axiosPrivate from "@/apis/axios";
  import { SocketContext } from "@/context/SocketProvider";
  import userApis from "@/apis/userApis";
  import { useSocket } from "../../context/SocketProvider";
  import openNotificationWithIcon from "@/components/OpenNotificationWithIcon";
  import ModalSettings from "@/components/ModalSettings";
  import { useTranslation } from "react-i18next";

  const Layout = ({ children, params }) => {
    const { t } = useTranslation();
    const [Active, setActive] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const currentUser = useContext(AuthContext);
    const { socket } = useSocket();
    const [conversationId, setConversationId] = useState(params.id);
    const [conversation, setConversation] = useState(null); //[currentUser?.uid, receiverId
    const [currentConversation, setCurrentConversation] = useState(null);
    const [user, setUser] = useState(null);
    const [visibleSettingModal, setVisibleSettingModal] = useState(false);

    const handleCaNhanUser = () => {
      // console.log(item.currentUser?.uid);
      router.push("/caNhanUser");
    };
    const handleTinNhan = () => {
      setActive("tinNhan");
    };
    const handleDanhBa = () => {
      setActive("danhBa");
    };

    const handleSetting = () => {
      setVisibleSettingModal(true);
    };
    const handleCancelSettingModal = () => {
      setVisibleSettingModal(false);
    };
    const handleSignOut = () => {
      auth.signOut();
      router.push("/login");
      socket.disconnect();
    };

    useEffect(() => {
      (async () => {
        if (currentUser) {
          setIsAuthenticated(true);
          const user1 = await userApis.getUserById(currentUser.uid);
          setUser(user1);
        } else setIsAuthenticated(false);
        setIsLoading(false);
      })();
    }, [currentUser]);

    useEffect(() => {
      if (!isAuthenticated) return router.push("/login");
      else if (Active) router.push(`/${Active}`);
    }, [Active, isAuthenticated]);

    useEffect(() => {
      if(socket) { 
        socket.on("receiveFriendRequest", (data) => {
          console.log("Socket connected received", data);
          openNotificationWithIcon(
            "success",
            t("notification"),
            `${data.name} ${t("friend_request_notification")}`
          );
        });
        socket.on("acceptFriendRequest", (data) => {
          console.log("Socket connected accept", data);
          openNotificationWithIcon(
            "success",
            t("notification"),
            `${data.name} ${t("accept_friend_request_notification")}`
          );
        });
        socket.on("cancelFriendRequest", (data) => {
          console.log("Socket connected cancel", data);
          openNotificationWithIcon(
            "success",
            t("notification"),
            `${data.name} ${t("cancel_friend_request_notification")}`
          );
        });
      }
    }, [socket]);

    if (isLoading) return <Loading />;
    return (
      <div className="container">
        <div className="sidebar">
          <div className="top">
            <img
              className="avatar"
              width={48}
              height={48}
              alt=""
              src={
                user?.avatar ||
                "https://firebasestorage.googleapis.com/v0/b/zalo-78227.appspot.com/o/avatarDefault.jpg?alt=media&token=2b2922bb-ada3-4000-b5f7-6d97ff87becd"
              }
              onClick={handleCaNhanUser}
            />
            <div
              className={`item ${Active === "tinNhan" && "active"}`}
              onClick={handleTinNhan}
            >
              {Active === "tinNhan" ? (
                <ChatIcon sx={{ color: "#fff" }} />
              ) : (
                <ChatOutlined sx={{ color: "#fff" }} />
              )}
              <div className="badge">2</div>
            </div>
            <div
              className={`item ${Active === "danhBa" && "active"}`}
              onClick={handleDanhBa}
            >
              {Active === "danhBa" ? (
                <ContactsIcon sx={{ color: "#fff" }} />
              ) : (
                <ContactsOutlined sx={{ color: "#fff" }} />
              )}
            </div>
            <div
              className={`item ${Active === "settings" && "active"}`}
              onClick={handleSetting}
            >
              <SettingsOutlined sx={{ color: "#fff" }} />
            </div>
            <ModalSettings
              visible={visibleSettingModal}
              onClose={handleCancelSettingModal}
            />
          </div>
          <div className="bottom">
            <div className="item" onClick={handleSignOut}>
              <LogoutIcon sx={{ color: "#fff", fontSize: 30 }} />
            </div>
          </div>
        </div>
        <div style={{ height: "100vh" }}>{children}</div>
      </div>
    );
  };

  export default Layout;
