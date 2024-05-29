import React from "react";
import { Modal, Row, Col, Input, Flex, Image } from "antd";
import Button from "@/components/Button";
import FriendRequest from "@/apis/friendRequest";
import openNotificationWithIcon from "@/components/OpenNotificationWithIcon";
import { useTranslation } from "react-i18next";

const ModalConfirmAddFriend = (props) => {
  const { t } = useTranslation();
  const { TextArea } = Input;
  const {
    children,
    message,
    setMessage,
    height = "55vh",
    show = true,
    handleClose,
    user,
    userFind,
    setUserFind,
  } = props;

  const handleOK =
    props.handleOK ||
    (async () => {
      console.log(user, userFind);
      await FriendRequest.addFriend(user, userFind);
      setUserFind({ ...userFind, state: "pending1" });
      handleClose();
      openNotificationWithIcon(
        "success",
        t("Success"),
        t("Add friend success")
      );
    });

  return (
    <Modal
      open={show}
      title={<h3>{t("Confirm")}</h3>}
      onCancel={handleClose}
      onOk={handleOK}
      footer={null}
      width={"33%"}
    >
      <Flex
        vertical
        justify="center"
        gap="25px"
        style={{
          height: height,
          maxHeight: height,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          borderTop: "1px solid #A9ACB0",
          // paddingTop: "10px",
        }}
      >
        <Flex justify="start" align="center" gap={20}>
          <Col flex="80px">
            <Image
              className="avatar-img"
              src={
                userFind?.avatar ||
                "https://firebasestorage.googleapis.com/v0/b/zalo-78227.appspot.com/o/avatarDefault.jpg?alt=media&token=2b2922bb-ada3-4000-b5f7-6d97ff87becd"
              }
              alt=""
              width={80}
              height={80}
              style={{ borderRadius: "50%" }}
            />
          </Col>
          <Col flex={"auto"}>
            <h3>
              {userFind?.name}
              {/* Name Test */}
            </h3>
          </Col>
        </Flex>
        <TextArea
          showCount
          maxLength={100}
          onChange={setMessage}
          value={message}
          placeholder={t("Enter your message here...")}
          style={{
            height: 120,
            resize: "none",
          }}
        />
        <Flex
          justify="end"
          gap={15}
          style={{
            borderTop: "1px solid #A9ACB0",
            marginTop: "25px",
            paddingTop: "10px",
          }}
        >
          <Button
            key="back"
            onClick={handleClose}
            bgColor="#DFE2E7"
            bgColorHover="#C7CACF"
            color="black"
            padding="10px 25px"
          >
            {t("CANCAL")}
          </Button>
          <Button
            key="submit"
            bgColor="#0068FF"
            bgColorHover="#0063F2"
            color="white"
            padding="10px 25px"
            onClick={handleOK}
          >
            {t("ADD FRIEND")}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default ModalConfirmAddFriend;
