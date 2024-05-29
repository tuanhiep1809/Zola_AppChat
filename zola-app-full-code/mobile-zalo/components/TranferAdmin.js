import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput, FlatList } from "react-native";
import { useCurrentUser } from "../App";
import Modal from "react-native-modal";
import { Ionicons, AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import CheckBox from "react-native-check-box";
import axiosPrivate from "../api/axiosPrivate";

export default function TranferAdmin({ navigation, route }) {
    const currentUser = useCurrentUser();
    let dataConversation = route.params?.dataConversation;
    let listMember = dataConversation.members.filter(member => member._id !== currentUser.user.uid);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const toggleModalVisible = () => {
        setIsModalVisible(!isModalVisible);
    }

    const renderFriend = (item) => (
        <TouchableOpacity
            style={{ width: '90%', height: 50, marginLeft: '5%', flexDirection: 'row', marginTop: 10 }}
            onPress={() => {
                // console.log('press item', item);
                setSelectedUser(item);
                setIsModalVisible(true);
            }}
        >
            <View style={{ width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 50, height: 50, borderRadius: 50 }}
                />
            </View>
            <View style={{ width: '80%', height: '100%', justifyContent: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '600' }}>
                    {item.name}
                </Text>
            </View>
        </TouchableOpacity>
    )

    const handleTranferAdmin = async () => {
        try {
            const res = await axiosPrivate.patch(`/group/transferAdmin/${dataConversation._id}`, {
                userId: selectedUser._id
            });
            console.log("res",res);
            navigation.navigate('Conversations');
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error tranfer role admin:', error);
        }
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
                        Chuyển trưởng nhóm
                    </Text>
                </View>
            </View>
            <View style={{ width: '100%', height: 300, borderBottomWidth: 0.5, marginTop: 5 }}>
                <FlatList
                    data={listMember}
                    renderItem={({ item }) => renderFriend(item)}
                    keyExtractor={item => item._id}
                    style={{ width: '100%', height: '100%' }}
                />
            </View>
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModalVisible}
                style={{
                    // position:'absolute',
                    top: 0,
                    right: '5%',
                    width: '80%',
                    height: '100%',
                    marginLeft: '15%'
                }}
                backdropOpacity={0.3}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={600}
                backdropTransitionOutTiming={600}
                hideModalContentWhileAnimating={true}
            >
                <View style={{ width: '100%', height: 200, backgroundColor: 'white', borderRadius: 10 }}>
                    <View style={{ width: '100%', height: '40%', marginTop: 10, borderBottomWidth: 0.5 }}>
                        <Text style={{ fontSize: 22, fontWeight: '600', marginLeft: 10 }}>
                            Chuyển quyền trưởng nhóm cho {selectedUser?.name}
                        </Text>
                    </View>
                    <View style={{ width: '100%', height: '30%', marginTop: 10, borderBottomWidth: 0.5 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', marginLeft: 10, color: 'gray' }}>
                            {selectedUser?.name} sẽ làm trưởng nhóm.Bạn sẽ là thành viên
                        </Text>
                    </View>
                    <View style={{ width: '60%', height: '15%', marginLeft: '40%', marginTop: 5, flexDirection: 'row' }}>
                        <TouchableOpacity
                            style={{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={{ fontSize: 18, fontWeight: '500' }}>
                                Hủy
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ width: '70%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                            onPress={handleTranferAdmin}
                        >
                            <Text style={{ fontSize: 18, fontWeight: '500', color: 'red' }}>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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