import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  Button,
  TextInput,
} from "react-native";
import { Ionicons, Feather, AntDesign, FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import LottieView from "lottie-react-native";
import { format, parse, set } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import axiosPrivate from "../api/axiosPrivate";
import { useCurrentUser } from "../App";

export default function User({ navigation, route }) {
  const [isClickAVT, setIsClickAVT] = useState("male");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [user, setUser] = useState(null);
  const currentUser = useCurrentUser();
  useEffect(() => {
    fetchUserData();
  }, []);
  const fetchUserData = async () => {
    try {
      const uid = currentUser.user.uid;
      const user = await axiosPrivate(`/user/${uid}`);
      setUser(user);
      setImage(user.avatar);
      setNewName(user.name);
      if (user.dateOfBirth) {
        const dateOfBirth = new Date(user.dateOfBirth);
        setSelectedDate(dateOfBirth);
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };
  //hàm xử lý khi thay đổi ngày tháng năm
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };
  //hàm hiển thị datepicker
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };
  //hàm format ngày tháng năm
  const formattedDate = format(selectedDate, "dd/MM/yyyy");
  //hàm xử lý khi chọn ảnh đại diện
  const [image, setImage] = React.useState(null);
  const [Type, setType] = React.useState("");
  const [formData, setFormData] = React.useState(null);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      // allowsMultipleSelection:true
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
      type: 'image/png'
    });
    console.log("formData2", formData2._parts[0][1]);

    setType(result.uri.substring(result.uri.lastIndexOf(".") + 1));
    setImage(result.uri);
    setFormData(formData2);
  };
  const [newName, setNewName] = React.useState("");
  const HoanThanh = async () => {
    const dateObject = parse(formattedDate, "dd/MM/yyyy", new Date());
    // Chuyển đối tượng Date thành chuỗi định dạng MongoDB
    const formattedDateForMongoDB = format(
      dateObject,
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    );
    const UpdateUserData = {
      dateOfBirth: formattedDateForMongoDB,
      gender: isClickAVT,
      // avatar: image ? image : user?.avatar,
      name: newName,
    };
    await axiosPrivate.patch(`/user/${user._id}`, UpdateUserData);
    if (formData) {
      console.log("formData", formData._parts[0][1])
      await axiosPrivate.patch(`/user/${user._id}/updateAvatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: 'application/json',
        },
      });
    }
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.ViewTop}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontWeight: "600", fontSize: 19 }}>
          Ngày sinh và giới tính
        </Text>
      </View>
      <View style={styles.ViewAVT}>
        <Text style={{ fontSize: 17, fontWeight: "500" }}>
          Vui lòng chọn ảnh đại điện, nếu không có thể bỏ qua
        </Text>
        <Image
          style={{ width: 130, height: 130, borderRadius: 100 }}
          source={{ uri: image }}
        />
        <TouchableOpacity onPress={pickImage}>
          <Text style={{ fontSize: 18, fontWeight: "500", color: "#006AF5" }}>
            Chọn ảnh
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.GioiTinh}>
        <Text style={{ fontSize: 17, fontWeight: "500",marginBottom:7 }}>Tên mới</Text>
        <TextInput
        value={newName}
        onChangeText={setNewName}
          style={{ marginLeft:'10%', width: "80%",marginBottom:7 , height: 35, borderColor: 'gray', borderWidth: 1, borderRadius: 5, paddingLeft: 10, fontSize: 17, fontWeight: "400" }}
        placeholder="Nhập tên mới"
        />
        <Text style={{ fontSize: 17, fontWeight: "500" }}>Giới tính</Text>
        <View
          style={{
            width: "100%",
            height: "80%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <LottieView
              style={{
                width: 120,
                height: 120,
                alignItems: "center",
                justifyContent: "center",
              }}
              source={require("../Json/AvatarNam.json")}
              autoPlay
              loop={true}
            />
            <TouchableOpacity
              onPress={() => {
                setIsClickAVT("male");
              }}
              style={{
                width: 25,
                height: 25,
                borderRadius: 50,
                backgroundColor: isClickAVT === "male" ? "#006AF5" : "#B9BDC1",
              }}
            >
              {isClickAVT === "male" && (
                <AntDesign name="check" size={24} color="white" />
              )}
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "500" }}>Nam</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <LottieView
              style={{
                width: 120,
                height: 120,
                alignItems: "center",
                justifyContent: "center",
              }}
              source={require("../Json/AvataNu.json")}
              autoPlay
              loop={true}
            />
            <TouchableOpacity
              onPress={() => {
                setIsClickAVT("female");
              }}
              style={{
                width: 25,
                height: 25,
                borderRadius: 50,
                backgroundColor:
                  isClickAVT === "female" ? "#006AF5" : "#B9BDC1",
              }}
            >
              {isClickAVT === "female" && (
                <AntDesign name="check" size={24} color="white" />
              )}
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "500" }}>Nữ</Text>
          </View>
        </View>
      </View>
      <View style={styles.NgaySinh}>
        <Text style={{ fontSize: 17, fontWeight: "500" }}>Ngày sinh: </Text>
        <Text style={{ fontSize: 16, fontWeight: "400" }}>{formattedDate}</Text>
        <TouchableOpacity onPress={showDatePickerModal}>
          <FontAwesome5 name="birthday-cake" size={19} color="black" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}
      </View>
      <TouchableOpacity
        style={{
          borderRadius: 50,
          width: 150,
          height: 50,
          backgroundColor: "#006AF5",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 15,
          marginLeft: "25%",
        }}
        onPress={HoanThanh}
      >
        <Text style={{ fontSize: 18, color: "white", fontWeight: 700 }}>
          Hoàn thành
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9EBED",
    gap: 10,
  },
  ViewTop: {
    flexDirection: "row",
    width: "100%",
    height: 50,
    backgroundColor: "#006AF5",
    alignItems: "center",
    paddingLeft: 15,
    gap: 10,
  },
  ViewAVT: {
    width: "100%",
    height: 250,
    padding: 10,
    backgroundColor: "white",
    alignItems: "center",
    gap: 10,
  },
  GioiTinh: {
    width: "100%",
    height: 310,
    padding: 10,
    backgroundColor: "white",
  },
  NgaySinh: {
    width: "100%",
    height: 50,
    padding: 10,
    backgroundColor: "white",
    flexDirection: "row",
    gap: 10,
  },
});
