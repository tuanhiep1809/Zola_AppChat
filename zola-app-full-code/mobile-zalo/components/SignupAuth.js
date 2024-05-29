import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { firebaseConfig } from "../config/firebase.js";
import firebase from "firebase/compat/app";
import axiosPrivate from "../api/axiosPrivate";
import { REACT_APP_API_URL } from "@env";

export default function App({ navigation, route }) {
  //verificationCode: mã xác thực gồm 6 ký tự
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [isEnterCode, setIsEnterCode] = useState(false);
  useEffect(() => {
    let intervalId;
    if (timer > 0) {
      
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timer]);
  // kiểm tra mã xác thực có đủ 6 ký tự không
  useEffect(() => {
    if (verificationCode.length === 6) {
      setIsEnterCode(true);
    } else {
      setIsEnterCode(false);
    }
  }, [verificationCode.length]);

  const handleResend = () => {
    senVerification();
    setTimer(60);
    setVerificationCode("");
  };

  const phoneNumber = route.params.callingCode + route.params.SDT;
  const [verificationId, setVerificationId] = useState(null);
  const recaptchaVerifier = useRef(null);

  const senVerification = () => {
    let phoneProvider = new firebase.auth.PhoneAuthProvider();
    // console.log(phoneNumber);
    phoneProvider
      .verifyPhoneNumber(phoneNumber, recaptchaVerifier.current,{
        // timeout: 120000,
      })
      .then((verificationId) => {
        setVerificationId(verificationId);
        // setTimeout(() => {
        //   setVerificationId(null); // Vô hiệu hóa mã OTP
        // }, 60000); // 1 phút = 60.000 milliseconds
      })
      .catch((error) => {
        console.log("Error sending OTP:", error);
      });
  };

  useEffect(() => {
    senVerification();
  }, []);

  const name = route.params.name;
  const password = route.params.password;
  const number = route.params.SDT;

  const linkEmailCredential = () => {
    const emailCredential = firebase.auth.EmailAuthProvider.credential(
      phoneNumber + "@gmail.com",
      password
    );

    firebase
      .auth()
      .currentUser.linkWithCredential(emailCredential)
      .then((linkedUserCredential) => {
        // const linkedUser = linkedUserCredential.user;
        // console.log("Tài khoản đã được liên kết thành công:", linkedUser);
      })
      .catch((error) => {
        console.error("Lỗi khi liên kết tài khoản:", error);
      });
  };

  const handleContinue = () => {
    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    firebase.auth().signInWithCredential(credential).then(async (result) => {
      await linkEmailCredential();
      try {
        const dataUser = {
          name: name,
          number:phoneNumber,
          _id: result.user.uid,
          avatar:'https://firebasestorage.googleapis.com/v0/b/zalo-78227.appspot.com/o/avatarDefault.jpg?alt=media&token=2b2922bb-ada3-4000-b5f7-6d97ff87becd'
        };
        await axiosPrivate.post('/auth/register', dataUser);
      } catch (err) {
        setErrorCode("Mã OTP không đúng, vui lòng kiểm tra lại.");
      }
    }).catch((err) => {
      // console.log(err);
      setErrorCode("Mã OTP không đúng, vui lòng kiểm tra lại.");
    });
  };
  const [errorCode, setErrorCode] = useState("");
  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
      <View style={styles.ViewTop}>
        <Text>Vui lòng không chia sẻ mã xác thực để tránh mất tài khoản</Text>
      </View>
      <View style={styles.ViewBottom}>
        <View
          style={{
            width: 66,
            height: 66,
            borderWidth: 1,
            borderColor: "gray",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 100,
          }}
        >
          <FontAwesome5 name="sms" size={49} color="green" />
        </View>
        <Text style={{ fontSize: 17, marginTop: 10, fontWeight: 700 }}>
          Đang gửi mã OTP đến số {"("}
          {route.params.callingCode}
          {") "}
          {route.params.SDT}{" "}
        </Text>
        <Text style={{ fontSize: 16, marginTop: 10, fontWeight: 300, textAlign:'center' }}>
          Vui lòng nhập mã xác thực{" "} có hiệu lực trong vòng 2 phút
        </Text>
        <View style={styles.verificationContainer}>
          <TextInput
            style={styles.input}
            placeholder="•  •  •  •  •  •"
            maxLength={6}
            keyboardType="numeric"
            value={verificationCode}
            onChangeText={(text) => setVerificationCode(text)}
          />
        </View>
        <Text
          style={{ fontSize: 16, marginTop: 10, fontWeight: 500, color: "red" }}
        >
          {errorCode}
        </Text>
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          {timer > 0 ? (
            <Text style={{ fontSize: 18, color: "gray" }}>
              Gửi lại mã ({timer}s)
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={{ fontSize: 18, color: "blue" }}> Gửi lại mã</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={{
            borderRadius: 50,
            width: 150,
            height: 50,
            backgroundColor: isEnterCode ? "blue" : "gray",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
          disabled={!isEnterCode}
          onPress={handleContinue}
        >
          <Text style={{ fontSize: 18, color: "white", fontWeight: 700 }}>
            Tiếp tục
          </Text>
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
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
  ViewBottom: {
    width: "100%",
    padding: 20,
    alignItems: "center",
  },
  verificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 27,
  },
  input: {
    width: 120,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginHorizontal: 5,
    fontSize: 24,
    textAlign: "center",
  },
});
