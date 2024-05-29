import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput } from "react-native";
import { useCurrentUser } from "../App";
import Modal from "react-native-modal";
import { Ionicons, AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import CheckBox from "react-native-check-box";
import axiosPrivate from "../api/axiosPrivate";

export default function ViewMember({ navigation, route }) {
    const currentUser = useCurrentUser();
    const dataConversation = route.params?.dataConversation;
    const listMember = dataConversation.members;
    const [listFriendsNotInGroup, setListFriendsNotInGroup] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);
    const [isSelected, setSelection] = useState(false);


    useEffect(() => {
        (async () => {
            let friends = await axiosPrivate.get(`/friends/${currentUser.user.uid}`);
            friends = friends.filter((friend) => {
                return !listMember.some((member) => member._id === friend.userId);
            })
            setListFriendsNotInGroup(friends);
        })();
    }, [])

    // cap nhat so nguoi chọn
    useEffect(() => {
        // Cập nhật số lượng người đã chọn mỗi khi selectedIds thay đổi
        setSelectedCount(selectedIds.length);
    }, [selectedIds]);

    const handleCheckboxToggle = (userId) => {
        const newSelectedIds = selectedIds.includes(userId)
            ? selectedIds.filter(id => id !== userId) // Bỏ chọn nếu đã chọn trước đó
            : [...selectedIds, userId]; // Chọn nếu chưa được chọn trước đó
        setSelectedIds(newSelectedIds);
    };

    const handleAddMembers = async () => {
        try {
            for (const id of selectedIds) {
                const res = await axiosPrivate.post(`/group/addMember/${dataConversation._id}`, {
                    userId: id
                });
                navigation.navigate('Conversations');
            }
        } catch (error) {
            console.error('Error adding members:', error);
        }
    }

    const renderFriendsNotInGroup = ({ item }) => {
        return (
            <TouchableOpacity
                style={{ width: '100%', height: 50, flexDirection: 'row', marginBottom: 10 }}
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
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <View
                style={{ width: "100%", height: 50, flexDirection: "row", borderBottomWidth: 0.5, backgroundColor: '#F7F7F7' }}
            >
                <TouchableOpacity
                    style={{ width: "15%", height: "100%", justifyContent: "center", alignItems: "center", }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
                <View
                    style={{ width: "85%", height: "100%", justifyContent: "center" }}
                >
                    <Text
                        style={{ fontSize: 20, fontWeight: "800" }}
                    >
                        Thêm vào nhóm
                    </Text>
                    <Text
                        style={{ fontSize: 15, color: "gray" }}
                    >
                        Đã chọn: {selectedCount}
                    </Text>
                </View>
            </View>
            <View style={{ width: '100%', height: 80, borderBottomWidth: 0.5 }}>
                <TouchableOpacity style={{ width: '95%', height: '50%', flexDirection: 'row', backgroundColor: '#F2F2F2', marginLeft: '2.5%', marginTop: '5%', borderRadius: 10 }}>
                    <View style={{ width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Feather name="search" size={32} color="black" />
                    </View>
                    <View style={{ width: '80%', height: '100%', justifyContent: 'center' }}>
                        <TextInput
                            placeholder="Tìm kiếm"
                        />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', height: 400, marginTop: 5, borderBottomWidth: 0.5 }}>
                {
                    listFriendsNotInGroup.map((item) => {
                        return renderFriendsNotInGroup({ item });
                    })
                }
            </View>
            {selectedCount > 0 ? (
                <View style={{ width: '100%', height: 80, position: "absolute", bottom: 0 }}>
                    <TouchableOpacity
                        style={{ width: '100%', height: '50%' }}
                        onPress={() => {
                            handleAddMembers();

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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});