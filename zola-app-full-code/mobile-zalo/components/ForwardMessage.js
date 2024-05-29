import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons, AntDesign } from '@expo/vector-icons';
import CheckBox from 'react-native-check-box'
import axiosPrivate from "../api/axiosPrivate";
import { useCurrentUser } from "../App";
import Modal from "react-native-modal";
import { set } from "date-fns";
import { FontAwesome } from '@expo/vector-icons';

export default function ForwardMessage({ route, navigation }) {


    const mesageForward = route.params.message;
    const conversationId = route.params.conversationId;

    const currentUser = useCurrentUser();
    const [data, setData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [isTextInputVisible, setIsTextInputVisible] = useState(false);
    const [textInputPosition, setTextInputPosition] = useState('bottom');

    const toggleTextInputVisibility = () => {
        setIsTextInputVisible(!isTextInputVisible);
        setTextInputPosition(isTextInputVisible ? 'bottom' : 'center');
    };


    const [isSelected, setSelection] = useState(false);

    useEffect(() => {
        (async () => {
            const fetchData = async () => {
                try {
                    const response = await axiosPrivate.get(`/friends/${currentUser.user.uid}`);
                    console.log("danh sach ban be: ", response);
                    setData(response);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            // Gọi hàm fetch data khi component được render lại
            fetchData();
            // const response = await axiosPrivate.get(`/friends/${currentUser.user.uid}`);
            // setData(response);
            // console.log(response);
        })();
    }, []);
    // cap nhat so nguoi chọn
    useEffect(() => {
        // Cập nhật số lượng người đã chọn mỗi khi selectedIds thay đổi
        setSelectedCount(selectedIds.length);
    }, [selectedIds]);

    // console.log("danh sach ban be da chon:", selectedIds)
    // xu li chon nguoi de chia se tin nhan
    // const handleCheckboxToggle = (id) => {
    //     if (selectedIds.includes(id)) {
    //         // Nếu ID đã tồn tại trong danh sách, loại bỏ nó
    //         setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    //     } else {
    //         // Nếu ID chưa tồn tại trong danh sách, thêm vào
    //         setSelectedIds([...selectedIds, id]);
    //         // setIsVisibleModal(true);
    //     }
    // };
    const handleCheckboxToggle = (userId) => {
        const newSelectedIds = selectedIds.includes(userId)
            ? selectedIds.filter(id => id !== userId) // Bỏ chọn nếu đã chọn trước đó
            : [...selectedIds, userId]; // Chọn nếu chưa được chọn trước đó
        setSelectedIds(newSelectedIds);
    };

    // xử lí chia sẻ tin nhắn cho bạn bè

    const handleForwardMessage = async () => {
        for (const id of selectedIds) {
            try {
                const text = mesageForward?.text;
                const video = mesageForward?.video;
                const image = mesageForward?.image;
                const chat = await axiosPrivate.post(`/chat`, {
                    receiverId: id,
                    senderId: currentUser.user.uid,
                    content: {
                        ...(text && { text }),
                        ...(video && { video }),
                        ...(image && { image }),
                    }
                });
                console.log("chat: ", chat);
                console.log("chuyen tin nhan thanh cong");
                navigation.goBack();
            } catch (error) {
                console.error("Error sending message text:", error);
            }
        }
    }



    const renderFriends = ({ item }) => {
        return (<TouchableOpacity
            style={{ width: '100%', height: 50, flexDirection: 'row', marginBottom: 10}}
            onPress={() => {
                setSelection(!isSelected);
                handleCheckboxToggle(item.userId);
            }}
            key={item.userId}
        >
            <TouchableOpacity
                style={{
                    width: '15%', height: 50, alignItems: 'center', justifyContent: 'center'
                }}
            >
                <CheckBox
                    value={isSelected}
                    isChecked={selectedIds.includes(item.userId)}
                    onClick={() => {
                        setSelection(!isSelected);
                        handleCheckboxToggle(item.userId);
                    }}
                />
            </TouchableOpacity>
            <View style={{ width: '15%', height: 50, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 50, height: 50, borderRadius: 50 }}
                />
            </View>
            <View style={{ width: '70%', height: 50, justifyContent: 'center' }}>
                <Text
                    style={{ fontSize: 14, fontWeight: '500', width: '100%', marginLeft: 10 }}
                >
                    {item.name}
                </Text>
            </View>
        </TouchableOpacity>)
    }

    return (
        <View style={styles.container}>
            <View style={{ width: '100%', height: 50, flexDirection: 'row', borderBottomWidth: 0.5 }}>
                <TouchableOpacity
                    style={{ width: '15%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
                <View style={{ width: '85%', height: '100%', justifyContent: 'center' }}>
                    <Text
                        style={{ fontSize: 20, fontWeight: '800' }}
                    >
                        Chia sẻ
                    </Text>
                    <Text
                        style={{ fontSize: 15, color: 'gray' }}
                    >
                        Đã chọn: {selectedCount}
                    </Text>
                </View>
            </View>
            <View style={{ width: '100%', height: 150, backgroundColor: 'white' }}>
                <View style={{ width: '100%', height: 30 }}>
                    <View style={{ width: '95%', height: 30, backgroundColor: '#F7F7F7', marginLeft: '2.5%', marginTop: 10, borderRadius: 10, flexDirection: 'row' }}>
                        <View style={{ width: '15%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <AntDesign name="search1" size={20} color="black" />
                        </View>
                        <View style={{ width: '85%', height: '100%' }}>
                            <TextInput
                                placeholder="Tìm kiếm"
                            />
                        </View>
                    </View>
                </View>
                <View style={{ width: '90%', height: 25, marginLeft: '5%', marginTop: 20, justifyContent: 'center' }}>
                    <Text
                        style={{ fontSize: 15, fontWeight: '500' }}
                    >
                        Chia sẽ đến
                    </Text>
                </View>
            </View>
            <View style={{ width: '100%', height: 600, backgroundColor: 'white', marginTop: 15 }}>
                <View style={{ width: '95%', height: '10%', marginLeft: '2.5%', justifyContent: 'center' }}>
                    <Text
                        style={{ fontSize: 15, fontWeight: '500' }}
                    >
                        Bạn bè
                    </Text>
                </View>
                <View style={{ width: '100%', height: '90%' }}>
                    {
                        data.map((item) => {
                            return renderFriends({ item });
                        })
                    }
                </View>
            </View>
            {selectedCount > 0 ? (
                <View style={{ width: '100%', height: 80, position: "absolute", bottom: 0 }}>
                    <TouchableOpacity
                        style={{ width: '100%', height: '50%' }}
                        onPress={() => {
                            handleForwardMessage();
                        }}
                    >
                        <FontAwesome name="send-o" size={32} color="blue" style={{ marginLeft: '80%' }} />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ width: '100%', height: 80, position: "absolute", bottom: 0 }}>
                    <View
                        style={{ width: '100%', height: '50%' }}
                    >
                        <FontAwesome name="send-o" size={32} color="gray" style={{ marginLeft: '80%' }} />
                    </View>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7'
        // justifyContent: "center",
        // alignItems: "center",
    },
});