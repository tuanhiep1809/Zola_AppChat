import React, {
  useState,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from "react-native";
import { GiftedChat, Send, Bubble } from "react-native-gifted-chat";
import { InputToolbar } from "react-native-gifted-chat";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import axiosPrivate from "../api/axiosPrivate";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  AntDesign,
  SimpleLineIcons,
  Ionicons,
  Entypo,
  Octicons,
} from "@expo/vector-icons";
import combineUserId from "../utils/combineUserId";
import { useSocket } from "../context/SocketProvider";
import { useCurrentUser } from "../App";
import mime from "mime";
import Modal from "react-native-modal";
import AgoraUIKit from "agora-rn-uikit";
import * as DocumentPicker from "expo-document-picker";
import ChatApi from "../api/chatApi";

export default function Conversations({ route, navigation }) {

  // width và height của thiết bị
  const { widthOfDevice, heightOfDevice } = Dimensions.get("window");

  // dữ liệu giả
  const [messages, setMessages] = useState([]);

  const [isModalErrorFileSizeVisible, setIsModalErrorFileSizeVisible] = useState(false);

  // modal hiển thị khi có sự kiện onLongPress vào tin nhắn
  const [isModalVisible, setModalVisible] = useState(false);
  // modal xác nhận xóa tin nhắn
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);


  // theo dõi vị trí của tin nhắn, hình ảnh, video cần hiện modal
  const [messageLength, setMessageLength] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState("");

  // thong tin user tim kiem
  const searchUser = route.params?.searchUser;
  const [conversationInfo, setConversationInfo] = useState(route.params?.conversationInfo);
  
  // kiểm tra xem người  dùng có nhập chữ hay không
  const [isTyping, setIsTyping] = useState(false);
  // hiệu ứng dấu nháy trong phần tin nhắn
  const [isFocused, setIsFocused] = useState(false);
  const [conversation, setConversation] = useState({});
  const currentUser = useCurrentUser();
  const [chatReceived, setChatReceived] = useState(null);
  const [me, setMe] = useState(null);
  const { socket } = useSocket();
  const [deletedChatId, setDeletedChatId] = useState(null);

  // =======================socket=======================
  useEffect(() => {
    const user = axiosPrivate.get(`/user/${currentUser.user.uid}`);
    setMe(user);
  }, []);

  useEffect(() => {
    (async() => { 
      let convId = conversationInfo?.conversationId; 
      if(searchUser?.userId) {
          convId = combineUserId(currentUser.user.uid, searchUser.userId);
          const userConversations = await axiosPrivate(`/userConversations/${currentUser.user.uid}`);
          const convInfo = userConversations.conversations.find((conversation) => conversation.conversationId === convId);
          convInfo.conversationId = convId;
          setConversationInfo(convInfo);
      }
      socket.emit("joinRoom", convId);
    })()
  }, []);

  useEffect(() => {
    if(socket) { 
      socket.on("getMessage", (chat) => {
        if(chat.conversationId === conversationInfo?.conversationId)
          setChatReceived(chat);
      });
      socket.on("deleteMessage", (chatId) => {
        setDeletedChatId(chatId);
      });
    
    }
  }, [socket]);

  useEffect(() => {
    if (deletedChatId) {
      // console.log("deleted chat id: ", deletedChatId);
      // edit content of deletedChatId to "The message has been recalled!"
      const newMessages = messages.map((message) => {
        if (message._id === deletedChatId) {
          return {
            // ...message,
            _id: message._id,
            user: message.user,
            text: "The message has been recalled!",
            type: "deleted",
            createdAt: message.createdAt,
          };
        }
        return message;
      });
      setMessages(newMessages);
    }
  }, [deletedChatId]);

  useEffect(() => {
    if (chatReceived) {
      // console.log('chat received content:', chatReceived)
      const { text, video, image, file, images } = chatReceived.content;
      const { type } = chatReceived;

      const newMessage = {
        _id: chatReceived?._id || chatReceived.createdAt,
        ...(text && { text }),
        ...(image && { image }),
        ...(video && { video }),
        ...(file && { file }),
        ...(type && { type }),
        ...(images && images?.length > 0 && { images }),
        createdAt: new Date(chatReceived.createdAt),
        user: {
          _id: chatReceived.senderInfo._id,
          name: chatReceived.senderInfo.name,
          avatar: chatReceived.senderInfo.avatar,
        },
        sent: true,
      };
      console.log("newMessage:");
      console.log(newMessage);
      setMessages((previousMessages) => {
        if (newMessage.user._id !== currentUser.user.uid)
          return GiftedChat.append(previousMessages, newMessage);
        return GiftedChat.append(
          previousMessages.filter((mess) => mess.pending !== true),
          newMessage
        )
      }
      );
    }
  }, [chatReceived]);

  useEffect(() => {
    const conversationId = conversationInfo?.conversationId;
    (async () => {
      if (conversationId) {
        const chats = await axiosPrivate.get(`/chat/${conversationId}`);
        // console.log("chat sau khi lay api vee bang conversation id ==============================")
        const formattedMessages = chats.map((message) => {
          // console.log("chat received: ", message.content);
          const { text, video, image, file, images } = message.content;
          const { type } = message;

          return {
            _id: message._id,
            ...(text && { text }),
            ...(image && { image }),
            ...(video && { video }),
            ...(file && { file }),
            ...(type && { type }),
            ...(images && images?.length > 0 && { images }),
            createdAt: new Date(message.createdAt),
            user: {
              _id: message.senderInfo._id,
              name: message.senderInfo.name,
              avatar: message.senderInfo.avatar,
            },
            sent: true,
          };
        });
        setMessages(formattedMessages.reverse());
      }
    })();
  }, [conversationInfo]);

  useLayoutEffect(() => {
    const originalTitle = `${searchUser?.name || conversationInfo?.name || conversationInfo?.user.name
      }`; // Sau này đổi thành tên của người trong cùng cuộc hội thoại
    const maxTitleLength = 20; // Số ký tự tối đa bạn muốn hiển thị trước khi cắt
    // Tạo chuỗi tiêu đề được hiển thị (đảm bảo không vượt quá maxTitleLength)
    const displayedTitle =
      originalTitle.length > maxTitleLength
        ? `${originalTitle.slice(0, maxTitleLength - 3)}...`
        : originalTitle;


    navigation.setOptions({
      title: "", // Đổi tiêu đề
      headerStyle: {
        backgroundColor: '#0C8AFF', // Thay đổi màu nền của header
      },
      headerLeft: () => (
        <View style={{ width: 250, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
          <AntDesign name="left" size={24} color="white" onPress={() => navigation.navigate("Messages")} />
          <Text
            style={{
              marginLeft: 10,
              width: 215,
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fff',
              maxWidth: 215, // Giới hạn chiều rộng của Text
              overflow: 'hidden',
              //textOverflow: 'ellipsis', // Hiển thị dấu ba chấm khi vượt quá chiều rộng
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayedTitle}
          </Text>
        </View>
      ),
      headerRight: () => (
        <View style={{ width: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <SimpleLineIcons name="phone" size={24} color="white" />
          <Ionicons name="videocam-outline" size={28} color="white" />
          <TouchableOpacity
            onPress={() => navigation.navigate('OptionChat', {
              conversationInfo: conversationInfo,
              listMembers: conversationInfo?.members.filter(member => member._id !== currentUser.user.uid),
            })}
          >
            <AntDesign name="bars" size={28} color="white" />

          </TouchableOpacity>
        </View>
      )

    });
  }, [navigation, searchUser]);

  // ========================================Xử lí thu hồi tin nhắn

  // Thu hồi phía mình
  const deleteMessage = async () => {
    try {
      // console.log("message:", selectedMessage);
      console.log("id message:", selectedMessage._id);
      const response = await axiosPrivate.post(
        `/chat/deleteYourSide/${selectedMessage._id}`
      );
      console.log("Tin nhắn đã được xóa: ", response);
      setIsConfirmModalVisible(false);

      setMessages(
        messages.filter((message) => message._id !== selectedMessage._id)
      );
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
    }
  };

  // Thu cả 2 bên
  const unsendMessage = async () => {
    try {
      // console.log("message:", selectedMessage);
      console.log("id message:", selectedMessage._id);
      const response = await axiosPrivate.post(
        `/chat/delete/${selectedMessage._id}`
      );
      console.log("Tin nhắn đã thu hồi: ", response);
      setModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
    }
  };

  // video
  const videoRef = useRef(null);

  const onInputTextChanged = (text) => {
    setIsTyping(text.length > 0);
  };

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  // modal error when file size too large
  const toggleErrorFileSize = () => {
    setIsModalErrorFileSizeVisible(!isModalErrorFileSizeVisible);
  };

  // modal unsend message
  const toggleUnsendMessage = () => {
    setModalVisible(!isModalVisible);
  };

  // modal confirm unsend message

  const toggleConfirmUnsendMessage = () => {
    setIsConfirmModalVisible(!isConfirmModalVisible);
  };


  // Xu li onLongPress tin nhắn text

  const onMessageLongPress = (context, message) => {
    // console.log("on long press Message: ", message);
    setSelectedMessage(message);
    setMessageLength(message.text.length);
    setModalVisible(true);
  };
  // custom header


  // xử lí khi gửi dữ liệu 
  // send text
  const onSend = async (newMessages = []) => {
    console.log("newMessages onSend: ", newMessages);
    setMessages(previousMessages => GiftedChat.append(previousMessages, {
      ...newMessages[0],
      pending: true,
    }));
    const { text } = { ...newMessages[0] };

    // trường hợp chọn vào userConversation
    if (text) {
      let conversationId = conversationInfo?.conversationId;
      let dataChat = null
      if (conversationId) {
        // do nothing for now
        dataChat = {
          conversationId,
          senderId: currentUser.user.uid,
          content: { text },
        }
      } else if (searchUser?._id) {
        dataChat = {
          receiverId: searchUser._id,
          senderId: currentUser.user.uid,
          content: { text },
        }
      } else {
        console.log("bug!!!!");
        return; 
      }
      await ChatApi.sendChat(dataChat, socket); 
    }
  };
  // send video, image,
  const onSendMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [0, 0],
      quality: 1,
      multiple: true,
      allowsMultipleSelection: true,
    });

    console.log("ImagePicker result:", result);

    if (result.canceled) {
      return;
    }

    if (result.assets.length > 1) {
      const formData = new FormData();
      // send multiple images
      result.assets.forEach((item, index) => {
        formData.append("files", {
          uri: item.uri,
          name: item.uri.split("/").pop(),
          type: mime.getType(item.uri),
        });
      });
      if (formData) {
        axiosPrivate
          .post("/chat/Multifiles", formData, {
            params: {
              type: "images",
              senderId: currentUser.user.uid,
              conversationId: conversationInfo?.conversationId,
            },
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          })
          .then((res) => { })
          .catch((err) => {
            setIsModalErrorFileSizeVisible(true);
          });
      }
    } else {
      // Xử lí upload media lên AWS
      let localUri = result.uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);

      const formData = new FormData();

      formData.append("file", {
        uri: localUri,
        name: filename,
        type: mime.getType(localUri),
      });

      console.log("formData:");
      console.log(formData._parts[0][1]);

      if (formData) {
        axiosPrivate
          .post("/chat/files", formData, {
            params: {
              type: result.type,
              senderId: currentUser.user.uid,
              conversationId: conversationInfo?.conversationId,
            },
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          })
          .then((res) => { })
          .catch((err) => {
            setIsModalErrorFileSizeVisible(true);
          });
      }
    }

    // Xử lí chọn media và gửi ở gifted chat
    const selectedMedia = result.assets.map((item, index) => {
      const mediaType = item.type ? item.type.toLowerCase() : '';

      return {
        _id: messages.length + index + 1,
        type: mediaType, // Đảm bảo type là "video" khi gửi video
        [mediaType]: item.uri,
        createdAt: new Date(),
        user: {
          _id: currentUser.user.uid,
        },
      };
    });

    // console.log("Selected media:", selectedMedia);
    onSend(selectedMedia);
  };

  // Xu li onLongPress tin nhắn text


  const handleImageLongPress = (context, message) => {
    console.log("Bạn đã nhấn và giữ vào hình ảnh:", message);
    setSelectedMessage(message);
    // setModalImageVisible(true);
  };

  // custom header
  useLayoutEffect(() => {
    const originalTitle = `${
      searchUser?.name || conversationInfo?.name || conversationInfo?.user.name
    }`; // Sau này đổi thành tên của người trong cùng cuộc hội thoại
    const maxTitleLength = 20; // Số ký tự tối đa bạn muốn hiển thị trước khi cắt
    // Tạo chuỗi tiêu đề được hiển thị (đảm bảo không vượt quá maxTitleLength)
    const displayedTitle =
      originalTitle.length > maxTitleLength
        ? `${originalTitle.slice(0, maxTitleLength - 3)}...`
        : originalTitle;


        navigation.setOptions({
            title: "", // Đổi tiêu đề
            headerStyle: {
                backgroundColor: '#0C8AFF', // Thay đổi màu nền của header
            },
            headerLeft: () => (
                <View style={{ width: 250, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                    <AntDesign name="left" size={24} color="white" onPress={() => navigation.navigate("Messages")} />
                    <Text
                        style={{
                            marginLeft: 10,
                            width: 215,
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#fff',
                            maxWidth: 215, // Giới hạn chiều rộng của Text
                            overflow: 'hidden',
                            //textOverflow: 'ellipsis', // Hiển thị dấu ba chấm khi vượt quá chiều rộng
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {displayedTitle}
                    </Text>
                </View>
            ),
            headerRight: () => (
                <View style={{ width: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <SimpleLineIcons name="phone" size={24} color="white" />
                      <TouchableOpacity onPress={handleCallVideo}>
            <Ionicons name="videocam-outline" size={28} color="white" />
          </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                          if(conversationInfo.state === "deleted"){
                            return;
                          }else{
                            navigation.navigate('OptionChat', {
                              conversationInfo: conversationInfo,
                              listMembers: conversationInfo?.members?.filter(member => member._id !== currentUser.user.uid),
                            })
                          }
                         
                        }}
                    >
                        <AntDesign name="bars" size={28} color="white" />

                    </TouchableOpacity>
                </View>
            )

        });
    }, [navigation, searchUser]);
    // console.log("conversation: ");
    // console.log(conversation);

  // Gui tai lieu
  const pickDocument = async () => {
    try {
      const document = await DocumentPicker.getDocumentAsync();

      console.log("document: ", document.assets[0]);

      const formData = new FormData();
      formData.append("file", {
        uri: document.assets[0].uri,
        name: document.assets[0].name,
        type: mime.getType(document.assets[0].uri),
      });

      console.log("formData:");
      console.log(formData._parts[0][1]);

      if (formData) {
        axiosPrivate
          .post("/chat/files", formData, {
            params: {
              type: "file",
              senderId: currentUser.user.uid,
              conversationId: conversationInfo?.conversationId,
            },
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          })
          .then((res) => { })
          .catch((err) => {
            console.log("loi lon j z");
            console.log(err);
            setIsModalErrorFileSizeVisible(true);
          });
        console.log("up file thanh cong!");
      }

      const newMessage = {
        _id: Math.random().toString(),
        type: document.assets[0].mimeType,
        file: {
          name: document.assets[0].name,
          url: document.assets[0].uri,
          size: document.assets[0].size,
        },
        createdAt: new Date(),
        user: {
          _id: currentUser.user.uid,
        },
      };

      // setMessages(previousMessages => GiftedChat.append(previousMessages, newMessage));
      onSend([newMessage]);
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };


  // custom bóng chat
  const renderBubble = (props) => {
    const { file, type, images, image, text, video } = props.currentMessage;
    // console.log("images: ", images);
    // console.log("props of custom render mesage: ", props.currentMessage);
    const isCurrentUser = props.currentMessage.user._id === currentUser.user.uid;
    const fileTypeDocument = mime.getType(file?.url);


    if (images?.length > 0) {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              padding: 5,
              marginTop: 10,
              backgroundColor: '#52A0FF',
              borderColor: '#767A7F',
              borderWidth: 1,
            },
            left: {
              padding: 5,
              marginTop: 10,
              backgroundColor: '#fff',
              borderColor: '#767A7F',
              borderWidth: 1,
            },
          }}
          renderCustomView={() => {
            let imgs = images;
            if (imgs?.length > 0) {
              const maxWidth = imgs.length % 2 === 0 && imgs.length <= 4 ? 162 : 242;
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    maxWidth,
                  }}
                  onLongPress={() => {
                    console.log('mang anh:', imgs);
                  }}
                >
                  {imgs.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        width: 80,
                        height: 80,
                        // margin: 5,
                        // justifyContent: "center",
                        // alignItems: "center",
                      }}
                    >
                      <Image
                        source={{ uri: img.url }}
                        style={{ width: "95%", height: "95%", borderRadius: 10 }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </TouchableOpacity>
              )
            }
          }}
        />
      )
    }

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            padding: 5,
            backgroundColor: type === "deleted" ? "#B9BDC1" : '#0084FF',
          },
          left: {
            padding: 5,
            backgroundColor: type === "deleted" ? "#B9BDC1" : 'white',
          },
        }}

        renderMessageText={() => (
          <View style={{ paddingHorizontal: 10 }}>
            {text && <Text style={{ color: type === "deleted" ? "#000" : (isCurrentUser ? "#fff" : "#000") }}>
              {text}
            </Text>}
          </View>
        )}
        renderMessageVideo={() => (
          <View
            style={{
              width: 300,
              height: 300,
              overflow: "hidden",
              flexDirection: "row",
            }}
          >
            {props.currentMessage.user._id == currentUser.user.uid ? (
              <View style={{ width: '100%', height: 300 }}>
                <View
                  style={{
                    width: 300,
                    height: 300,
                    marginTop: '1%',
                    overflow: "hidden",
                    flexDirection: "row",
                    marginLeft: "3%",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: 30,
                      height: "100%",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      setSelectedMessage(props.currentMessage);
                      setModalVisible(true);
                    }}
                  >
                    <Entypo
                      name="dots-three-horizontal"
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>
                  <Video
                    ref={videoRef}
                    source={{ uri: video ? video : file?.url }}
                    style={{
                      width: 250,
                      height: 290,
                      backgroundColor: "#000",
                      borderRadius: 20,
                      paddingTop: 5,
                      paddingBottom: 5,
                    }}
                    resizeMode="cover"
                    useNativeControls
                    isLooping
                  />
                </View>
              </View>
            ) : (
              <View
                style={{
                  width: 300,
                  height: 300,
                  overflow: "hidden",
                  flexDirection: "row",
                  marginLeft: "2%",
                }}
              >
                <Video
                  ref={videoRef}
                  source={{ uri: video ? video : file?.url }}
                  style={{
                    width: 250,
                    height: 280,
                    backgroundColor: "#000",
                    borderRadius: 20,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}
                  resizeMode="cover"
                  useNativeControls
                  isLooping
                />
                <TouchableOpacity
                  style={{ width: 30, height: "100%", justifyContent: "center" }}
                  onPress={() => {
                    setSelectedMessage(props.currentMessage);
                    setModalVisible(true);
                  }}
                >
                  <Entypo name="dots-three-horizontal" size={24} color="black" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        renderMessageImage={() => (
          <TouchableOpacity
            style={{
              width: 280,
              height: 300,
            }}
            onLongPress={() => {
              setSelectedMessage(props.currentMessage);
              setModalVisible(true);
            }}
          >
            <Image
              source={{ uri: image }}
              style={{
                width: 280,
                height: "95%",
                borderRadius: 20,
                paddingTop: 5,
                paddingBottom: 5,
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        renderCustomView={() => {
          const icons = {
            "application/pdf": require("../assets/pdf-icon.png"),
            "application/msword": require("../assets/word-icon.png"),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": require("../assets/word-icon.png"),
            "application/vnd.ms-powerpoint": require("../assets/ppt-icon.png"),
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": require("../assets/ppt-icon.png"),
            "application/vnd.rar": require("../assets/rar-icon.png"),
            "application/zip": require("../assets/rar-icon.png"),
            "text/csv": require("../assets/csv-icon.png"),
          };
          // console.log("file:");
          // console.log(file);
          if (file?.url) {
            return (
              <View>
                <TouchableOpacity
                  style={{
                    width: "95%",
                    height: 60,
                    borderWidth: 1,
                    marginLeft: isCurrentUser ? "2.5%" : '2.5%',
                    marginTop: 5,
                    marginBottom: 10,
                    backgroundColor: "grey",
                    borderRadius: 10,
                    justifyContent: "center",
                  }}
                  onLongPress={() => {
                    setSelectedMessage(props.currentMessage);
                    setModalVisible(true);
                  }}
                  onPress={() => Linking.openURL(file.url)}
                >
                  <View style={{ width: "100%", height: "100%", flexDirection: "row" }}>
                    <View
                      style={{
                        width: "30%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={
                          icons[fileTypeDocument] || require("../assets/pdf-icon.png")
                        }
                        style={{ width: 40, height: 40 }}
                      />
                    </View>
                    <View
                      style={{ width: "70%", height: "100%", justifyContent: "center" }}
                    >
                      <Text
                        style={{ color: "#FFF", fontSize: 16, fontWeight: "500" }}
                        numberOfLines={2}
                      >
                        {file.name} File -{file.size} kb
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }
        }}
      />);
  }
  // gửi video
  const renderMessageVideo = (props) => {
    const { video, file } = props.currentMessage;
    return (
      <View
        style={{
          width: 300,
          height: 300,
          overflow: "hidden",
          flexDirection: "row",
        }}
      >
        {props.currentMessage.user._id == currentUser.user.uid ? (
          <View style={{ width: '100%', height: 300 }}>
            <View
              style={{
                width: 300,
                height: 300,
                marginTop: '1%',
                overflow: "hidden",
                flexDirection: "row",
                marginLeft: "3%",
              }}
            >
              <TouchableOpacity
                style={{
                  width: 30,
                  height: "100%",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setSelectedMessage(props.currentMessage);
                  setModalVisible(true);
                }}
              >
                <Entypo
                  name="dots-three-horizontal"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
              <Video
                ref={videoRef}
                source={{ uri: video ? video : file?.url }}
                style={{
                  width: 250,
                  height: 290,
                  backgroundColor: "#000",
                  borderRadius: 20,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
                resizeMode="cover"
                useNativeControls
                isLooping
              />
            </View>
          </View>
        ) : (
          <View
            style={{
              width: 300,
              height: 300,
              overflow: "hidden",
              flexDirection: "row",
              marginLeft: "2%",
            }}
          >
            <Video
              ref={videoRef}
              source={{ uri: video ? video : file?.url }}
              style={{
                width: 250,
                height: 280,
                backgroundColor: "#000",
                borderRadius: 20,
                paddingTop: 5,
                paddingBottom: 5,
              }}
              resizeMode="cover"
              useNativeControls
              isLooping
            />
            <TouchableOpacity
              style={{ width: 30, height: "100%", justifyContent: "center" }}
              onPress={() => {
                setSelectedMessage(props.currentMessage);
                setModalVisible(true);
              }}
            >
              <Entypo name="dots-three-horizontal" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // chỉnh icon gửi tin nhắn
  const renderSend = (props) => {
    if (!isTyping) {
      return (
        <View>
          {/* Icon khác khi không có tin nhắn */}
          <View
            style={{
              width: 120,
              height: "100%",
              marginRight: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: "#F6F6F6",
            }}
          >
            <Entypo
              name="dots-three-horizontal"
              size={24}
              color="grey"
              style={{
                marginTop: 5,
              }}
              onPress={pickDocument}
            />
            <SimpleLineIcons
              name="microphone"
              size={24}
              color="grey"
              style={{
                marginTop: 5,
              }}
            />
            <Octicons
              name="image"
              size={24}
              color="grey"
              style={{
                marginTop: 5,
              }}
              onPress={onSendMedia}
            />
          </View>
        </View>
      );
    }

    return (
      <Send {...props}>
        <View>
          <MaterialCommunityIcons
            name="send-circle"
            style={{ marginBottom: 5, marginRight: 5 }}
            size={38}
            color={"#2e64e5"}
          />
        </View>
      </Send>
    );
  };

  const renderInputToolBar = (props) => {
    return (
      <InputToolbar
        containerStyle={{
          backgroundColor: "#f6f6f6",
          borderColor: isFocused ? "#2e64e5" : "#f6f6f6", // Màu viền khi focus
          borderWidth: 1,
        }}
        {...props}
        keyboardShouldPersistTaps={isFocused ? "always" : "never"}
      />
    );
  };
  // hàm thực hiện gọi video
  const [videoCall, setVideoCall] = useState(false);
  const channel = conversationInfo?.conversationId;
  // biến kiểm tra người nhận không bắt máy
  const [isBusy, setIsBusy] = useState(false);
  useEffect(() => {
    if(socket) { 
      socket.on("end-call", ({ channel }) => {
        setVideoCall(false);
      });
      socket.on("decline-call", (data) => {
        if(data.channel===conversationInfo?.conversationId)
        setVideoCall(false);

        // console.log("decline call",data)
        // setDataReviverCall(null);
        
      });
    }
  }, [socket]);
  const connectionData = {
    appId: "5a55004d2d524938a0edde0ecd2349ae",
    channel: channel,
  };
  const callbacks = {
    EndCall: () => {
      socket.emit("end-call", { channel })
      setVideoCall(false)
    },
  };

  const handleCallVideo = () => {
    socket.emit("video-call", {
      channel: conversationInfo?.conversationId,
      caller: currentUser.user.uid,
    });
    setVideoCall(true);
  };
  // Giao diện
  return (
    <View style={styles.container}>
      {videoCall ? (
        <AgoraUIKit connectionData={connectionData} rtcCallbacks={callbacks} />
      ) : <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        onInputTextChanged={onInputTextChanged}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Messages"
        user={{
          _id: currentUser.user.uid,
        }}
        timeTextStyle={{
          left: { color: "#95999A" },
          right: { color: "#F0F0F0" },
        }} // Màu của thời gian
        // showUserAvatar={true} // Hiện avatar của người gửi
        renderAvatarOnTop={true}
        // showAvatarForEveryMessage={true} // Hiện avatar của người gửi
        renderBubble={renderBubble} // custom bubble
        // renderMessageVideo={renderMessageVideo}
        renderSend={renderSend} // custom icon gửi thay vì chữ SEND
        // renderUsernameOnMessage={true} // hiện tên người gửi bên dưới nội dung
        renderInputToolbar={renderInputToolBar} // custom thanh bar của tin nhắn
        onLongPress={(context, message) => onMessageLongPress(context, message)}
      />}
      {/* Modal thông báo người nhận không liên lạc được */}
      <Modal
        isVisible={isBusy}
        onBackdropPress={() =>
          setIsBusy(!isBusy)
        }
        style={{ justifyContent: "center", margin: 0 }}
        backdropOpacity={0.65}
        animationIn="slideInDown"
        animationOut="fadeInDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View>
          <Text style={{ fontSize: 20, color: 'white', fontWeight: "bold", textAlign: "center" }}>
            Người nhận không liên lạc được
          </Text>
        </View>
      </Modal>
      {/* ================================================================= Modal khi xóa tin nhắn */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleUnsendMessage}
        style={{
          // position:'absolute',
          top: 180,
          left: 20,
        }}
        backdropOpacity={0.65}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >

        {selectedMessage?.text ? ( // ========================== Nếu tin nhắn là text
          <View
            style={{
              width: 325,
              // height: messageLength + 70,
              marginLeft: 20,
              backgroundColor: "#52A0FF",
              borderRadius: 10,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "500",
                fontSize: 18,
                marginLeft: 5,
                color: "#FFF",
              }}
            >
              {selectedMessage.text}
            </Text>
          </View>
        ) : (selectedMessage?.image ? ( // ========================== Nếu tin nhắn là image
          <View style={{ width: 250, height: 300, marginLeft: 70 }}>
            <Image
              source={{
                uri: selectedMessage.image
                  ? selectedMessage.image
                  : selectedMessage.url,
              }}
              style={{ width: "100%", height: "100%", borderRadius: 20 }}
            />
          </View>

        ) : (selectedMessage?.video ? (
          <View style={{ width: 250, height: 300, marginLeft: 50 }}>
            <Video
              source={{
                uri: selectedMessage.file?.url
                  ? selectedMessage.file?.url
                  : selectedMessage.video,
              }}
              style={{ width: "100%", height: "100%", borderRadius: 20 }}
              resizeMode="cover"
            />
          </View>

        ) : (null)))}

        {currentUser.user.uid === selectedMessage.user?._id ? (
          <View
            style={{
              width: 325,
              height: 70,
              borderRadius: 10,
              backgroundColor: "#FFF",
              marginLeft: 20,
              marginTop: 10,
              marginBottom: 30,
            }}
          >
            <View
              style={{
                width: "90%",
                height: "90%",
                marginLeft: "5%",
                marginTop: "2%",
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <View style={{ width: 55, height: 60, alignItems: "center" }}>
                <Image
                  source={require("../assets/reply.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text>Reply</Text>
              </View>
              <TouchableOpacity
                style={{ width: 55, height: 60, alignItems: "center" }}
                onPress={() => {
                  navigation.navigate("ForwardMessage", {
                    message: selectedMessage,
                    conversationId: conversationInfo?.conversationId,
                  });
                  setModalVisible(false);
                  // setModalImageVisible(false);
                  // setModalVideoVisible(false);
                }}
              >
                <Image
                  source={require("../assets/arrow.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text>Forward</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: 55, height: 60, alignItems: "center" }}
                onPress={unsendMessage}
              >
                <Image
                  source={require("../assets/message.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text>Recall</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: 55, height: 60, alignItems: "center" }}
                onPress={() => {
                  setModalVisible(false);
                  setIsConfirmModalVisible(true);
                }}
              >
                <Image
                  source={require("../assets/delete.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={{
              width: 325,
              height: 70,
              borderRadius: 10,
              backgroundColor: "#FFF",
              marginLeft: 20,
              marginTop: 10,
              marginBottom: 30,
            }}
          >
            <View
              style={{
                width: "90%",
                height: "90%",
                marginLeft: "5%",
                marginTop: "2%",
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <View style={{ width: 55, height: 60, alignItems: "center" }}>
                <Image
                  source={require("../assets/reply.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text>Reply</Text>
              </View>
              <TouchableOpacity
                style={{ width: 55, height: 60, alignItems: "center" }}
                onPress={() => {
                  navigation.navigate("ForwardMessage", {
                    message: selectedMessage,
                    conversationId: conversationInfo?.conversationId,
                  });
                  setModalVisible(false);
                }}
              >
                <Image
                  source={require("../assets/arrow.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text>Forward</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: 55, height: 60, alignItems: "center" }}
                onPress={() => {
                  setModalVisible(false);
                  setIsConfirmModalVisible(true);
                }}
              >
                <Image
                  source={require("../assets/delete.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
      {/* ================================================================= Modal xác nhận khi xóa tin nhắn */}
      <Modal
        isVisible={isConfirmModalVisible}
        onBackdropPress={toggleConfirmUnsendMessage}
        style={{
          position: "absolute",
          top: 300,
          left: 20,
        }}
        backdropOpacity={0.65}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View
          style={{
            width: 325,
            height: 160,
            borderRadius: 10,
            backgroundColor: "#FFF",
            marginLeft: 0,
            marginTop: 0,
            marginBottom: 30,
          }}
        >
          <Text
            style={{
              width: 260,
              fontSize: 20,
              fontWeight: "600",
              marginLeft: 10,
              marginTop: 25,
            }}
          >
            Bạn có muốn xóa {selectedMessage.text ? 'tin nhắn' : (selectedMessage.image ? 'hình ảnh' : 'video')} này?
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "400",
              marginLeft: 10,
              marginTop: 10,
            }}
          >
            {selectedMessage.text ? 'Tin nhắn' : (selectedMessage.image ? 'Hình ảnh' : 'Video')} này sẽ được xóa ở phía bạn
          </Text>
          <View style={{ borderWidth: 0.5, width: "100%", marginTop: 10 }} />
          <View
            style={{
              width: "100%",
              height: "50%",
              marginTop: 10,
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setIsConfirmModalVisible(false);
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800" }}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteMessage}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "red" }}>
                Xóa
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ================================================================= Modal khi gửi file quá lớn */}
      <Modal
        isVisible={isModalErrorFileSizeVisible}
        onBackdropPress={toggleErrorFileSize}
        style={{
          // position:'absolute',
          top: 180,
          left: 20,
        }}
        backdropOpacity={0.65}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}
        hideModalContentWhileAnimating={true}
      >
        <View
          style={{
            width: 300,
            height: 100,
            backgroundColor: "white",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              marginLeft: 10,
              color: "red",
            }}
          >
            File lớn hơn 20MB, vui lòng chọn file khác!
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D3D3D3",
  },
  video: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 300,
    width: 250,
    borderRadius: 20,
  },
});