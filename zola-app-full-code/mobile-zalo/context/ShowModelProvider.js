import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";
import { Image, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { set } from "date-fns";
import Modal from "react-native-modal";
import axiosPrivate from "../api/axiosPrivate";
import AgoraUIKit from "agora-rn-uikit";
import { useCurrentUser } from "../App.js";
import { Audio } from 'expo-av';
export const ShowModelContext = createContext();

const ShowModelProvider = ({ children }) => {
  const [showReviverCall, setshowReviverCall] = useState(false);
  const [dataReviverCall, setDataReviverCall] = useState(null);
  const [showFriendRequestModelState, setFriendRequestShowModelState] =
    useState(false);
  const [dataFriendRequest, setDataFriendRequest] = useState(null);
  const { socket } = useSocket();
  //modal thông báo đã chấp nhật
  const [showAcceptedModelState, setAcceptedShowModelState] = useState(false);
  const [dataAccepted, setDataAccepted] = useState(null);
  const currentUser = useCurrentUser();
  const [caller, setCaller] = useState(null);
  const [sound, setSound] = useState();

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync( require('../assets/Nhac-chuong-ba-oi-co-dien-thoai-www_tiengdong_com.mp3')
    );
    await sound.playAsync();
    setSound(sound);

    console.log('Playing Sound');
    
  }
  
  // Hàm để dừng âm thanh
  async function stopSound() {
    if (sound) {
      console.log('Stopping Sound');
      await sound.stopAsync();
      console.log('Sound Stopped');
    }
  }
  //lắng nghe sự kiện nhận lời mời kết bạn
  useEffect(() => {
    if(socket) { 
      socket.on("receiveFriendRequest", (data) => {
        setDataFriendRequest(data);
      });
      socket.on("acceptFriendRequest", (data) => {
        setDataAccepted(data);
      });
      socket.on("receive-call", async (data) => {
        if (data.caller != currentUser.user.uid) {
          playSound()
          const user = await axiosPrivate(`/user/${data.caller}`);

          setCaller(user);
          console.log("data: ", data);
          setDataReviverCall(data);
        }
      });
      socket.on("end-call", (data) => {
        //   console.log("end call",data)
        //  setDataReviverCall(null);
        console.log("endđ");
        setVideoCallModelState(false);
        stopSound()
        setshowReviverCall(false);
      
      });
      socket.on("decline-call", (data) => {
        // console.log("decline call",data)
        // setDataReviverCall(null);
        setshowReviverCall(false);
      });
    }
  }, [socket]);

  //hiển thị model thông báo lời mời kết bạn
  useEffect(() => {
    if (dataFriendRequest) {
      setFriendRequestShowModelState(true);
      setTimeout(() => {
        setFriendRequestShowModelState(false);
      }, 4000);
    }
    if (dataAccepted) {
      setAcceptedShowModelState(true);
      setTimeout(() => {
        setAcceptedShowModelState(false);
      }, 4000);
    }
    if (dataReviverCall) {

      setshowReviverCall(true);
      setTimeout(async () => {
        setshowReviverCall(false);
        socket.emit("decline-call", { channel });
        stopSound()
      }, 10000);
    }
  }, [dataFriendRequest, dataAccepted, dataReviverCall]);

  async function ChapNhan(id) {
    try {
      await axiosPrivate.post(`/friendRequest/accept`, { friendRequestId: id });
      setFriendRequestShowModelState(false);
    } catch (error) {
      console.log(error);
    }
  }
  // hàm từ chối lời mời kết bạn
  async function TuChoi(id) {
    try {
      await axiosPrivate.post(`/friendRequest/decline`, {
        friendRequestId: id,
      });
      setFriendRequestShowModelState(false);
    } catch (error) {
      console.log(error);
    }
  }
  //model thông báo lời mời kết bạn
  const FriendRequestModel = ({ data }) => {
    return (
      <Modal
        isVisible={showFriendRequestModelState}
        onBackdropPress={() =>
          setFriendRequestShowModelState(!showFriendRequestModelState)
        }
        style={{ justifyContent: "flex-start", margin: 0 }}
        backdropOpacity={0.65}
        animationIn="slideInDown"
        animationOut="fadeInDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.ModalContainer}>
          <Image
            source={{ uri: data.avatar }}
            style={{ width: 62, height: 62, borderRadius: 50 }}
          />
          <View style={{ marginLeft: 10, gap: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold" }}>
              {data.name}{" "}
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                vừa gửi lời mời kết bạn!
              </Text>
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  TuChoi(data._id);
                }}
                style={styles.TuChoi}
              >
                <Text style={{ color: "black", fontSize: 16 }}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  ChapNhan(data._id);
                }}
                style={styles.ChapNhan}
              >
                <Text style={{ color: "#20B2AA", fontSize: 16 }}>
                  Chấp nhận
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  //model thông báo đã chấp nhận lời mời kb
  const AcceptedModel = ({ data }) => {
    return (
      <Modal
        isVisible={showAcceptedModelState}
        onBackdropPress={() =>
          setAcceptedShowModelState(!showAcceptedModelState)
        }
        style={{ justifyContent: "flex-start", margin: 0 }}
        backdropOpacity={0.65}
        animationIn="slideInDown"
        animationOut="fadeInDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.ModalContainer}>
          <Image
            source={{ uri: data.avatar }}
            style={{ width: 62, height: 62, borderRadius: 50 }}
          />
          <View style={{ marginLeft: 10, gap: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold" }}>
              {data.name}{" "}
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                đã chấp nhận lời mời kết bạn!
              </Text>
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  // TuChoi(data._id);
                  // how to navigate in conversation page from here
                }}
                style={styles.NhanTin}
              >
                <Text style={{ color: "white", fontSize: 16 }}>Nhắn tin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  // modal nhận cuộc gọi video

  //model thông báo có cuộc gọi đến
  const ReciverModal = ({ data }) => {
    return (
      <Modal
        isVisible={showReviverCall}
        // onBackdropPress={() =>
        //   setshowReviverCall(!showReviverCall)
        // }
        style={{ justifyContent: "flex-start", margin: 0 }}
        backdropOpacity={0.65}
        animationIn="slideInDown"
        animationOut="fadeInDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.ModalContainer}>
          <Image
            source={{ uri: caller.avatar }}
            style={{ width: 62, height: 62, borderRadius: 50 }}
          />
          <View style={{ marginLeft: 10, gap: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold" }}>
              {caller.name}{" "}
              <Text style={{ fontSize: 15, color: "#767A7F" }}>
                đang gọi bạn
              </Text>
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  ChapNhanCall(data.channel);
                  // how to navigate in conversation page from here
                }}
                style={styles.NhanTin}
              >
                <Text style={{ color: "white", fontSize: 16 }}>Chấp nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#006AF5",
                  width: 110,
                  height: 32,
                  borderRadius: 15,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  TuChoiCall(data.channel);
                }}
              >
                <Text style={{ color: "red", fontSize: 16 }}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  // function chap nhan cuoc goi
  function ChapNhanCall(channel) {
    setChanel(channel);
    setVideoCallModelState(true);
    setshowReviverCall(false);
    stopSound()
  }
  // function từ chối cuoc goi
  function TuChoiCall(channel) {
    stopSound()
    socket.emit("end-call", { channel });
    setshowReviverCall(false);
   
  }
  // modal call video
  const [showVideoCallModelState, setVideoCallModelState] = useState(false);
  const [channel, setChanel] = useState("");

  const CallVideoModel = ({ data }) => {
    const connectionData = {
      appId: "5a55004d2d524938a0edde0ecd2349ae",
      channel: channel,
    };
    const callbacks = {
      EndCall: () => {
        socket.emit("end-call", { channel });
        setVideoCallModelState(false);
      },
    };
    return (
      <View style={styles.container}>
        <AgoraUIKit connectionData={connectionData} rtcCallbacks={callbacks} />
      </View>
    );
  };
  return (
    <ShowModelContext.Provider value={{}}>
      {showVideoCallModelState ? (
        <CallVideoModel data={dataFriendRequest} />
      ) : (
        <>
          {showFriendRequestModelState && (
            <FriendRequestModel data={dataFriendRequest} />
          )}
          {showAcceptedModelState && <AcceptedModel data={dataAccepted} />}
          {showReviverCall && <ReciverModal data={dataReviverCall} />}
          {children}
        </>
      )}
    </ShowModelContext.Provider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D6D9DC",
  },
  ModalContainerVideoCall: {
    width: "100%",
    height: "100%",
  },
  ModalContainer: {
    backgroundColor: "white",
    padding: 12,
    gap: 12,
    flexDirection: "row",
  },
  TuChoi: {
    backgroundColor: "#E0E0E0",
    width: 110,
    height: 32,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  NhanTin: {
    backgroundColor: "#006AF5",
    width: 110,
    height: 32,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  ChapNhan: {
    marginLeft: 12,
    backgroundColor: "#F0F9FC",
    width: 110,
    height: 32,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ShowModelProvider;
export const useShowModel = () => useContext(ShowModelContext);
