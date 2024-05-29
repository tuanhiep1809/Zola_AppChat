import React, { useContext, useEffect, useState } from "react";
import { Modal, Button, Checkbox, Input, notification } from "antd";
import FriendApi from "@/apis/FriendApi";
import { AuthContext } from "../context/AuthProvider";
import { MuiTelInput } from "mui-tel-input";
import FriendRequest from "@/apis/friendRequest";
import { useTranslation } from "react-i18next";


const ModalAddMembersGroup = ({ visible, onCancel, onAddMembers }) => {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [friends, setFriends] = useState([]);
  const currentUser = useContext(AuthContext);

  const { t } = useTranslation();
  const [number, setNumber] = useState("");
  const [userFind, setUserFind] = useState(undefined);

  const [groupName, setGroupName] = useState("");

  const handleMemberSelection = (memberId, checked) => {
    setSelectedMembers((prevSelected) => {
      if (checked) {
        const idToAdd =
          userFind && userFind.userId ? userFind.userId : memberId;
        return [...prevSelected, idToAdd];
      } else {
        return prevSelected.filter((id) => id !== memberId);
      }
    });
  };

  const handleAddMembers = () => {
    if (selectedMembers.length < 2) {
      notification.error({
        message: "Error",
        description: "Bạn cần chọn ít nhất 2 thành viên để tạo nhóm.",
      });
      return;
    }
    onAddMembers(groupName, selectedMembers);
    onCancel();
  };

  useEffect(() => {
    const fetchData = async () => {
      const users = await FriendApi.getFriends(currentUser.uid);
      setFriends(users);
    };
    fetchData();
  }, [currentUser?.uid]);

  const getUserFriend = async () => {
    let numberNew = number.split(" ");
    numberNew[1][0] === "0" && (numberNew[1] = numberNew[1].slice(1));
    console.log(numberNew.join(""));
    const resp = await FriendRequest.getFriendByNumber(numberNew.join(""));
    if (resp?.name !== undefined) {
      const respCheck = await FriendRequest.checkFriend(
        currentUser.uid,
        resp._id
      );
      resp.state = respCheck;
      setUserFind(resp);
    } else setUserFind(undefined);
  };

  return (
    <Modal
      title="Add Members Group"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="add" type="primary" onClick={handleAddMembers}>
          Add
        </Button>,
      ]}
    >
      <Input
        placeholder="Name Group"
        style={{ marginBottom: "10px" }}
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <MuiTelInput
        size="small"
        defaultCountry={"VN"}
        value={number}
        onChange={setNumber}
        onKeyUp={(e) => {
          if (e.key === "Enter") getUserFriend();
        }}
        fullWidth
        id="phone"
        placeholder={t("Phone number")}
        name="phone"
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          marginBottom: "20px",
          zIndex: 1,
        }}
      />
      <div
        className="listF"
        style={{
          flexGrow: 1,
          overflow: "auto",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {userFind !== undefined && (
          <div
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <p style={{ marginBottom: "10px" }}>
              {t("Find friend via phone number")}
            </p>
            <div>
              <div
                key={userFind._id}
                className="itemF"
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  className="avatar-img"
                  src={userFind.avatar}
                  alt=""
                  width={50}
                  height={50}
                  style={{ borderRadius: "50%", marginRight: "20px" }}
                />
                <div>
                  <span>{userFind.name}</span>
                </div>
                <Checkbox
                  onChange={(e) =>
                    handleMemberSelection(userFind._id, e.target.checked)
                  }
                  checked={selectedMembers.includes(userFind._id)}
                  style={{ marginLeft: "auto" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="listF">
        {friends.map((item, index) => (
          <div
            key={item.userId + index}
            className="itemF"
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              // overflowY: "auto",
            }}
          >
            <img
              className="avatar-img"
              src={item.avatar}
              alt=""
              width={50}
              height={50}
              style={{ borderRadius: "50%", marginRight: "20px" }}
            />
            <div>
              <span>{item.name}</span>
            </div>
            <Checkbox
              onChange={(e) =>
                handleMemberSelection(item.userId, e.target.checked)
              }
              checked={selectedMembers.includes(item.userId)}
              style={{ marginLeft: "auto" }}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default ModalAddMembersGroup;
