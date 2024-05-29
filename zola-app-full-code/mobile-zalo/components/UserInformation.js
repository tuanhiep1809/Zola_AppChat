import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axiosPrivate from "../api/axiosPrivate.js";
import { useCurrentUser } from "../App";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { set } from "date-fns";

export default function User() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const currentUser = useCurrentUser();
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
  // conver ngày sinh từ mongo về dd/MM/yyyy
  function convertDateOfBirth(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const [isModalVisibleAVT, setModalVisibleAVT] = useState(false);
  const toggleModalAVT = () => {
    setModalVisibleAVT(!isModalVisibleAVT);
  };
  const [isModalVisibleBia, setModalVisibleBia] = useState(false);
  const toggleModalBia = () => {
    setModalVisibleBia(!isModalVisibleBia);
  };

  // chọn ảnh avatar từ thư viện
  async function HandelChonAVTTuThuVien() {
    toggleModalAVT();
    await pickImage();
  }
  // chọn ảnh avatar mới
  function HandelChonAVTNew() {
    console.log("Chụp ảnh mới");
  }
  const [formData, setFormData] = React.useState(null);
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
      console.log("formData2  ", formData2._parts[0][1]);
      await axiosPrivate.patch(`/user/${user._id}/updateAvatar`, formData2, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      await fetchUserData();
      console.log("ok");
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleModalBia}
        activeOpacity={0.95}
        style={styles.ViewAnhBia}
      >
        <Image
          source={require("../assets/hinh-2-597.jpg")}
          style={{ width: "100%", height: "100%" }}
        />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: "absolute", top: 20, left: 20 }}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.ViewAVTName}>
          <TouchableOpacity onPress={toggleModalAVT} activeOpacity={0.95}>
            <Image
              source={{ uri: user?.avatar }}
              style={{ width: 54, height: 54, borderRadius: 50 }}
            />
          </TouchableOpacity>

          <Text style={{ fontSize: 21, color: "white" }}>{user?.name}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.ViewTTCN}>
        <Text style={{ fontWeight: 500, fontSize: 17 }}>Thông tin cá nhân</Text>
        <View style={styles.Item}>
          <Text style={{ fontSize: 17 }}>Giới tính:</Text>
          <Text style={{ fontSize: 17, width: "70%" }}>
            {user?.gender
              ? user?.gender == "male"
                ? "Nam"
                : user?.gender == "female"
                ? "Nữ"
                : user?.gender
              : "?"}
          </Text>
        </View>
        <View style={styles.Item}>
          <Text style={{ fontSize: 17 }}>Ngày sinh:</Text>
          <Text style={{ fontSize: 17, width: "70%" }}>
            {user?.dateOfBirth ? convertDateOfBirth(user?.dateOfBirth) : "?"}
          </Text>
        </View>
        <View style={[styles.Item, { borderBottomWidth: null, height: 53 }]}>
          <Text style={{ fontSize: 17 }}>Điện thoại:</Text>
          <View style={{ width: "70%", paddingTop: 20 }}>
            <Text style={{ fontSize: 17 }}>
              {user?.number ? user?.number : "?"}
            </Text>
            <Text style={{ fontSize: 14, color: "#767A7F" }}>
              Số điện thoại chỉ hiển thị với người có lưu số bạn trong danh bạ
              máy
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            marginTop: 20,
            width: "99%",
            height: 30,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#D6D9DC",
            flexDirection: "row",
            gap: 5,
            borderRadius: 15,
          }}
          onPress={() => {
            navigation.navigate("AddInfoUser");
          }}
          activeOpacity={0.8}
        >
          <AntDesign name="edit" size={23} color="black" />
          <Text style={{ fontSize: 15, color: "black", fontWeight: 500 }}>
            Chỉnh sửa thông tin cá nhân
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={isModalVisibleAVT}
        onBackdropPress={toggleModalAVT}
        style={styles.modal}
        backdropOpacity={0.65}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 17, color: "#03316D", fontWeight: 500 }}>
            Ảnh đại diện
          </Text>
          <TouchableOpacity
            onPress={HandelChonAVTTuThuVien}
            style={styles.modalItem}
          >
            <Feather name="image" size={24} color="black" />
            <Text style={styles.modalText}>Chọn ảnh từ thư viện</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={HandelChonAVTNew} style={styles.modalItem}>
            <Feather name="camera" size={24} color="black" />
            <Text style={styles.modalText}>Chụp ảnh mới</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Modal bìa */}
      <Modal
        isVisible={isModalVisibleBia}
        onBackdropPress={toggleModalBia}
        style={styles.modal}
        backdropOpacity={0.65}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 17, color: "#03316D", fontWeight: 500 }}>
            Ảnh bìa
          </Text>
          <TouchableOpacity style={styles.modalItem}>
            <Feather name="image" size={24} color="black" />
            <Text style={styles.modalText}>Chọn ảnh từ thư viện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalItem}>
            <Feather name="camera" size={24} color="black" />
            <Text style={styles.modalText}>Chụp ảnh mới</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#D6D9DC",
  },
  ViewAnhBia: {
    width: "100%",
    height: "28%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  ViewAVTName: {
    width: "50%",
    height: 60,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    position: "absolute",
    top: "70%",
    left: 20,
  },
  ViewTTCN: {
    gap: 5,
    width: "100%",
    height: "35%",
    backgroundColor: "#E9EBED",
    padding: 10,
  },
  Item: {
    width: "100%",
    height: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#B9BDC1",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    gap: 12,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  modalText: {
    fontSize: 18,
  },
});
