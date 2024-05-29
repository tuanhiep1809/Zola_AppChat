import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useState, createContext, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

import Login from "./components/Login";
import Home from "./components/Home";
import Signup from "./components/Signup";
import SignupSDT from "./components/SignupSDT";
import MyTabs from "./components/BottomTab";
import Conversations from "./components/Conversations";
import Contact from "./components/Contacts";
import SignupAuth from "./components/SignupAuth";
import Search from "./components/Search";
import AddInfoUser from "./components/AddInfoUser";
const Stack = createNativeStackNavigator();
const AuthenticatedUserContext = createContext({});
import { getAuth } from "firebase/auth";
import SocketProvider, { useSocket } from "./context/SocketProvider";
import ForgetPassword from "./components/ForgetPassword.js";
import UserInformation from "./components/UserInformation.js";
import ChangePassword from "./components/ChangePassword.js";
import ForgetPasswordOTP from "./components/ForgetPasswordOTP.js";
import QRCode from "./components/QRCode.js";
import FriendRequest from "./components/FriendRequest.js";
import ShowModelProvider, { useShowModel } from "./context/ShowModelProvider.js";
import ForwardMessage from "./components/ForwardMessage.js";
import DanhBaMay from "./components/DanhBaMay.js";
import CreateGroup from "./components/CreateGroup.js";
import OptionChat from "./components/OptionChat.js";
import ViewMember from "./components/ViewMember.js";
import AddMembers from './components/AddMembers.js';
import TranferAdmin from './components/TranferAdmin.js'
import BrowseMembers from './components/BrowseMembers.js'
// ...

const auth = getAuth();

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      <SocketProvider>
        <ShowModelProvider>
          {children}
        </ShowModelProvider>
      </SocketProvider>
    </AuthenticatedUserContext.Provider>
  );
};

function ChatStack() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator>
        <Stack.Screen
          name="MyTabs"
          component={MyTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TranferAdmin"
          component={TranferAdmin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddMembers"
          component={AddMembers}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewMember"
          component={ViewMember}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForwardMessage"
          component={ForwardMessage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddInfoUser"
          component={AddInfoUser}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={Search}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Conversations"
          component={Conversations}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="UserInformation"
          component={UserInformation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{
            headerShown: true,
            title: "Cập nhật mật khẩu",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="FriendRequest"
          component={FriendRequest}
          options={{
            headerShown: true,
            title: "Lời mời kết bạn",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="DanhBaMay"
          component={DanhBaMay}
          options={{
            headerShown: true,
            title: "Danh bạ máy",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="OptionChat"
          component={OptionChat}
          options={{
            headerShown: true,
            title: "Tùy chọn",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="QRCode"
          component={QRCode}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BrowseMembers"
          component={BrowseMembers}
          options={{
            headerShown: true,
            title: "Duyệt thành viên",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
            headerTintColor: "white",
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

function AuthStack() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="MyTabs"
          component={MyTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Conversations"
          component={Conversations}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Search"
          component={Search}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: true,
            title: "Đăng nhập",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
          }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{
            headerShown: true,
            title: "Tạo tài khoản",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
          }}
        />
        <Stack.Screen
          name="ForgetPassword"
          component={ForgetPassword}
          options={{
            headerShown: true,
            title: "Lấy lại mật khẩu",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
          }}
        />
        <Stack.Screen
          name="ForgetPasswordOTP"
          component={ForgetPasswordOTP}
          options={{
            headerShown: true,
            title: "Nhập mã xác thực",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
          }}
        />

        <Stack.Screen
          name="SignupSDT"
          component={SignupSDT}
          options={{
            headerShown: true,
            title: "Tạo tài khoản",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
          }}
        />
        <Stack.Screen
          name="SignupAuth"
          component={SignupAuth}
          options={{
            headerShown: true,
            title: "Nhập mã xác thực",
            headerStyle: {
              backgroundColor: "#00aaff",
            },
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      }
    );
    // unsubscribe auth listener on unmount
    return unsubscribeAuth;
  }, [user]);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <ChatStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}
export { AuthenticatedUserContext };
export const useCurrentUser = () => useContext(AuthenticatedUserContext);