import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import axiosPrivate from "../api/axiosPrivate";
import { auth } from "../config/firebase";
import { useSocket } from "../context/SocketProvider";
import { set } from "date-fns";
import { useNavigation } from '@react-navigation/native'

export default function Chat({  }) {

    const navigation = useNavigation();

    // width and height of device
    const { widthOfDevice, heightOfDevice } = Dimensions.get("window");

    const [modalCreateGroupVisible, setModalCreateGroupVisible] = useState(false);

    const toggleCreateGroupModal = () => {
        setModalCreateGroupVisible(!modalCreateGroupVisible);
    }


    //  danh sách các cuộc  hội thoại
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const [chatReceived, setChatReceived] = useState(null);
    const [newConversation, setNewConversation] = useState(null);

    const fetchData = async () => {
        try {
            const userId = auth.currentUser.uid;
            const userConversations = await axiosPrivate(
                `/userConversations/${userId}`
            );
            // console.log("user conversation:", userConversations.conversations);
            let data = userConversations.conversations;
            data = data?.sort((a, b) => {
                return new Date(b.lastMess.createdAt) - new Date(a.lastMess.createdAt);
            });
            if(data)
                setData(data);
        } catch (error) {
            console.error("Error fetching user conversations:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(socket) { 
            socket.on("getMessage", (chat) => {
                setChatReceived(chat);
            })
            socket.on("newConversation", (conversation) => {
                console.log("newconversation:");
                console.log(conversation);
                setNewConversation(conversation);
            })
            socket.on("deleteConversation", (conversationId) => {
                // console.log("delete socket: ", conversationId);
                //     return [...prevData.filter((item) => item.conversationId !== conversationId)]
                // })
                console.log("delele user"); 
                setData((prevData) => {
                    return [...prevData.map((item) => {
                        if (item.conversationId === conversationId) {
                            return { ...item, deleted: true, state: "deleted"}
                        }
                        return item;
                    })]
                })
                socket.emit("leaveRoom", conversationId);
                fetchData();
            })
        }
    }, [socket]);

    useEffect(() => {
        if (newConversation) {

            setData((prevData) => {
                return [newConversation, ...prevData];
            });
        }
    }, [newConversation]);

    useEffect(() => {
        fetchData();
    }, []);
    
    useEffect(() => {
        const unsubcribe = navigation.addListener("focus", () => {
            fetchData();
          })
          return unsubcribe;
    }, [navigation]);

    useEffect(() => {
        if (data?.length > 0) {
            data.map((item) => {
                if(item.conversationId&&item.state!== "deleted" && item.deleted!=true)

                    socket.emit("joinRoom", item.conversationId);
            })
        }
    }, [])

    if (loading) {
        // Hiển thị loading indicator hoặc bất kỳ nội dung đang chờ nào bạn muốn
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>Loading...</Text>
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>Chưa có cuộc hội thoại</Text>
            </View>
        );
    }

    const formatTimeSendMessage = (timestamp) => {
        // console.log(timeString);
        // const timeFormat = timeString?.slice(11, 16);
        // return timeFormat;
        const date = new Date(timestamp);
        // Thiết lập múi giờ cho Việt Nam, UTC+7
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        // Định dạng giờ và phút
        const hours = vietnamTime.getUTCHours().toString().padStart(2, '0');
        const minutes = vietnamTime.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };
    // render lên màn hình các đoạn chat của user
    const renderItem = ({ item }) => {
        // console.log('item:', item);

        const isNew = item?.conversationId === chatReceived?.conversationId;
        return (
            <TouchableOpacity
                style={styles.viewOfFlatlist}
                onPress={() => {
                    console.log("item: ")
                    console.log(item)
                    navigation.navigate("Conversations", {
                        conversationInfo: {
                            ...item, 
                            ...(item._id && {conversationId: item._id})
                        },
                    });
                }}
            >
                <View
                    style={{ width: "20%", height: 70, alignItems: "center" }}
                >
                        <Image
                            source={{ uri: item?.user?.avatar || item?.image }}
                            style={{ width: 60, height: 60, borderRadius: 50 }}
                        />
                </View>
                <View
                    style={{
                        width: "55%",
                        height: "100%",
                        backgroundColor: "#fff",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: "800",
                            color: "black",
                        }}
                    >
                        {item?.user?.name || item?.name}
                    </Text>
                    <Text style={{ fontSize: 16, color: "grey" }}>
                        {/* {(isNew && chatReceived?.content?.text) || item?.lastMess.content?.text} */}
                        {
                            item?.lastMess?.content?.image ? ("[Hình ảnh]") : (item?.lastMess?.content?.video ? "[Video]" : item?.lastMess?.content?.text ?
                                ((isNew && chatReceived?.content?.text) || item?.lastMess?.content?.text)?.length > 44 ?
                                    (((isNew && chatReceived?.content?.text) || item?.lastMess?.content?.text)?.substring(0, 44) + '...') :
                                    ((isNew && chatReceived?.content?.text) || item?.lastMess?.content?.text)
                                : "[File]")

                        }
                    </Text>
                </View>
                <View
                    style={{
                        width: "25%",
                        height: "100%",
                        backgroundColor: "#fff",
                        alignItems: "center",
                        marginTop: 5,
                    }}
                >
                    <Text style={{ color: "grey", fontSize: 14 }}>
                        {formatTimeSendMessage((isNew && chatReceived?.createdAt) || item?.lastMess?.createdAt)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* ============================================ renderHeader */}
            <View style={{ width: '100%', height: '8%', flexDirection: 'row', backgroundColor: '#009CF9' }}>
                <TouchableOpacity
                    style={{ width: '75%', height: '100%', flexDirection: 'row' }}
                    onPress={() => {
                        navigation.navigate("Search");
                    }}
                >
                    <View style={{ width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Feather name="search" size={28} color="white" />
                    </View>
                    <View style={{ width: '80%', height: '100%', justifyContent: 'center' }}>
                        <Text
                            style={{ color: "#B9BDC1", marginLeft: 20, fontSize: 18, fontWeight: 500, }}
                        >
                            Tìm kiếm
                        </Text>
                    </View>

                </TouchableOpacity>
                <View style={{ width: '25%', height: '100%' }}>
                    <View style={{ width: '100%', height: '100%', flexDirection: 'row' }}>
                        <TouchableOpacity
                            style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                // navigation.navigate("QRCode");
                            }}
                        >
                            <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                setModalCreateGroupVisible(true);
                            }}
                        >
                            <Feather name="plus" size={34} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            {/* ============================================ render list conversation */}
            <View style={{ width: "100%", height: '92%' }}>
                <FlatList
                    style={{
                        height: '100%'
                    }}
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item?.conversationId}
                />
            </View>
            {/* ============================================ render modal create group */}
            <Modal
                isVisible={modalCreateGroupVisible}
                onBackdropPress={toggleCreateGroupModal}
                style={{
                    // position:'absolute',
                    bottom: '32%',
                    left: '41%',
                }}
                backdropOpacity={0.65}
                animationIn="fadeIn"
                animationOut="slideOutDown"
                backdropTransitionInTiming={1500}
                backdropTransitionOutTiming={600}
                hideModalContentWhileAnimating={true}
            >
                <View style={{ width: '60%', height: '6%' }}>
                    <View style={{ width: '100%', height: '100%', marginLeft: '80%', justifyContent: 'center' }}>
                        <Feather name="plus" size={34} color="white" />
                    </View>
                </View>
                <View style={{ width: '58%', height: '30%', backgroundColor: 'white', borderRadius: 20, marginTop: '0%' }}>
                    <TouchableOpacity
                        style={{ width: '100%', height: '20%', flexDirection: 'row' }}
                        onPress={() => {
                            navigation.navigate("CreateGroup");
                            setModalCreateGroupVisible(false);
                        }}
                    >
                        <View style={{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <AntDesign name="addusergroup" size={30} color="black" />
                        </View>
                        <View style={{ width: '70%', height: '100%', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 15, fontWeight: '500', textDecorationLine: "underline" }}>
                                Create group
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    viewOfFlatlist: {
        width: "100%",
        backgroundColor: "#000",
        height: 60,
        flexDirection: "row",
        marginTop: 8,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
});