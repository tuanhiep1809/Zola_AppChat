import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";

import { Ionicons, AntDesign } from "@expo/vector-icons";
import CheckBox from "react-native-check-box";
import axiosPrivate from "../api/axiosPrivate";
import { useCurrentUser } from "../App";
import { FontAwesome } from "@expo/vector-icons";

export default function CreateGroup({ navigation, route }) {
  const currentUser = useCurrentUser();
  // danh sách friend
  const [data, setData] = useState([]);
  // mảng chọn
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);

  const [isSelected, setSelection] = useState(false);

  useEffect(() => {
    (async () => {
      const fetchData = async () => {
        try {
          const response = await axiosPrivate.get(
            `/friends/${currentUser.user.uid}`
          );
          setData(response);
          if (route.params?.id && response.length > 0) {
            const friendToSelect = response.find(friend => friend.userId == route.params.id);
            if (friendToSelect) {
              handleCheckboxToggle(friendToSelect.userId);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      // Gọi hàm fetch data khi component được render lại
      fetchData();
      // const response = await axiosPrivate.get(`/friends/${currentUser.user.uid}`);
      // setData(response);
      // console.log(response);
    })();
  }, []);
  // cap nhat so nguoi chọn
  useEffect(() => {
    // Cập nhật số lượng người đã chọn mỗi khi selectedIds thay đổi
    setSelectedCount(selectedIds.length);
  }, [selectedIds]);

  const handleCheckboxToggle = (userId) => {
    const newSelectedIds = selectedIds.includes(userId)
      ? selectedIds.filter((id) => id !== userId) // Bỏ chọn nếu đã chọn trước đó
      : [...selectedIds, userId]; // Chọn nếu chưa được chọn trước đó
    setSelectedIds(newSelectedIds);
  };

  const renderFriends = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          width: "100%",
          height: 50,
          flexDirection: "row",
          marginBottom: 10,
        }}
        onPress={() => {
          setSelection(!isSelected);
          handleCheckboxToggle(item.userId);
        }}
        key={item.userId}
      >
        <TouchableOpacity
          style={{
            width: "15%",
            height: 50,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckBox
            value={isSelected}
            isChecked={selectedIds.includes(item.userId)}
            onClick={() => {
              setSelection(!isSelected);
              handleCheckboxToggle(item.userId);
            }}
          />
        </TouchableOpacity>
        <View
          style={{
            width: "15%",
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: item.avatar }}
            style={{ width: 50, height: 50, borderRadius: 50 }}
          />
        </View>
        <View style={{ width: "70%", height: 50, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              width: "100%",
              marginLeft: 10,
            }}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const [groupName, setGroupName] = useState("");
  // hàm tạo nhóm
  async function handleCreateGroup() {
    let array = []
    selectedIds.forEach((id) => {
      array.push({ "_id": id });
    });
    const response = await axiosPrivate.post(`/group`, {
      name: groupName,
      members: array
    });
    console.log("response: ");
    console.log(response);
    navigation.navigate("Conversations", {
      conversationInfo: {
        ...response,
        conversationId: response._id,
      }
    });
  }
  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          height: 50,
          flexDirection: "row",
          borderBottomWidth: 0.5,
        }}
      >
        <TouchableOpacity
          style={{
            width: "15%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <View
          style={{ width: "85%", height: "100%", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800" }}>Chia sẻ</Text>
          <Text style={{ fontSize: 15, color: "gray" }}>
            Đã chọn: {selectedCount}
          </Text>
        </View>
      </View>
      <View style={{ width: "100%", height: 100, backgroundColor: "white" }}>
        <View style={{ width: "100%", height: 30 }}>
          <View
            style={{
              width: "95%",
              height: 30,
              backgroundColor: "#F7F7F7",
              marginLeft: "2.5%",
              marginTop: 10,
              borderRadius: 10,
              flexDirection: "row",
            }}
          >
            <View
              style={{
                width: "15%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AntDesign name="search1" size={20} color="black" />
            </View>
            <View style={{ width: "85%", height: "100%" }}>
              <TextInput placeholder="Tìm kiếm" />
            </View>
          </View>
        </View>
        <View
          style={{

            width: "90%",
            height: 25,
            marginLeft: "5%",
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "500" }}>Tạo nhóm</Text>
        </View>
        <TextInput
          value={groupName}
          onChangeText={(text) => setGroupName(text)}
          style={{
            paddingLeft: 10,
            width: "90%",
            height: 40,
            marginLeft: "5%",
            backgroundColor: "#F7F7F7",
            borderRadius: 10,
          }}
          placeholder="Đặt tên nhóm"
        />
      </View>
      <View
        style={{
          width: "100%",
          height: 600,
          backgroundColor: "white",
          marginTop: 15,
        }}
      >
        <View
          style={{
            width: "95%",
            height: "10%",
            marginLeft: "2.5%",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "500" }}>Bạn bè</Text>
        </View>
        <View style={{ width: "100%", height: "90%" }}>
          {data.map((item) => {
            return renderFriends({ item });
          })}
        </View>
      </View>
      {selectedCount > 1 && groupName.length != 0 ? (
        <View
          style={{ width: "100%", height: 80, position: "absolute", bottom: 0 }}
        >
          <TouchableOpacity
            style={{ width: "100%", height: "50%" }}
            onPress={() => {
              handleCreateGroup();
            }}
          >
            <FontAwesome
              name="send-o"
              size={32}
              color="blue"
              style={{ marginLeft: "80%" }}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{ width: "100%", height: 80, position: "absolute", bottom: 0 }}
        >
          <View style={{ width: "100%", height: "50%" }}>
            <FontAwesome
              name="send-o"
              size={32}
              color="gray"
              style={{ marginLeft: "80%" }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
