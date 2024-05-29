import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  AntDesign,
  SimpleLineIcons,
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
  Entypo,
  Ionicons,
} from "@expo/vector-icons";
import Messages from "./Messages";
import Contacts from "./Contacts";
import Discovery from "./Discovery";
import Timeline from "./Timeline";
import User from "./User";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Button,
  Modal,
} from "react-native";
import { useEffect, useState } from "react";

const Tab = createBottomTabNavigator();

export default function MyTabs({ navigation, route }) {


  const [modalVisible, setModalVisible] = useState(false);
  





  // Define your custom header components
  useEffect(() => {
    if (route.params?.updatePassword) {
      setModalVisible(true);
    }
  }, [route.params?.updatePassword]);
  const renderSearchIcon = () => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Search");
      }}
      style={{ flexDirection: "row", height: 30, alignItems: "center" }}
    >
      <Feather name="search" size={28} color="white" />
      <Text
        style={{
          color: "#B9BDC1",
          marginLeft: 20,
          fontSize: 18,
          fontWeight: 500,
        }}
      >
        Tìm kiếm
      </Text>
    </TouchableOpacity>
  );
  const renderQRIcon = () => (
    <TouchableOpacity onPress={() => {
      // navigation.navigate("QRCode");
    }}>
      <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />

    </TouchableOpacity>
  );
  const renderPlusIcon = () => (
    <TouchableOpacity
      onPress={() => {
        console.log("Plus icon pressed");

      }}
    >
      <Feather name="plus" size={34} color="white" />
    </TouchableOpacity>
  );
  const renderAddUserIcon = () => (
    <Entypo name="add-user" size={24} color="white" />
  );
  const renderNoteIcon = () => (
    <SimpleLineIcons name="note" size={24} color="white" />
  );
  const renderBellIcon = () => (
    <SimpleLineIcons name="bell" size={24} color="white" />
  );
  const renderSettingIcon = () => (
    <Ionicons name="settings-outline" size={24} color="white" />
  );

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          headerShown: false,
          headerTitle: "",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
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
                      Đổi mật khẩu thành công!
                    </Text>
                    <Button
                      title="OK"
                      onPress={() => {
                        setModalVisible(false);
                      }}
                    />
                  </View>
                </View>
              </Modal>
              {renderQRIcon()}
              <View style={{ marginRight: 20 }} />
              {renderPlusIcon()}
              <Modal
                isVisible={modalCreateGroupVisible}
                onBackdropPress={toggleCreateGroupModal}
                style={{
                  // position:'absolute',
                  top: 180,
                  left: 20
                }}
                backdropOpacity={0.65}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={600}
                backdropTransitionOutTiming={600}
                hideModalContentWhileAnimating={true}
              >
                <Text>hello bấcncsjajca</Text>
              </Modal>
            </View>
          ),
          headerLeft: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              <View style={{ marginLeft: 20 }} />
              {renderSearchIcon()}
            </View>
          ),
          headerStyle: {
            backgroundColor: "#0895FB",
          },
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="message1" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Contacts"
        component={Contacts}
        options={{
          headerTitle: "",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              {renderAddUserIcon()}
            </View>
          ),
          headerLeft: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              <View style={{ marginLeft: 20 }} />
              {renderSearchIcon()}
            </View>
          ),
          headerStyle: {
            backgroundColor: "#0895FB",
          },
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="contacts" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Discovery"
        component={Discovery}
        options={{
          headerTitle: "",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              {renderQRIcon()}
            </View>
          ),
          headerLeft: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              <View style={{ marginLeft: 20 }} />
              {renderSearchIcon()}
            </View>
          ),
          headerStyle: {
            backgroundColor: "#0895FB",
          },
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="appstore-o" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={Timeline}
        options={{
          headerTitle: "",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              {renderNoteIcon()}
              <View style={{ marginRight: 20 }} />
              {renderBellIcon()}
            </View>
          ),
          headerLeft: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              <View style={{ marginLeft: 20 }} />
              {renderSearchIcon()}
            </View>
          ),
          headerStyle: {
            backgroundColor: "#0895FB",
          },
          tabBarIcon: ({ color, size }) => (
            <SimpleLineIcons name="clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={User}
        options={{
          headerTitle: "",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              {renderSettingIcon()}
            </View>
          ),
          headerLeft: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              <View style={{ marginLeft: 20 }} />
              {renderSearchIcon()}
            </View>
          ),
          headerStyle: {
            backgroundColor: "#0895FB",
          },
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
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