import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import axiosPrivate from "../api/axiosPrivate.js";
import { useFocusEffect } from "@react-navigation/native";
import { AuthenticatedUserContext } from "../App.js";
import { useNavigation } from "@react-navigation/native";

import * as Contacts from "expo-contacts";
import { set } from "date-fns";
const Tab = createMaterialTopTabNavigator();
//hàm cắt tên quá dài
function FormatTenQuaDai(text, maxLength) {
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + "..."
    : text;
}

function BanBe() {
  const navigation = useNavigation();

  const { user } = useContext(AuthenticatedUserContext);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    try {
      const users = await axiosPrivate(`/friends/${user.uid}`);
      // lọc ra những người dùng không phải là mình
      const new_User = users.filter((item) => item.number !== user.phoneNumber);
      setUsers(new_User);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };
  // Sắp xếp danh sách bạn bè theo tên (name)
  let sortedData = users.slice().sort((a, b) => a.name.localeCompare(b.name));

  // Tạo một đối tượng để nhóm các tên theo chữ cái
  let groupedData = {};
  sortedData.forEach((item) => {
    let firstChar = item.name.charAt(0).toUpperCase();
    if (!groupedData[firstChar]) {
      groupedData[firstChar] = [];
    }
    groupedData[firstChar].push(item);
  });
  // modal xóa bạn bè
  const [modalVisible, setModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const handleDelete = async () => {
    try {
      console.log("object", idDelete)
    await axiosPrivate.delete(`/friends/delete/${user.uid}`,{
      params:{ friendId:idDelete}
    }
    )
    fetchUserData()
    setModalVisible(false);
    setIdDelete(null);
    }
    catch (error) {
      console.log("Lỗi khi xóa bạn bè", error);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.ViewTop}>
          <TouchableOpacity
            onPress={() => navigation.navigate("FriendRequest")}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                backgroundColor: "#00aaff",
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="people-alt" size={23} color="white" />
            </View>
            <Text style={{ fontSize: 19, fontWeight: "400", marginLeft: 15 }}>
              Lời mời kết bạn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("DanhBaMay")}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                backgroundColor: "#00aaff",
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AntDesign name="contacts" size={24} color="white" />
            </View>
            <Text style={{ fontSize: 19, fontWeight: "400", marginLeft: 15 }}>
              Danh bạ máy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                backgroundColor: "#00aaff",
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome5 name="birthday-cake" size={23} color="white" />
            </View>
            <Text style={{ fontSize: 19, fontWeight: "400", marginLeft: 15 }}>
              Lịch sinh nhật
            </Text>
          </TouchableOpacity>
        </View>
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
                    source={{ uri: item.avatar }}
                  />
                  <Text style={{ fontSize: 19, fontWeight: "400" }}>
                    {FormatTenQuaDai(item.name, 19)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity style={{ marginLeft: 80 }}>
                    <Feather name="phone" size={24} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIdDelete(item.userId);
                      setModalVisible(true);
                    }}
                    style={{ marginLeft: 20, flexDirection: "row" }}
                  >
                    <AntDesign name="delete" size={26} color="red" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
      {/* modal xóa bạn */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn xóa bạn này không?
            </Text>
            <View style={styles.modalItem}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ backgroundColor: "red", padding: 10, borderRadius: 5 }}
              >
                <Text style={{ color: "white",fontSize:16 }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  backgroundColor: "green",
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: "white",fontSize:16 }}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function Contact() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        tabBarItemStyle: { width: 130 },
      }}
    >
      <Tab.Screen name="Bạn bè" component={BanBe} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  ViewTop: {
    width: "100%",
    height: 160,
    padding: 15,
    justifyContent: "space-around",
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalItem: {
    flexDirection: "row",
    gap:7,
    alignItems: "center",
    marginTop: 15,
    justifyContent: "space-around",
  },
  modalText: {
    fontSize: 17,
    marginBottom: 15,
    textAlign: "center",
  },
});
