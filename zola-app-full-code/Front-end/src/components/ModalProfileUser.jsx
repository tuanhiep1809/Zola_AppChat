import React from "react";
import { Modal, Typography, Image } from "antd";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const ModalProfileUser = ({ isOpen, onClose, user }) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={"33.3333%"}
      // maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
    >
      <div>
        <Typography.Title level={4}>{t("personal_info")}</Typography.Title>
        <img
          src="https://cdn2.cellphones.com.vn/1200x400/https://cdn.sforum.vn/sforum/wp-content/uploads/2023/10/zalo-video-thumbnail.jpg"
          alt=""
          width={"100%"}
          height={"170px"}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginLeft: "10px",
            marginTop: "-20px",
            marginBottom: "10px",
          }}
        >
          <Image
            src={
              user?.avatar ||
              "https://firebasestorage.googleapis.com/v0/b/zalo-78227.appspot.com/o/avatarDefault.jpg?alt=media&token=2b2922bb-ada3-4000-b5f7-6d97ff87becd"
            }
            alt={user?.name}
            width={60}
            height={60}
            style={{ borderRadius: "50%" }}
          />
          <Typography.Title
            level={4}
            style={{ fontSize: "20px", marginTop: "14px" }}
          >
            {user?.name}
          </Typography.Title>
        </div>
        <div
          style={{
            paddingBottom: "10px",
            borderBottom: "3px solid #ccc",
            marginLeft: "10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography.Title level={5}>{t("personal_info")}</Typography.Title>

          <Typography.Text style={{ fontSize: "16px" }}>
            {t("gender")}:{" "}
            <span style={{ marginLeft: "39px" }}>{user?.gender}</span>
          </Typography.Text>
          <Typography.Text style={{ fontSize: "16px" }}>
            {t("date_of_birth")}:{" "}
            <span style={{ marginLeft: "30px" }}>
              {user?.dateOfBirth
                ? format(new Date(user?.dateOfBirth), "dd/MM/yyyy")
                : t("no_info")}
            </span>
          </Typography.Text>
          <Typography.Text style={{ fontSize: "16px" }}>
            {t("phone")}:{" "}
            <span style={{ marginLeft: "6px" }}>{user?.number}</span>
          </Typography.Text>
        </div>
        <div
          style={{
            paddingBottom: "10px",
            marginLeft: "10px",
            marginTop: "10px",
          }}
        >
          <Typography.Title level={5}>{t("change_avatar")}</Typography.Title>
          <Typography.Text style={{ fontSize: "16px" }}>
            {t("no_info")}
          </Typography.Text>
        </div>
      </div>
    </Modal>
  );
};

export default ModalProfileUser;
