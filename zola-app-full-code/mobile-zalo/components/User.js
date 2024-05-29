import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { SimpleLineIcons, Entypo, AntDesign } from "@expo/vector-icons";
import { getAuth, signOut } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCurrentUser } from "../App";
import { useNavigation } from "@react-navigation/native";
import axiosPrivate from "../api/axiosPrivate.js";
const auth = getAuth();
export default function User() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  // lấy thông tin user hiện tại từ context
  const currentUser = useCurrentUser();
  // lấy thông tin user từ api
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    try {
      const uid = currentUser.user.uid;
      const user = await axiosPrivate(`/user/${uid}`);
      setUser(user);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };
  function ChangePass() {
    navigation.navigate("ChangePassword");
  }
  return (
    <View style={styles.container}>
      <View style={styles.ViewTop}>
        <TouchableOpacity
          onPress={() => navigation.navigate("UserInformation")}
          style={{
            width: "100%",
            height: "100%",
            padding: 12,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", gap: 15 }}>
            <Image
              source={{ uri: user?.avatar }}
              style={{ width: 50, height: 50, borderRadius: 50 }}
            />
            <View>
              <Text style={{ fontSize: 18 }}>{user?.name}</Text>
              <Text style={{ fontSize: 15 }}>Xem trang cá nhân </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons
              name="account-sync-outline"
              size={34}
              color="#006AF5"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
      <View style={styles.ViewBottom}>
        <TouchableOpacity style={styles.Item}>
          <Ionicons name="musical-notes-outline" size={29} color="#006AF5" />
          <View style={styles.ViewChu}>
            <View style={{}}>
              <Text style={{ fontSize: 18 }}>Nhạc chờ Zola</Text>
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                Đăng ký nhạc chờ, thể hiện cá tính
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Item}>
          <SimpleLineIcons name="wallet" size={29} color="#006AF5" />
          <View style={styles.ViewChu}>
            <View style={{}}>
              <Text style={{ fontSize: 18 }}>Ví QR</Text>
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                Lưu trữ và xuất trình các mã QR quan trọng
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Item}>
          <Entypo name="icloud" size={29} color="#006AF5" />
          <View style={styles.ViewChu}>
            <View style={{}}>
              <Text style={{ fontSize: 18 }}>Cloud của tôi</Text>
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                Lưu trữ các tin nhắn quan trọng
              </Text>
            </View>
            <TouchableOpacity
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <MaterialIcons name="navigate-next" size={29} color="#B9BDC1" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Item}>
          <Entypo name="cycle" size={29} color="#006AF5" />
          <View style={styles.ViewChu}>
            <View style={{}}>
              <Text style={{ fontSize: 18 }}>Dung lượng và dữ liệu</Text>
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                Quản lý dữ liệu Zola của bạn
              </Text>
            </View>
            <TouchableOpacity
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <MaterialIcons name="navigate-next" size={29} color="#B9BDC1" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.Item, { height: 50 }]}>
          <MaterialCommunityIcons
            name="shield-star-outline"
            size={29}
            color="#006AF5"
          />
          <View style={styles.ViewChu}>
            <View style={{}}>
              <Text style={{ fontSize: 18 }}>Tài khoản và bảo mật</Text>
            </View>
            <TouchableOpacity
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <MaterialIcons name="navigate-next" size={29} color="#B9BDC1" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.Item, { height: 50 }]}>
          <AntDesign name="lock" size={29} color="#006AF5" />
          <View style={styles.ViewChu}>
            <View style={{}}>
              <Text style={{ fontSize: 18 }}>Quyền riêng tư</Text>
            </View>
            <TouchableOpacity
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <MaterialIcons name="navigate-next" size={29} color="#B9BDC1" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", gap: 15 }}>
        <Button title=" Đổi mật khẩu " onPress={ChangePass} />
        <Button title=" đăng xuất" onPress={() => signOut(auth)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#D6D9DC",
    gap: 10,
  },
  ViewTop: {
    width: "100%",
    height: 80,
    backgroundColor: "#E9EBED",
    justifyContent: "center",
    alignItems: "center",
  },
  ViewBottom: {
    width: "100%",
    height: "75%",
    padding: 12,
    backgroundColor: "#E9EBED",
    alignItems: "center",
  },
  Item: {
    width: "100%",
    height: 75,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ViewChu: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    width: "85%",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBlockColor: "#B9BDC1",
    paddingBottom: 11,
  },
});
