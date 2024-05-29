"use client";
import React, { useContext, useEffect, useState } from "react";
import "./styles.scss";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Image from "next/image";
import FriendRequest from "@/apis/friendRequest";
import { AuthContext } from "@/context/AuthProvider";
import imageDefault from "@/constants/imgDefault";
import { Modal } from "antd";
import Button from "@/components/Button";
import openNotificationWithIcon from "@/components/OpenNotificationWithIcon";
import { set } from "date-fns";
import { useTranslation } from "react-i18next";

const FriendRequestPage = () => {
  const { t } = useTranslation();
  const [friendRequestReceived, setFriendRequestReceived] = useState([]);
  const [friendRequestSend, setFriendRequestSend] = useState([]);
  const [openModel, setOpenModel] = useState(undefined);
  const currentUser = useContext(AuthContext);

  useEffect(() => {
    const fetch = async () => {
      const dataReceived = await FriendRequest.getFriendRequestReceived(
        currentUser.uid
      );
      setFriendRequestReceived(dataReceived);

      const dataSend = await FriendRequest.getFriendRequestSend(
        currentUser.uid
      );
      setFriendRequestSend(dataSend);
    };
    fetch();
  }, []);

  return (
    <div>
      {friendRequestReceived.length !== 0 && (
        <h4 className="pTitleFR">
          {t("Request received")} ({friendRequestReceived.length})
        </h4>
      )}
      <div className="containerFR">
        {friendRequestReceived.map((item, index) => (
          <div className="itemFR" key={index}>
            <div className="topItemFR">
              <img
                className="imageFR"
                src={item.avatar || imageDefault}
                alt=""
              />
              <p className="nameFR">{item.name}</p>
            </div>
            <div className="bottomItemFR">
              <span>
                {t("Hello, I'm")} {item.name}. {t("Let's be friends!")}
              </span>
            </div>
            <div className="buttonItemFR">
              <button
                className="btn declineFR"
                onClick={() => setOpenModel({ status: 0, id: item._id })}
              >
                {t("Decline")}
              </button>
              <button
                className="btn acceptFR"
                onClick={() => setOpenModel({ status: 1, id: item._id })}
              >
                {t("Accept")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {friendRequestSend.length !== 0 && (
        <h4 className="pTitleFR">
          {t("Request send")} ({friendRequestSend.length})
        </h4>
      )}
      <div className="containerFR">
        {friendRequestSend.map((item, index) => (
          <div className="itemFR" key={index}>
            <div className="topItemFR">
              <img
                className="imageFR"
                src={item.avatar || imageDefault}
                alt=""
              />
              <p className="nameFR">{item.name}</p>
            </div>
            <div className="bottomItemFR">
              <span>{t("Invitation has been sent to this person")}</span>
            </div>
            <div className="buttonItemFR">
              <button
                className="btn"
                style={{ backgroundColor: "#A9ACB0", border: "none" }}
                onClick={() => setOpenModel({ status: 2, id: item._id })}
              >
                {t("Cancel request")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {friendRequestReceived?.length === 0 &&
        friendRequestSend?.length === 0 && (
          <h4 className="pTitleFR">Request empty</h4>
        )}

      <Modal
        title={
          <h3>{openModel?.status == 2 ? t("Cancel request") : t("Confirm")}</h3>
        }
        open={openModel && true}
        footer={null}
        onCancel={() => setOpenModel(undefined)}
      >
        <p
          style={{
            paddingTop: "10px",
            fontSize: "16px",
            borderTop: "1px solid #A9ACB0",
          }}
        >
          {openModel?.status == 2
            ? t("Are you sure you want to cancel this request")
            : openModel?.status == 1
            ? t("Are you sure you want to accept this request")
            : t("Are you sure you want to decline this request")}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "5px",
          }}
        >
          {openModel?.status !== 2 ? (
            <>
              <Button
                padding="10px 15px"
                bgColorHover="#A9ACB0"
                bgColor="#EAEDF0"
                onClick={() => setOpenModel(undefined)}
              >
                {t("No")}
              </Button>
              <Button
                padding="10px 15px"
                bgColorHover="#A9ACB0"
                bgColor="#C7E0FF"
                color="#005AE0"
                onClick={() => {
                  setFriendRequestReceived(
                    friendRequestReceived.filter(
                      (item) => item._id !== openModel.id
                    )
                  );
                  openModel.status == 0
                    ? FriendRequest.declineFriendRequest(openModel.id)
                    : FriendRequest.acceptFriendRequest(openModel.id);
                  openNotificationWithIcon(
                    "success",
                    "Success",
                    `Success ${
                      openModel?.status == 0 ? t("decline") : t("accept")
                    } ${t("request to friend")}`
                  );
                  setOpenModel(undefined);
                }}
              >
                {openModel?.status == 0 ? t("Decline") : t("Accept")}
              </Button>
            </>
          ) : (
            <>
              <Button
                padding="10px 15px"
                bgColorHover="#A9ACB0"
                bgColor="#EAEDF0"
                onClick={() => setOpenModel(undefined)}
              >
                {t("No")}
              </Button>
              <Button
                padding="10px 15px"
                bgColorHover="#A9ACB0"
                bgColor="#eb4b4b"
                color="white"
                onClick={() => {
                  setFriendRequestSend(
                    friendRequestSend.filter(
                      (item) => item._id !== openModel.id
                    )
                  );
                  FriendRequest.cancalRequest(openModel.id);
                  openNotificationWithIcon(
                    "success",
                    "Cancel request",
                    t("Cancel request to friend")
                  );
                  setOpenModel(undefined);
                }}
              >
                {t("Delete")}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FriendRequestPage;
