import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SectionList,
  TextInput,
  FlatList,
  Button
} from "react-native";
import { Video, ResizeMode } from "expo-av";

import {
  EvilIcons,
  MaterialIcons,
  Ionicons,
  SimpleLineIcons,
  Entypo,
  FontAwesome,
  Feather,
  AntDesign,
  FontAwesome6,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Modal from "react-native-modal";
import { useCurrentUser } from "../App";
import axiosPrivate from "../api/axiosPrivate";
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from "expo-image-picker";
import { set } from "date-fns";
const OptionChat = ({ route }) => {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [dataConversation, setDataConversation] = useState([]);
  const [isLeader, setIsLeader] = useState(false);
  const currentUser = useCurrentUser();
  const [selectedUser, setSelectedUser] = useState(null);


  const [isVisibleModalOfMember, setIsVisibleModalOfMember] = useState(false);
  const [isVisibleModalOfAdmin, setIsVisibleModalOfAdmin] = useState(false);
  const [isConfirmModalOfAdmin, setIsConfirmModalOfAdmin] = useState(false);

  const toggleVisibleModalOfMember = () => {
    setIsVisibleModalOfMember(!isVisibleModalOfMember);
  }
  const toggleVisibleModalOfAdmin = () => {
    setIsVisibleModalOfAdmin(!isVisibleModalOfAdmin);
  }
  const toggleConfirmModalOfAdmin = () => {
    setIsConfirmModalOfAdmin(!isConfirmModalOfAdmin);
  }
  const [listMembers, setListMembers] = useState([]);
  const fetchData = async () => {
    const response = await axiosPrivate.get(`/group/${route.params?.conversationInfo.conversationId}`);
    console.log("objectresponseresponse", response)
    setDataConversation(response);
    const a = response.members.filter((item) => item._id != currentUser.user.uid);
    setListMembers(a);
    if (route.params.conversationInfo.type === "group") {
      setIsGroup(true);
      if (response.adminId == currentUser.user.uid) {
        setIsLeader(true);
        // console.log("ádfassssssss", route.params.conversationInfo);
      }
    } else {
      setIsGroup(false);
    }
  }
  useEffect(() => {
    const unsubcribe = navigation.addListener("focus", () => {
      // console.log("sadjfasf");
      fetchData();
    })
    return unsubcribe;
  }, [navigation]);

  useEffect(() => {
    fetchData();
  }, []);

  const renderFriend = (item) => (
    <TouchableOpacity
      style={{ width: '90%', height: 50, marginLeft: '5%', flexDirection: 'row', marginTop: 10 }}
      onPress={() => {
        // console.log('press item', item);
        setSelectedUser(item);
        setIsConfirmModalOfAdmin(true);
        setIsVisibleModalOfAdmin(false);
      }}
    >
      <View style={{ width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={{ uri: item.avatar }}
          style={{ width: 50, height: 50, borderRadius: 50 }}
        />
      </View>
      <View style={{ width: '80%', height: '100%', justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '600' }}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  )
  async function GiaiTanNhom() {
    try {
      const response = await axiosPrivate.delete(
        `/group/dissolution/${dataConversation._id}`
      );
      navigation.navigate("Messages");
    } catch (error) {
      console.error("Giải tán nhóm false:", error);
    }
  }

  // thành viên khi rời khỏi nhóm
  const handleMemberLeaveGroup = async () => {
    try {
      const response = await axiosPrivate.patch(`/group/outGroup/${dataConversation._id}`);
      console.log("response leave group:", response);
      navigation.navigate("Messages");
    } catch (error) {
      console.error("Error member leave group:", error);
    }
  }

  // admin khi rời khỏi nhóm
  const handleAdminleaveGroup = async () => {
    try {
      // chuyển quyền trước khi out
      await axiosPrivate.patch(`/group/transferAdmin/${dataConversation._id}`, {
        userId: selectedUser._id
      });
      // sau khi chuyển quyền thì mới out
      await axiosPrivate.patch(`/group/outGroup/${dataConversation._id}`);

      navigation.navigate("Messages");
    } catch (error) {
      console.error("Error admin leave group:", error);
    }
  }

  // hàm kiểm tra user có phải phó nhóm trong nhóm không
  const checkIsPhoNhom = (userId) => {
    return dataConversation?.deputyList?.some(deputy => deputy?._id === userId);
  }
  // modal chọn ảnh đại diện
  const [isModalVisibleAVT, setModalVisibleAVT] = useState(false);
  const toggleModalAVT = () => {
    setModalVisibleAVT(!isModalVisibleAVT);
  };
  // chọn ảnh avatar từ thư viện
  async function HandelChonAVTTuThuVien() {
    toggleModalAVT();
    await pickImage();
  }
  // hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (result.cancelled) {
      return;
    }
    let localUri = result.uri;
    let filename = localUri.split("/").pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    const formData2 = new FormData();
    formData2.append("file", {
      uri: localUri,
      name: filename,
      type: "image/png",
    });
    if (formData2) {
      // try {
      //   const response = await axiosPrivate.patch(`/group/updateInfo/${route.params?.conversationInfo.conversationId}`,{
      //     image: formData2
      //   }, {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //       Accept: "application/json",
      //     }
      //   }
      // );
      //   console.log("object",response)
      // } catch (error) {
      //   console.error(":", error);
      // }
      // await fetchData();
    }
  };
  // xử lý nút chỉnh sửa tên
  const [isModalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleNameChange = (text) => {
    setNewName(text);
  };

  const handleCancel = () => {
    // Optionally reset newName to its initial state or keep the last input
    setNewName("");
    toggleModal();
  };

  const handleOk = async () => {
    try {
        const response = await axiosPrivate.patch(`/group/updateInfo/${route.params?.conversationInfo.conversationId}`,{
          name: newName
        }
      );
      } catch (error) {
        console.error(":", error);
      }
      await fetchData();
    toggleModal();
  };


  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%", height: "100%" }}>
        <View style={styles.ViewTop}>
          <TouchableOpacity onPress={() => {
            isGroup ? toggleModalAVT() : null;
          }} activeOpacity={0.8}>
            <Image
              style={{ width: 90, height: 90, borderRadius: 50 }}
              source={{
                uri: isGroup
                  ? dataConversation?.image
                  : listMembers[0]?.avatar,
              }}
            />
          </TouchableOpacity>
          <Modal
            isVisible={isModalVisible}
            onBackdropPress={toggleModal}
            style={{ justifyContent: 'center' }}
            backdropOpacity={0.65}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropTransitionInTiming={600}
            backdropTransitionOutTiming={600}
            hideModalContentWhileAnimating={true}
          >
            <View style={{
              backgroundColor: "white",
              padding: 22,
              borderRadius: 15,
              gap: 12,
              alignItems: 'center',
            }}>
              <TextInput
                style={{
                  width: '80%',
                  height: 40,
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 10,
                  borderColor: '#D6D9DC'
                }}
                autoFocus={true}
                onChangeText={handleNameChange}
                value={newName}
                placeholder="Enter new name"
              />
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around'
                ,gap: 10
              }}>
                <Button title="Cancel" onPress={handleCancel} />
                <Button title="OK" onPress={handleOk} />
              </View>
            </View>
          </Modal>
          {isGroup ? (
            <View style={{ gap: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 19, fontWeight: 500, marginTop: 7 }}>
                {dataConversation?.name}
              </Text>
              <TouchableOpacity onPress={toggleModal}>
                <AntDesign name="edit" size={24} color="black" />

              </TouchableOpacity>
            </View>

          ) : (
            <Text style={{ fontSize: 19, fontWeight: 500, marginTop: 7 }}>
              {listMembers[0]?.name}
            </Text>
          )}
          <View style={styles.ViewBottomTop}>
            <View style={styles.ViewItemTop}>
              <TouchableOpacity style={styles.ViewButtonTop}>
                <AntDesign name="search1" size={24} color="black" />
              </TouchableOpacity>

              <Text
                style={{
                  width: 60,
                  height: 50,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Tìm{"\n"}tin nhắn
              </Text>
            </View>
            {isGroup ? (
              <View style={styles.ViewItemTop}>
                <TouchableOpacity
                  style={styles.ViewButtonTop}
                  onPress={() => {
                    navigation.navigate("AddMembers", { dataConversation: dataConversation });
                  }}
                >
                  <AntDesign name="addusergroup" size={24} color="black" />
                </TouchableOpacity>

                <Text
                  style={{
                    width: 70,
                    height: 50,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Thêm{"\n"}thành viên
                </Text>
              </View>
            ) : (
              <View style={styles.ViewItemTop}>
                <TouchableOpacity style={styles.ViewButtonTop}>
                  <Feather name="user" size={24} color="black" />
                </TouchableOpacity>

                <Text
                  style={{
                    width: 60,
                    height: 50,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Trang{"\n"}cá nhân
                </Text>
              </View>
            )}

            <View style={styles.ViewItemTop}>
              <TouchableOpacity style={styles.ViewButtonTop}>
                <Ionicons
                  name="color-palette-outline"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>

              <Text
                style={{
                  width: 60,
                  height: 50,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Đổi{"\n"}hình nền
              </Text>
            </View>
            <View style={styles.ViewItemTop}>
              <TouchableOpacity
                style={styles.ViewButtonTop}
                onPress={() => setShowModal(true)}
              >
                <SimpleLineIcons name="bell" size={24} color="black" />
              </TouchableOpacity>
              <Modal
                animationType="slide"
                transparent={true}
                onBackdropPress={() => setShowModal(false)}
                visible={showModal}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.modalOption}>
                      <Text style={{ color: "#767A7F", fontSize: 12 }}>
                        Không thông báo tin nhắn tới của hội thoại này
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalOption}>
                      <Text style={styles.modalText}>Trong 1 giờ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalOption}>
                      <Text style={styles.modalText}>Trong 4 giờ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalOption}>
                      <Text style={styles.modalText}>Đến 8 giờ sáng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalOption}>
                      <Text style={styles.modalText}>
                        Cho đến khi được mở lại
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalOption, { borderBottomWidth: 0 }]}
                      onPress={() => setShowModal(false)} // Đóng modal khi nhấn vào
                    >
                      <Text
                        style={{
                          color: "#006AF5",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        Hủy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <Text
                style={{
                  width: 60,
                  height: 50,
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Tắt{"\n"}thông báo
              </Text>
            </View>
          </View>
        </View>

        {isGroup ? null : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 1,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <Feather name="edit-3" size={22} color="#767A7F" />
                <Text style={styles.text}>Đổi tên gợi nhớ </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{ backgroundColor: "white", width: "100%", marginVertical: 1 }}
        >
          <TouchableOpacity
            onPress={() => {
              // navigation.navigate("OptionChat2", { account: route.params });
            }}
            activeOpacity={0.7}
            style={[styles.item, { height: 125 }]}
          >
            <View style={[styles.contentButton]}>
              <Ionicons name="folder-outline" size={22} color="#767A7F" />
              <View style={{}}>
                <Text style={styles.text}>Ảnh, file, link đã gửi</Text>
                <View style={{ flexDirection: "row", gap: 5 }}>
                  {/* {isGroup? firtFourImageGroup.map((item, index) => {
                    return item.messageType === "VIDEO" ? (
                      <Video
                        key={index}
                        source={{ uri: item.url }}
                        style={{ width: 57, height: 67, borderRadius: 10 }}
                        useNativeControls
                        resizeMode="contain"
                      />
                    ) : (
                      <Image
                        key={index}
                        source={{ uri: item.url }}
                        style={{ width: 57, height: 67, borderRadius: 10 }}
                      />
                    );
                  }):firtFourImage.map((item, index) => {
                    return item.messageType === "VIDEO" ? (
                      <Video
                        key={index}
                        source={{ uri: item.url }}
                        style={{ width: 57, height: 67, borderRadius: 10 }}
                        useNativeControls
                        resizeMode="contain"
                      />
                    ) : (
                      <Image
                        key={index}
                        source={{ uri: item.url }}
                        style={{ width: 57, height: 67, borderRadius: 10 }}
                      />
                    );
                  })}

                   */}
                  <View
                    style={{
                      width: 57,
                      height: 67,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#B9BDC1",
                    }}
                  >
                    <MaterialIcons
                      name="navigate-next"
                      size={24}
                      color="black"
                    />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {isGroup ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 1,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <Ionicons name="calendar-outline" size={22} color="#767A7F" />
                <Text style={styles.text}>Lịch nhóm</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("CreateGroup", {
                  id: dataConversation?.user?._id,
                });
              }}
              style={styles.item}
            >
              <View style={styles.contentButton}>
                <AntDesign name="addusergroup" size={22} color="#767A7F" />
                <Text style={styles.text}>
                  Tạo nhóm với {listMembers[0]?.name}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {isGroup ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 1,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <AntDesign name="pushpino" size={22} color="#767A7F" />
                <Text style={styles.text}>Tin nhắn đã ghim</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 1,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <SimpleLineIcons name="user-follow" size={22} color="#767A7F" />
                <Text style={styles.text}>
                  Thêm {listMembers[0]?.name} vào nhóm
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {dataConversation?.adminId == currentUser.user.uid || checkIsPhoNhom(currentUser.user.uid) ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                // navigation.navigate("ListMemberGroup", { member: dataMember, idGroup: route.params.id});
              }}
              style={styles.item}
            >
              <TouchableOpacity
                style={styles.contentButton}
                onPress={() => {
                  navigation.navigate("BrowseMembers", { dataConversation: dataConversation });
                }}
              >
                <Feather name="users" size={22} color="#767A7F" />
                <Text style={styles.text}>
                  Duyệt thành viên
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ) : null
        }

        {isGroup ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                // navigation.navigate("ListMemberGroup", { member: dataMember, idGroup: route.params.id});
              }}
              style={styles.item}
            >
              <TouchableOpacity
                style={styles.contentButton}
                onPress={() => {
                  navigation.navigate("ViewMember", { dataConversation: dataConversation });
                }}
              >
                <Feather name="users" size={22} color="#767A7F" />
                <Text style={styles.text}>
                  Xem thành viên ({dataConversation?.members.length})
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 1,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <Feather name="users" size={22} color="#767A7F" />
                <Text style={styles.text}>Xem nhóm chung</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{ backgroundColor: "white", width: "100%", marginVertical: 1 }}
        >
          <TouchableOpacity style={styles.item}>
            <View style={styles.contentButton}>
              <Entypo name="eye-with-line" size={22} color="#767A7F" />
              <Text style={styles.text}>Ẩn trò chuyện</Text>
            </View>
          </TouchableOpacity>
        </View>

        {isGroup ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <Entypo name="link" size={22} color="#767A7F" />
                <Text style={styles.text}>Link tham gia nhóm</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <Feather name="phone-incoming" size={22} color="#767A7F" />
                <Text style={styles.text}>Báo cuộc gọi đến</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {isGroup ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <AntDesign name="pushpino" size={24} color="black" />
                <Text style={styles.text}>Ghim trò chuyện</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <FontAwesome5 name="user-cog" size={22} color="#767A7F" />
                <Text style={styles.text}>Cài đặt cá nhân</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {isGroup ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <FontAwesome5 name="user-cog" size={22} color="#767A7F" />
                <Text style={styles.text}>Cài đặt cá nhân</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <MaterialCommunityIcons
                  name="message-text-clock-outline"
                  size={22}
                  color="#767A7F"
                />
                <Text style={styles.text}>Tin nhắn tự xóa</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{ backgroundColor: "white", width: "100%", marginVertical: 2 }}
        >
          <TouchableOpacity style={styles.item}>
            <View style={styles.contentButton}>
              <AntDesign name="warning" size={22} color="#767A7F" />
              <Text style={styles.text}>Báo xấu</Text>
            </View>
          </TouchableOpacity>
        </View>
        {isLeader ? (
          <View
            style={{ backgroundColor: "white", width: "100%", marginVertical: 2 }}
          >
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                navigation.navigate('TranferAdmin', { dataConversation: dataConversation });
              }}
            >
              <View style={styles.contentButton}>
                <SimpleLineIcons name="user-unfollow" size={24} color="black" />
                <Text style={styles.text}>Chuyển quyền trưởng nhóm</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        <View
          style={{ backgroundColor: "white", width: "100%", marginVertical: 2 }}
        >
          <TouchableOpacity style={styles.item}>
            <View style={styles.contentButton}>
              <Ionicons name="pie-chart-outline" size={22} color="#767A7F" />
              <Text style={styles.text}>Dung lượng trò chuyện</Text>
            </View>
          </TouchableOpacity>
        </View>
        {isGroup ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                if (isLeader) {
                  setIsVisibleModalOfAdmin(true);
                } else {
                  setIsVisibleModalOfMember(true);
                }
              }}
            >
              <View style={styles.contentButton}>
                <Feather name="log-out" size={22} color="red" />
                <Text style={styles.text}>Rời nhóm</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <Entypo name="block" size={22} color="#767A7F" />
                <Text style={styles.text}>Quản lý chặn</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {isGroup ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={22}
                  color="red"
                />
                <Text style={styles.text}>Xóa lịch sử trò chuyện </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity style={styles.item}>
              <View style={styles.contentButton}>
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={22}
                  color="red"
                />
                <Text style={styles.text}>Xóa lịch sử trò chuyện </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {isLeader ? (
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginVertical: 2,
            }}
          >
            <TouchableOpacity
              onPress={GiaiTanNhom}
              style={styles.item}>
              <View style={styles.contentButton}>
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={22}
                  color="red"
                />
                <Text style={styles.text}>Giải tán nhóm </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
      {/* modal leave chat of members */}
      <Modal
        isVisible={isVisibleModalOfMember}
        onBackdropPress={toggleVisibleModalOfMember}
        style={{
          // position:'absolute',
          top: 0,
          right: '5%',
          width: '100%',
          height: '100%',
        }}
        backdropOpacity={0.4}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={{ width: '100%', height: 250, borderRadius: 10, backgroundColor: 'white' }}>
          <View style={{ width: '100%', height: 70, marginTop: 20, justifyContent: 'center', borderBottomWidth: 0.5 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
              Rời khỏi nhóm và xóa cuộc hội thoại?
            </Text>
          </View>
          <View style={{ width: '100%', height: 150 }}>
            <TouchableOpacity
              style={{ width: '80%', height: '30%', backgroundColor: 'red', marginLeft: '10%', marginTop: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
              onPress={handleMemberLeaveGroup}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
                Rời nhóm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: '80%', height: '30%', marginLeft: '10%', marginTop: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => {
                setIsVisibleModalOfMember(false);
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: 'black' }}>
                Hủy
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      {/* modal leave chat of admin */}
      <Modal
        isVisible={isVisibleModalOfAdmin}
        onBackdropPress={toggleVisibleModalOfAdmin}
        style={{
          // position:'absolute',
          top: 0,
          // left: 0,
          right: '5%',
          width: '100%',
          height: '100%',
        }}
        backdropOpacity={0.4}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={{ width: '100%', height: 500, borderRadius: 10, backgroundColor: 'white' }}>
          <View style={{ width: '100%', height: 70, marginTop: 20, justifyContent: 'center', borderBottomWidth: 0.5 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
              Chọn trưởng nhóm mới trước khi rời
            </Text>
          </View>
          <View style={{ width: '90%', height: 30, marginLeft: '5%', backgroundColor: 'gray', marginTop: 10, borderRadius: 10 }}>
            <TextInput
              placeholder="Tìm kiếm"
            />
          </View>
          <View style={{ width: '100%', height: 300, marginTop: 20 }}>
            <FlatList
              data={listMembers}
              renderItem={({ item }) => renderFriend(item)}
              keyExtractor={item => item._id}
            />
          </View>
        </View>
      </Modal>
      {/* modal confirm leave chat of admin */}
      <Modal
        isVisible={isConfirmModalOfAdmin}
        onBackdropPress={toggleConfirmModalOfAdmin}
        style={{
          // position:'absolute',
          top: 0,
          // left: 0,
          // right: '5%',
          // width: '100%',
          // height: '100%',
        }}
        backdropOpacity={0.4}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={{ width: '100%', height: 250, borderRadius: 10, backgroundColor: 'white' }}>
          <View style={{ width: '100%', height: 70, marginTop: 20, justifyContent: 'center', borderBottomWidth: 0.5 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
              Rời khỏi nhóm và xóa cuộc hội thoại?
            </Text>
          </View>
          <View style={{ width: '100%', height: 150 }}>
            <TouchableOpacity
              style={{ width: '80%', height: '30%', backgroundColor: 'red', marginLeft: '10%', marginTop: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
              onPress={handleAdminleaveGroup}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
                Rời nhóm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: '80%', height: '30%', marginLeft: '10%', marginTop: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => {
                setIsConfirmModalOfAdmin(false);
                setIsVisibleModalOfAdmin(true);
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: 'black' }}>
                Hủy
              </Text>
            </TouchableOpacity>

          </View>
        </View>

      </Modal>
      <Modal
        isVisible={isModalVisibleAVT}
        onBackdropPress={toggleModalAVT}
        style={styles.modalAVT}
        backdropOpacity={0.65}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.modalContentAVT}>
          <Text style={{ fontSize: 17, color: "#03316D", fontWeight: 500 }}>
            Ảnh đại diện
          </Text>
          <TouchableOpacity
            onPress={HandelChonAVTTuThuVien}
            style={styles.modalItemAVT}
          >
            <Feather name="image" size={24} color="black" />
            <Text style={styles.modalText}>Chọn ảnh từ thư viện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalItemAVT}>
            <Feather name="camera" size={24} color="black" />
            <Text style={styles.modalText}>Chụp ảnh mới</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E9EBED",
    alignItems: "center",
    gap: 10,
  },
  ViewTop: {
    width: "100%",
    height: 255,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  ViewBottomTop: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  ViewItemTop: {
    alignItems: "center",
    justifyContent: "center",
    width: "25%",
    gap: 7,
  },
  ViewButtonTop: {
    width: 45,
    height: 45,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F6",
  },
  FlatListItem: {
    width: "90%",
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  //   touchableOpacity: {
  //     flexDirection: "row",
  //     alignItems: "flex-start",
  //     borderColor: "#DDDDDD",
  //     borderBottomWidth: 1,
  //     width: "100%",
  // },
  item: {
    alignItems: "flex-start",
    marginHorizontal: 14,
    height: 50,
    justifyContent: "center",
  },
  contentButton: {
    gap: 10,
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 19,
    color: "black",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "98%",
    marginBottom: 6,
  },
  modalContent: {
    backgroundColor: "white",
    width: "98%",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalOption: {
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#006AF5",
  },

  modalAVT: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContentAVT: {
    backgroundColor: "white",
    padding: 22,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    gap: 12,
  },
  modalItemAVT: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  }
});

export default OptionChat;
