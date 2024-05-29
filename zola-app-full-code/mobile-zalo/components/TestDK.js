import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import LottieView from "lottie-react-native";

export default function App({ navigation, route }) {
  const [isAnimation, setIsAnimation] = useState(true);

  useEffect(() => {
    const animationTimeout = setTimeout(() => {
      setIsAnimation(false);
    }, 3000);

    return () => {
      clearTimeout(animationTimeout);
    };
  }, []);

  const handlePressAnimation = () => {
    setIsAnimation(false);
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAnimation}
        onRequestClose={() => {
          setIsAnimation(!isAnimation);
        }}
      >
        <TouchableOpacity
          style={styles.modalContainerAnimation}
          onPress={handlePressAnimation}
          activeOpacity={1}
        >
          <View style={styles.modalContentAnimation}>
            {isAnimation && (
              <View style={{ width: "100%", height: "100%", alignItems: 'center' }}>
                <LottieView
                  style={{ width: 500, height: 500, position: 'absolute', zIndex: 1 }}
                  source={require("../Json/lottie.json")}
                  autoPlay
                  loop={false}
                />
                <View style={{zIndex: 2, marginTop: 90,height:200,alignItems:'center',justifyContent:'center'}}>
                <Text style={[styles.welcomeText,]}>Chào mừng {route.params?.name} !</Text>
                <Text style={[styles.welcomeText,]}>Đến với Zalo</Text>
                
                </View>
               
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContainerAnimation: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContentAnimation: {
    borderRadius: 10,
    width: "100%",
    height: "80%",
    padding: 10,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
