import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import {
  Ionicons,
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import moment from "moment";
import axiosPrivate from "../api/axiosPrivate.js";
import { set } from "date-fns";
import { useCurrentUser } from "../App";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSocket } from "../context/SocketProvider.js";
import { useShowModel } from "../context/ShowModelProvider.js";
const Tab = createMaterialTopTabNavigator();
//hàm covert ngày tháng giờ phút gửi lời mời kết bạn
function covertTime(time) {
  const currentDateTime = moment();
  const duration = moment.duration(currentDateTime.diff(time));

  if (duration.asMinutes() < 60) {
    return `${Math.round(duration.asMinutes())} phút trước`;
  } else if (duration.asHours() < 24) {
    return `${Math.round(duration.asHours())} giờ trước`;
  } else {
    return `${Math.round(duration.asDays())} ngày trước`;
  }
}
function DaNhan({ navigation }) {
  const [dataDaNhan, setDataDaNhan] = useState([]);
  const [req, setReq] = useState(null);
  const [idFreindRequestCancel, setIdFreindRequestCancel] = useState(null);
  const currentUser = useCurrentUser();
  const { socket } = useSocket();
  useEffect(() => {
    if(socket) { 
      socket.on("receiveFriendRequest", (data) => {
        getReceivedFriendRequests();
        setReq(data);
      });
      socket.on("cancelFriendRequest", (data) => {
        getReceivedFriendRequests();
      });
    }
  }, [socket]);

  useEffect(() => {
    if (req) setDataDaNhan([...dataDaNhan, req]);
  }, [req]);

  useEffect(() => {
    getReceivedFriendRequests();
  }, []);
  // hàm lấy danh sách lời mời kết bạn đã nhận
  async function getReceivedFriendRequests() {
    try {
      const res = await axiosPrivate.get(
        `/friendRequest/received/${currentUser.user.uid}`
      );
      const sort = res.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setDataDaNhan(sort);
    } catch (error) {
      console.log(error);
    }
  }
  // hàm chấp nhận lời mời kết bạn
  async function ChapNhan(id) {
    try {
      await axiosPrivate.post(`/friendRequest/accept`, { friendRequestId: id });
      getReceivedFriendRequests();
    } catch (error) {
      console.log(error);
    }
  }
  // hàm từ chối lời mời kết bạn
  async function TuChoi(id) {
    try {
      await axiosPrivate.post(`/friendRequest/decline`, {
        friendRequestId: id,
      });
      getReceivedFriendRequests();
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={dataDaNhan}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              flexDirection: "row",
              padding: 7,
              width: "100%",
              height: 97,
              borderBottomWidth: 0.5,
            }}
          >
            <Image
              source={{ uri: item.avatar }}
              style={{ width: 62, height: 62, borderRadius: 50 }}
            />
            <View style={{ marginLeft: 10, gap: 4 }}>
              <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                {covertTime(item.createdAt)}
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    TuChoi(item._id);
                  }}
                  style={{
                    backgroundColor: "#E0E0E0",
                    width: 110,
                    height: 32,
                    borderRadius: 15,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "black", fontSize: 16 }}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    ChapNhan(item._id);
                  }}
                  style={{
                    backgroundColor: "#F0F9FC",
                    width: 110,
                    height: 32,
                    borderRadius: 15,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#20B2AA", fontSize: 16 }}>
                    Chấp nhận
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
function DaGui({ navigation }) {
  const currentUser = useCurrentUser();
  const [dataDaGui, setdataDaGui] = useState([]);
  const { socket } = useSocket();
  useEffect(() => {
    if(socket) { 
      console.log("socket.id");
      console.log(socket.id);
      socket.on("acceptFriendRequest", (data) => {
        getSentFriendRequests();
      });
    }
  }, [socket]);
  useEffect(() => {
    getSentFriendRequests();
  }, []);
  // hàm lấy danh sách lời mời kết bạn đã gửi
  async function getSentFriendRequests() {
    try {
      const res = await axiosPrivate.get(
        `/friendRequest/sent/${currentUser.user.uid}`
      );
      const sort = res.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setdataDaGui(sort);
    } catch (error) {
      console.log(error);
    }
  }
  // hàm thu hồi lời mời kết bạn
  async function ThuHoi(id) {
    try {
      await axiosPrivate.post(`/friendRequest/cancel`, { friendRequestId: id });
      getSentFriendRequests();
    } catch (error) {
      console.log(error);
    }
  }
  // console.log("dataDaGui",dataDaGui)
  return (
    <View style={styles.container}>
      <FlatList
        data={dataDaGui}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              flexDirection: "row",
              padding: 7,
              width: "100%",
              height: 97,
              borderBottomWidth: 0.5,
            }}
          >
            <Image
              source={{ uri: item.avatar }}
              style={{ width: 62, height: 62, borderRadius: 50 }}
            />
            <View style={{ marginLeft: 10, gap: 4, width: "50%" }}>
              <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                Tìm kiếm số điện thoại
              </Text>
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                {covertTime(item.createdAt)}
              </Text>
            </View>
            {item.state === "pending" ? (
              <TouchableOpacity
                onPress={() => {
                  ThuHoi(item._id);
                }}
                style={{
                  marginTop: 18,
                  backgroundColor: "#E0E0E0",
                  width: 110,
                  height: 32,
                  borderRadius: 15,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "black", fontSize: 16, fontWeight: 500 }}>
                  Thu hồi
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  marginTop: 18,
                  width: 110,
                  height: 32,
                  borderRadius: 15,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>Đã bị từ chối</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}
export default function User({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        tabBarItemStyle: { width: 130 },
      }}
    >
      <Tab.Screen name="Đã nhận" component={DaNhan} />
      <Tab.Screen name="Đã gửi" component={DaGui} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D6D9DC",
  },
});
