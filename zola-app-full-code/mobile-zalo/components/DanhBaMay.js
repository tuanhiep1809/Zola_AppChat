import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import axiosPrivate from "../api/axiosPrivate.js";
import { useFocusEffect } from "@react-navigation/native";
import { AuthenticatedUserContext } from "../App.js";
import { useNavigation } from "@react-navigation/native";

import * as Contacts from "expo-contacts";
import { set } from "date-fns";
import { useSocket } from "../context/SocketProvider.js";
//hàm cắt tên quá dài
function FormatTenQuaDai(text, maxLength) {
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + "..."
    : text;
}

function DanhBaMay() {
  const [contacts, setContacts] = useState([]);
  function FormatTenQuaDai(text, maxLength) {
    return text.length > maxLength
      ? text.substring(0, maxLength - 3) + "..."
      : text;
  }
  // lấy chủ tài khoản
  const { user } = useContext(AuthenticatedUserContext);
  //Lấy danh sách bạn bè
  const [users, setUsers] = useState([]);
  const [phonebook, setPhonebook] = useState([]);
  const { socket } = useSocket();
  useEffect(() => {
    if(socket) { 
      socket.on("receiveFriendRequest", (data) => {
        getDataTong()
      });
      socket.on("cancelFriendRequest", (data) => {
        getDataTong()
      });
      socket.on("acceptFriendRequest", (data) => {
        getDataTong()
      });
    }
  }, [socket]);

  useEffect(() => { (async()=>{
    await getDataTong();
  })()}, []);
  async function getDataTong() {
   await fetchContacts();
    const users = await axiosPrivate("/user");
    // lấy friends của user hiện hành
    const friends = await axiosPrivate(`/friends/phoneBook/${user.uid}`);
    setPhonebook(friends);
    setUsers(users); 
  }
  //hàm kiểm tra xem sdt đó có đang dùng zalo không, có thì trả về user đó
  function isCoDungZL(sdt) {
    const userWithPhoneNumber = users.find((user) => {
      let number = "0" + user.number.slice(3);
      return number === sdt.replace(/\s/g, "");
    });
    return userWithPhoneNumber;
  }

  // hàm lấy danh bạ máy
  const fetchContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      try {
        // Lấy danh bạ với các trường đã chỉ định
        const { data } = await Contacts.getContactsAsync({fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name]});
        
        if (data.length > 0) {
            // Xử lý dữ liệu danh bạ nếu cần
            handleFormatContacts(data);
        } else {
            console.log('Không tìm thấy danh bạ.');
        }
    } catch (error) {
        console.error('Lỗi khi truy xuất danh bạ: ', error);
    }
    }
  };
  // format danh bạ máy về dạng mảng object {nameDanhBa, number}
  const [b, setB] = useState([]);
  const handleFormatContacts = (contacts) => {
    const a = contacts.filter((item) => {
      return ( 
        item.phoneNumbers &&
        item.phoneNumbers.length > 0 &&
        isCoDungZL(item.phoneNumbers[0].number)
      );
    });

    const b = a.map((v) => {
      const user = isCoDungZL(v.phoneNumbers[0].number);
      return {
        userId: user._id,
        nameDanhBa: v.name,
        number: v.phoneNumbers[0].number,
      };
    });
    setB(b);
  };

  // kiểm tra trên database có phonebook không, nếu không có thì lấy danh bạ máy, nếu có thì lấy phonebook
  const phonebook1 = phonebook.length !== 0 ? phonebook : b;
  // cập nhật danh bạ máy lên api
  useEffect(() => {
    if (phonebook.length !== 0) {
      return;
    } else {
      // const formatContacts = handleFormatContacts(contacts);
      uploadPhoneBook(b);
      console.log("upload phonebook success");
    }
  }, [phonebook1]);

  // Sắp xếp danh sách conTacst theo tên (name)
  const [sortedData, setSortedData] = useState([]);
  // hàm trả về trạng thái kết bạn
  async function isFriend(id) {
    const stateFriend = await axiosPrivate("/friendRequest/state", {
      params: { userId1: user.uid, userId2: id },
    });
    return String(stateFriend);
  }

  useEffect(() => {
    (async () => {
      let sortedDataTemp = phonebook1.sort((a, b) =>
        a.nameDanhBa.localeCompare(b.nameDanhBa)
      );
      sortedDataTemp = await Promise.all(
        sortedDataTemp.map(async (item) => {
          const state = await isFriend(item.userId);
          return {
            ...item, 
            state,
          };
        })
      );
      setSortedData(sortedDataTemp);
    })();
  }, [phonebook1]);

  // Tạo một đối tượng để nhóm các tên theo chữ cái
  const groupedData = {};
  sortedData?.forEach((item) => {
    const firstChar = item.nameDanhBa.charAt(0).toUpperCase();
    if (!groupedData[firstChar]) {
      groupedData[firstChar] = [];
    }
    groupedData[firstChar].push(item);
  });

  // hàm đưa contacts lên api vào phoenbook
  async function uploadPhoneBook(formatContacts) {
    try {
      await axiosPrivate.patch(`/friends/update-phonebook/${user.uid}`, {
        phoneBook: formatContacts,
      });
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  }

  //hàm đồng ý kết bạn
  const DongY = async (id) => {
    try {
      await axiosPrivate.post("/friendRequest/accept", {
        friendRequestId: id + "-" + user.uid,
      });
      const friends = await axiosPrivate(`/friends/phoneBook/${user.uid}`);
      setPhonebook(friends);
    } catch (err) {
      console.log("Lỗi đồng ý kết bạn", err);
    }
  };
  //hàm thu hồi lời mời kết bạn
  async function ThuHoi(id) {
    const idThu = user.uid + "-" + id;
    try {
      await axiosPrivate.post(`/friendRequest/cancel`, {
        friendRequestId: idThu,
      });
      const friends = await axiosPrivate(`/friends/phoneBook/${user.uid}`);
      setPhonebook(friends);
    } catch (error) {
      console.log(error);
    }
  }
  // hàm từ chối lời mời kết bạn
  // async function TuChoi(id) {
  //   try {
  //     const idTuChoi = id + "-" + user.uid;
  //     await axiosPrivate.post(`/friendRequest/decline`, {
  //       friendRequestId: idTuChoi,
  //     });
  //     const friends = await axiosPrivate(`/friends/phoneBook/${user.uid}`);
  //     setPhonebook(friends);
  //     getReceivedFriendRequests();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  //Hàm kết bạn
  const KetBan = async (id) => {
    try {
      await axiosPrivate.post("/friendRequest/send", {
        senderUserId: user.uid,
        receiverUserId: id,
      });
      const friends = await axiosPrivate(`/friends/phoneBook/${user.uid}`);
      setPhonebook(friends);
    } catch (err) {
      console.log("Lỗi kết bạn", err);
    }
  };
  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          height: 50,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "500", padding: 10 }}>
          Cập nhật lại danh bạ
        </Text>
        <TouchableOpacity
          onPress={() => {
            uploadPhoneBook(b); 

            getDataTong();

          }}
          style={{}}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#00aaff" }}>
            Cập nhật
          </Text>
        </TouchableOpacity> 
      </View>
      <ScrollView>
        <View style={{ width: "100%", height: 8, backgroundColor: "#ccc" }} />

        {Object.keys(groupedData).map((char, index) => (
          <View key={index}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
              {char}
            </Text>
            {groupedData[char].map((item, itemIndex) => (
              //các item(người dùng)
              <TouchableOpacity
                key={itemIndex}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 15,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 50 / 2,
                      marginRight: 15,
                    }}
                    source={{
                      uri: users.find(
                        (user) => "0" + user.number.slice(3) === item.number.replace(/\s/g, "")
                      )?.avatar,
                    }}
                  />

                  <View>
                    <Text style={{ fontSize: 19, fontWeight: "400" }}>
                      {FormatTenQuaDai(item.nameDanhBa, 19)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "400",
                        color: "#767A7F",
                      }}
                    >
                      Tên zola:{" "}
                      {
                        users.find(
                          (user) => "0" + user.number.slice(3) === item.number.replace(/\s/g, "")
                        )?.name
                      }
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {item.state === "accepted" ? (
                    <TouchableOpacity
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 50,
                        backgroundColor: "#E0FFFF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="phone" size={20} color="#006AF5" />
                    </TouchableOpacity>
                  ) : item.state === "nofriend" ||
                    item.state === "declined2" ? (
                    <TouchableOpacity
                      onPress={() => {
                        KetBan(item.userId);
                      }}
                      style={{
                        width: 85,
                        height: 35,
                        borderRadius: 15,
                        backgroundColor: "#E0FFFF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#006AF5",
                        }}
                      >
                        Kết bạn
                      </Text>
                    </TouchableOpacity>
                  ) : item.state === "pending2" ? (
                    <TouchableOpacity
                      onPress={() => {
                        DongY(item.userId);
                      }}
                      style={{
                        width: 85,
                        height: 35,
                        borderRadius: 15,
                        backgroundColor: "#E0FFFF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#006AF5",
                        }}
                      >
                        Đồng ý
                      </Text>
                    </TouchableOpacity>
                  ) : item.state === "pending1" ? (
                    <TouchableOpacity
                      onPress={() => {
                        ThuHoi(item.userId);
                      }}
                      style={{
                        width: 85,
                        height: 35,
                        borderRadius: 15,
                        backgroundColor: "#E0E0E0",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: "black",
                        }}
                      >
                        Thu hồi
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 85 }}></View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default DanhBaMay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  ViewTop: {
    width: "100%",
    height: 140,
    padding: 15,
    justifyContent: "space-around",
  },
});
