import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { SimpleLineIcons, Entypo, AntDesign } from "@expo/vector-icons";
import {
  getAuth,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCurrentUser } from "../App";
import { useNavigation } from "@react-navigation/native";
import axiosPrivate from "../api/axiosPrivate.js";
import { set } from "date-fns";
const auth = getAuth();
export default function User({ navigation }) {
  const [matKhauHienTai, setMatKhauHienTai] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [notification, setNotification] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFieldsFilled, setIsFieldsFilled] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    if (
      matKhauMoi.length != 0 &&
      matKhauHienTai.length != 0 &&
      xacNhanMatKhau.length != 0
    ) {
      setIsFieldsFilled(true);
    } else {
      setIsFieldsFilled(false);
    }
  }, [matKhauMoi.length, matKhauHienTai.length, xacNhanMatKhau.length]);
  // thông tin user hiện tại lưu trên firebase
  const user = auth.currentUser;
  console.log("usser", user);
  async function ChangePass() {
    const regexPass =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/])[A-Za-z\d!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/]{8,}$/;
    // Lấy thông tin xác thực từ email và mật khẩu hiện tại
    const credential = EmailAuthProvider.credential(user.email, matKhauHienTai);
    await reauthenticateWithCredential(user, credential)
      .then(() => {
        // Mật khẩu hiện tại trùng khớp, tiến hành cập nhật mật khẩu mới
        if (matKhauMoi.length >= 8) {
          if (regexPass.test(matKhauMoi)) {
            if (matKhauMoi !== xacNhanMatKhau) {
              setNotification("Mật khẩu không khớp");
            } else {
              setNotification("");
              updatePassword(user, matKhauMoi)
                .then(() => {
                  // Cập nhật mật khẩu thành công
                  console.log("Mật khẩu đã được cập nhật");
                  setNotification("Mật khẩu đã được cập nhật");
                  // Hiển thị modal thông báo
                  setModalVisible(true);
                  // Xóa trạng thái mật khẩu để người dùng nhập lại
                  setMatKhauHienTai("");
                  setMatKhauMoi("");
                  setXacNhanMatKhau("");
                })
                .catch((error) => {
                  // Xảy ra lỗi khi cập nhật mật khẩu
                  console.error("Lỗi khi cập nhật mật khẩu: ", error);
                  setNotification(error.message);
                });
            }
          } else {
            setNotification(
              "Mật khẩu phải chứa ít nhất 1 chữ hoa 1 chữ thường 1 số"
            );
          }
        } else {
          setNotification("Mật khẩu phải có ít nhất 8 ký tự");
        }
      })
      .catch((error) => {
        console.log("Lỗi khi xác thực người dùng: ", error);
        setNotification("Mật khẩu hiện tại không đúng");
      });
  }
  return (
    <View style={styles.container}>
      <View
        style={{
          width: "95%",
          height: 30,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: "500", color: "#0250B6" }}>
          Đổi mật khẩu
        </Text>
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Text style={{ fontSize: 17, color: "#767A7F" }}>
            {showPassword ? "Ẩn" : "Hiện"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 17, fontWeight: 500 }}>
        Mật khẩu hiện tại:<Text style={{ color: "red" }}> *</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mã mật khẩu hiện tại"
        placeholderTextColor="#635b5b"
        value={matKhauHienTai}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        onChangeText={(text) => setMatKhauHienTai(text)}
      />
      <Text style={{ fontSize: 17, fontWeight: 500 }}>
        Mật khẩu mới:<Text style={{ color: "red" }}> *</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu mới"
        placeholderTextColor="#635b5b"
        value={matKhauMoi}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        onChangeText={(text) => setMatKhauMoi(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu mới"
        placeholderTextColor="#635b5b"
        value={xacNhanMatKhau}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        onChangeText={(text) => setXacNhanMatKhau(text)}
      />
      <Text style={{ color: "red", marginBottom: 5 }}>{notification}</Text>
      <TouchableOpacity
        onPress={ChangePass}
        style={[
          styles.button,
          { backgroundColor: isFieldsFilled ? "blue" : "gray" },
        ]}
        disabled={!isFieldsFilled}
      >
        <Text
          style={{
            fontSize: 20,
            color: "white",
            fontWeight: 400,
            margin: "auto",
          }}
        >
          CẬP NHẬT
        </Text>
      </TouchableOpacity>

      {/* Modal hiển thị thông báo đổi mật khẩu thành công */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>
              Đổi mật khẩu thành công! Tài khoản sẽ đăng xuất để bảo mật
            </Text>
            <Button
              title="OK"
              onPress={() => {
                setModalVisible(false);
                signOut(auth)
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    padding: 17,
  },
  input: {
    height: 40,
    color: "#635b5b",
    fontSize: 18,
    width: "95%",
    marginBottom: 10,
    borderEndWidth: 1,
    borderEndColor: "#635b5b",
    borderBottomWidth: 1,
    borderColor: "#B9BDC1",
  },
  button: {
    width: "51%",
    height: 40,
    borderRadius: 20,
    marginLeft: "25%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
