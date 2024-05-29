/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import userApis from "@/apis/userApis";
import Loading from "@/components/Loading";
import { AuthContext } from "@/context/AuthProvider";
import React, { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import ModalInfo from "./modalInfo/page";
import ModalChangePassword from "./modolChangePassword/page";
import "./modalInfo/style.scss";
import { Badge, Image, Tooltip, Upload } from "antd";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useTranslation } from "react-i18next";

const page = () => {
  const { t } = useTranslation();

  const currentUser = useContext(AuthContext);
  const [userId, setUserId] = useState(null);

  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newDateOfBirth, setNewDateOfBirth] = useState("");
  const [showChangeInfoModal, setShowChangeInfoModal] = useState(false);
  const [openModalChangePW, setOpenModalChangePW] = useState(false);

  const fetchData = async () => {
    try {
      const user = await userApis.getUserById(currentUser?.uid);
      setUserId(user);
      // console.log(user);
      setNewName(user.name);
      setNewGender(user.gender);
      setNewDateOfBirth(user.dateOfBirth);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  useEffect(() => {
    fetchData();
    // currentUser?.uid
  }, [currentUser?.uid]);

  const handleUpdateUserInfo = async () => {
    try {
      await userApis.updateAnUserById(currentUser?.uid, {
        name: newName,
        gender: newGender,
        dateOfBirth: newDateOfBirth,
      });
      setUserId({
        ...userId,
        name: newName,
        gender: newGender,
        dateOfBirth: newDateOfBirth,
      });
      handleCloseModals();
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  const handleShowChangeInfoModal = () => {
    setShowChangeInfoModal(true);
  };

  const handleCloseModals = () => {
    setShowChangeInfoModal(false);
    // setShowChangePasswordModal(false);
  };
  const handleOpenChangePasswordModal = () => {
    setOpenModalChangePW(true);
  };

  const handleCloseModalChangePW = () => {
    setOpenModalChangePW(false);
  };

  const handleImgChange = async ({ file }) => {
    // const reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.onload = () => resolve(reader.result);
    // reader.onerror = (error) => reject(error);
    try {
      const fmData = new FormData();
      fmData.append("file", file);
      await userApis.updateAvatar(currentUser?.uid, fmData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="conversationChat" style={{ flex: 5 }}>
      <img
        src="https://cdn2.cellphones.com.vn/1200x400/https://cdn.sforum.vn/sforum/wp-content/uploads/2023/10/zalo-video-thumbnail.jpg"
        alt=""
        width={"100%"}
        height={"200px"}
      />
      <div style={{ marginTop: "10px", marginLeft: "40px" }}>
        {userId ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              position: "relative",
            }}
          >
            <Image
              src={userId.avatar}
              width={80}
              height={80}
              style={{
                objectFit: "fill",
                borderRadius: "50%",
                cursor: "pointer",
              }}
              alt=""
            />
            <Upload
              maxCount={1}
              accept="image/*"
              progress
              customRequest={handleImgChange}
              showUploadList={false}
            >
              <Tooltip
                placement="right"
                title={t("change_avatar")}
                arrow={false}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "gray",
                    position: "absolute",
                    top: 60,
                    left: 60,
                  }}
                >
                  <CameraAltIcon />
                </div>
              </Tooltip>
            </Upload>

            <p style={{ fontSize: "20px" }}>{userId.name}</p>
          </div>
        ) : (
          <p>
            <Loading />
          </p>
        )}
      </div>
      <div style={{ marginTop: "25px" }}>
        {userId ? (
          <div
            style={{
              justifyContent: "flex-start",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginLeft: "40px",
            }}
          >
            <h3>{t("personal_info")}</h3>
            <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
              <p>{t("gender")}: </p>
              <p>{userId.gender ? userId.gender : t("no_info")}</p>
            </div>
            <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
              <p>{t("date_of_birth")}: </p>
              <p>
                {userId.dateOfBirth
                  ? format(new Date(userId.dateOfBirth), "dd/MM/yyyy")
                  : t("no_info")}
              </p>
            </div>
            <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
              <p>{t("phone")}: </p>
              <p>{userId.number ? userId.number : t("no_info")}</p>
            </div>
          </div>
        ) : (
          <p>
            <Loading />
          </p>
        )}
      </div>
      <div
        style={{
          marginTop: "40px",
          marginLeft: "40px",
          display: "flex",
          gap: "20px",
        }}
      >
        <input
          style={{
            width: "200px",
            height: "30px",
            backgroundColor: "##ccc",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "0 5px",
            fontSize: "16px",
            cursor: "pointer",
          }}
          type="button"
          value={t("change_info")}
          onClick={handleShowChangeInfoModal}
        />
        <input
          style={{
            width: "200px",
            height: "30px",
            backgroundColor: "##ccc",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "0 5px",
            fontSize: "16px",
            cursor: "pointer",
          }}
          type="button"
          value={t("change_password")}
          onClick={handleOpenChangePasswordModal}
        />
      </div>
      {/* Modal Thay đổi thông tin */}
      <ModalInfo
        show={showChangeInfoModal}
        handleClose={handleCloseModals}
        newName={newName}
        setNewName={setNewName}
        newGender={newGender}
        setNewGender={setNewGender}
        newDateOfBirth={newDateOfBirth}
        setNewDateOfBirth={setNewDateOfBirth}
        handleUpdateUserInfo={handleUpdateUserInfo}
      />
      <ModalChangePassword
        show={openModalChangePW}
        handleClose={handleCloseModalChangePW}
      />
    </div>
  );
};

export default page;
