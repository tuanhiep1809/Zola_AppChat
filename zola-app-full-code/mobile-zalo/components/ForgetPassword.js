import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { firebaseConfig } from "../config/firebase.js";
import firebase from "firebase/compat/app";
import CountryPicker from "react-native-country-picker-modal";
import PhoneNumber from "libphonenumber-js";
import axiosPrivate from "../api/axiosPrivate.js";

export default function App({ navigation,route }) {
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sdt, setsdt] = useState(route.params?.sdt);
  const [isFieldsFilled, setIsFieldsFilled] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    if (
      matKhauMoi.length != 0 &&
      xacNhanMatKhau.length != 0 &&
      sdt.length != 0
    ) {
      setIsFieldsFilled(true);
    } else {
      setIsFieldsFilled(false);
    }
  }, [matKhauMoi.length, xacNhanMatKhau.length, sdt.length]);

  const [errorMessage, setErrorMessage] = useState("");
  const [isFocusedSdt, setIsFocusedSdt] = useState(false);
  // chọn quốc gia
  const [countryCode, setCountryCode] = useState("VN");
  const [callingCode, setCallingCode] = useState("+84");
  const handleCountryChange = (country) => {
    setCountryCode(country.cca2);
    setCallingCode("+" + country.callingCode.join(""));
  };
  async function TiepTuc() {
    const regexPass =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/])[A-Za-z\d!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/]{8,}$/;
    const phoneNumber = PhoneNumber.isPossibleNumber(sdt, countryCode);
    if (phoneNumber) {
      // bỏ số 0 ở đầu số điện thoại
      const formattedSDT = sdt.replace(/^0+/, "");
      // định dạng callingCode + SDT
      const PhoneNumberIsExist = callingCode + formattedSDT;
      // kiểm tra số điện thoại đã tồn tại chưa định dạng
      const response = await axiosPrivate(
        `/check/number/${PhoneNumberIsExist}`
      );
      if (response.numberExists) {
        if (matKhauMoi.length >= 8) {
          if (regexPass.test(matKhauMoi)) {
            if (matKhauMoi === xacNhanMatKhau) {
              navigation.navigate("ForgetPasswordOTP", {
                callingCode: callingCode,
                SDT: formattedSDT,
                mkMoi: matKhauMoi,
              });
              console.log("ok");
              setErrorMessage("");
            } else {
              setErrorMessage("Mật khẩu không khớp");
            }
          } else {
            setErrorMessage(
              "Mật khẩu phải chứa ít nhất 1 chữ hoa 1 chữ thường 1 số"
            );
          }
        } else {
          // đoạn này thêm regex để kiểm tra mật khẩu
          setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự");
        }
      } else {
        setErrorMessage("Số điện thoại chưa sử dụng Zola");
      }
    } else {
      setErrorMessage("Số điện thoại không hợp lệ cho quốc gia đã chọn");
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.ViewTop}>
        <Text>Vui lòng nhập số điện thoại để lấy lại mật khẩu</Text>
      </View>
      <View style={styles.ViewInput}>
        <View
          style={{
            width: "90%",
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            height: 50,
            borderBottomColor: isFocusedSdt ? "blue" : "gray",
          }}
        >
          <CountryPicker
            containerButtonStyle={{ marginTop: 0 }}
            withCallingCode
            withFilter
            withFlag
            onSelect={handleCountryChange}
            countryCode={countryCode}
          />
          <TextInput
            style={[styles.input]}
            placeholder="Số điện thoại"
            autoCapitalize="none"
            keyboardType="phone-pad"
            autoFocus={true}
            value={sdt}
            onFocus={() => setIsFocusedSdt(true)}
            onBlur={() => setIsFocusedSdt(false)}
            onChangeText={(text) => setsdt(text)}
          />
        </View>

        <View
          style={{
            width: "90%",
            height: 30,
            marginTop: 5,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: "500", color: "#0250B6" }}>
            Mật khẩu mới:<Text style={{ color: "red" }}> *</Text>
          </Text>
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={{ fontSize: 17, color: "#767A7F" }}>
              {showPassword ? "Ẩn" : "Hiện"}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.input,
            { borderBottomColor: "gray", borderBottomWidth: 1 },
          ]}
          placeholder="Nhập mật khẩu mới"
          placeholderTextColor="#635b5b"
          value={matKhauMoi}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          onChangeText={(text) => setMatKhauMoi(text)}
        />

        <TextInput
          style={[
            styles.input,
            { borderBottomColor: "gray", borderBottomWidth: 1 },
          ]}
          placeholder="Nhập lại mật khẩu mới"
          placeholderTextColor="#635b5b"
          value={xacNhanMatKhau}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          onChangeText={(text) => setXacNhanMatKhau(text)}
        />
      </View>

      <Text style={{ fontSize: 18, color: "red", marginLeft: 17 }}>
        {errorMessage}
      </Text>
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            TiepTuc();
          }}
          style={{
            borderRadius: 19,
            width: 100,
            height: 39,
            backgroundColor: isFieldsFilled ? "#006AF5" : "gray",
            justifyContent: "center",
            alignItems: "center",
          }}
          disabled={!isFieldsFilled}
        >
          <Text style={{ color: "white" }}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  ViewTop: {
    width: "100%",
    height: 50,
    backgroundColor: "#E9EBED",
    justifyContent: "center",
    alignItems: "center",
  },
  ViewInput: {
    width: "100%",
    height: 175,
    justifyContent: "center",
    alignItems: "center",
  },
  inputPass: {
    width: "90%",
    height: 50,
    fontSize: 19,
  },
  input: {
    width: "90%",
    height: 40,
    fontSize: 19,
  },
  ViewBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    bottom: 20,
    position: "absolute",
  },
});
