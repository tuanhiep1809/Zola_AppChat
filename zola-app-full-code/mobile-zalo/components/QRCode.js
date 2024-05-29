import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  Button,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
// import { BarCodeScanner } from "expo-barcode-scanner";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
export default function SwiperComponent({ navigation }) {
  // const [hasPermission, setHasPermission] = useState(null);
  // const [scanned, setScanned] = useState(false);
  // const [text, setText] = useState("Không tìm thấy mã QA nào");

  // const askForCameraPermission = () => {
  //   (async () => {
  //     const { status } = await BarCodeScanner.requestPermissionsAsync();
  //     setHasPermission(status === "granted");
  //   })();
  // };

  // // Request Camera Permission
  // useEffect(() => {
  //   askForCameraPermission();
  // }, []);

  // // What happens when we scan the bar code
  // const handleBarCodeScanned = ({ type, data }) => {
  //   setScanned(true);
  //   setText(data);
  //   console.log("Type: " + type + "\nData: " + data);
  // };

  // // Check permissions and return the screens
  // if (hasPermission === null) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>Requesting for camera permission</Text>
  //     </View>
  //   );
  // }
  // if (hasPermission === false) {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={{ margin: 10 }}>Không thể truy cập camera</Text>
  //       <Button
  //         title={"Cho phép"}
  //         onPress={() => askForCameraPermission()}
  //       />
  //     </View>
  //   );
  // }

  // Return the View
  return (
    <View style={styles.container}>
    <Text>
      aa
    </Text>
     {/* <View style={styles.barcodebox}>
        <TouchableOpacity
          style={{ position: "absolute", top: 14, left: 20, zIndex: 1 }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <MaterialIcons name="cancel" size={29} color="black" />
        </TouchableOpacity>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: "85%", width: "85%" }}
        />
        <Text style={styles.maintext}>{text}</Text>

        {scanned && (
          <Button
            title={"Scan again?"}
            onPress={() => {
              setText("Không tìm thấy mã QA nào");
              setScanned(false);
            }}
            color="tomato"
          />
        )}
      </View> */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    height: "100%",
    width: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: 30,
    // backgroundColor: 'tomato'
  },
});
