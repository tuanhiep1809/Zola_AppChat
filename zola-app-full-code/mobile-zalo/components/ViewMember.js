import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput, FlatList } from "react-native";
import { useCurrentUser } from "../App";
import Modal from "react-native-modal";
import { Ionicons, AntDesign, Feather } from '@expo/vector-icons';
import axiosPrivate from "../api/axiosPrivate";


export default function ViewMember({ navigation, route }) {

    const currentUser = useCurrentUser();
    // data conversation
    const dataConversation = route.params?.dataConversation;
    console.log("object data conversation: ", dataConversation)
    // id của trưởng nhóm
    const adminId = dataConversation.adminId;
    // danh sách thành viên
    const [listMember, setListMember] = useState([]);
    // console.log("list member: ", listMember);
    const [selectedUser, setSelectedUser] = useState({});

    const [isModalVisible, setModalVisible] = useState(false);
    const [isVisibleModalGrantDeputyGroup, setIsVisibleGrantDeputyGroup] = useState(false);

    const toggleModalVisible = () => {
        setModalVisible(!isModalVisible);
    }
    const toggleVisibleModalGrantDeputyGroup = () => {
        setIsVisibleGrantDeputyGroup(!isVisibleModalGrantDeputyGroup);

    }

    function getMember() {
        (async () => {
            try {
                const response = await axiosPrivate.get(`/group/getMembers/${dataConversation._id}`);
                // console.log('response:', response);
                setListMember(response);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        })();
    }
    useEffect(() => {
        getMember()
    }, []);

    const handleTranferDeputyGroup = async () => {
        try {
            const res = await axiosPrivate.patch(`/group/addDeputy/${dataConversation._id}`, {
                userId: selectedUser._id
            });
            getMember()
            setIsVisibleGrantDeputyGroup(false);
        } catch (error) {
            console.error('Error tranfer role deputy:', error);
        }
    }



    const renderListMember = (item) => (
        <TouchableOpacity
            style={{ width: '100%', height: 60, flexDirection: 'row' }}
            onPress={() => {
                if (item._id === currentUser.user.uid) {
                    return;
                }
                setModalVisible(true);
                setSelectedUser(item);
            }}
        >
            <View style={{ width: '20%', height: 60, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                />
            </View>
            <View style={{ width: '80%', height: 60 }}>
                <Text style={{ fontSize: 18, fontWeight: '600' }}>
                    {item._id == currentUser.user.uid ? 'Bạn' : item.name}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '500', color: 'gray' }}>
                    {item.role === 'admin' ? 'Quản trị viên' : (item.role === 'deputy' ? 'Phó nhóm' : 'Thành viên')}
                </Text>
            </View>
        </TouchableOpacity>
    )
  async function XoaThanhVien(id){
        try{
            await axiosPrivate.delete(`/group/removeMember/${dataConversation._id}`,{
                params:{ userId:id}
            })
            setModalVisible(false);
            getMember()
           
        }catch(error){
            console.log('Error xóa thàng viên:',error)
        }
    }
    return (
        <View style={styles.container}>
            <View style={{ width: '100%', height: '7%', backgroundColor: '#0A95FC', flexDirection: 'row' }}>
                <View style={{ width: '70%', height: '100%', flexDirection: 'row' }}>
                    <TouchableOpacity
                        style={{ width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={32} color="white" />
                    </TouchableOpacity>
                    <View style={{ width: '80%', height: '100%', justifyContent: 'center' }}>
                        <Text
                            style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}
                        >
                            Các thành viên
                        </Text>
                    </View>
                </View>
                <View style={{ width: '30%', height: '100%', flexDirection: 'row' }}>
                    <TouchableOpacity
                        style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => {
                            navigation.navigate('AddMembers',{
                                dataConversation:dataConversation
                            });
                        }}
                    >
                        <AntDesign name="addusergroup" size={32} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Feather name="search" size={32} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ width: '100%', height: 500, borderBottomWidth: 0.5 }}>
                <View style={{ width: '95%', height: 40, marginLeft: '2.5%', marginTop: 5 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#3175A6' }}>
                        Thành viên ({listMember.length})
                    </Text>
                </View>
                <View style={{ width: '95%', height: '85%', marginLeft: '2.5%', marginTop: 5 }}>
                    <FlatList
                        data={listMember}
                        renderItem={({ item }) => renderListMember(item)}
                        keyExtractor={item => item._id}
                    />
                </View>
            </View>
            {/* modal xem tac vu */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModalVisible}
                style={{
                    // position:'absolute',
                    top: 200,
                    right: '5%',
                    width: '100%',
                    height: '100%',
                }}
                backdropOpacity={0.65}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={600}
                backdropTransitionOutTiming={600}
                hideModalContentWhileAnimating={true}
            >
                <View style={{ width: '100%', height: 260, backgroundColor: 'white', borderRadius: 10 }}>
                    {adminId === currentUser.user.uid ? (
                        <View>
                            <View style={{ width: '100%', height: 40, borderBottomWidth: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 15, fontWeight: '500' }}>
                                    Thông tin thành viên
                                </Text>
                            </View>
                            <View style={{ width: '100%', height: 60, borderBottomWidth: 0.5 }}>
                                <View style={{ width: '100%', height: '100%', flexDirection: 'row' }}>
                                    <View style={{ width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Image
                                            source={{ uri: selectedUser.avatar }}
                                            style={{ width: 50, height: 50, borderRadius: 25 }}
                                        />
                                    </View>
                                    <View style={{ width: '50%', height: '100%', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '600' }}>
                                            {selectedUser.name}
                                        </Text>
                                    </View>
                                    <View style={{ width: '30%', height: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <TouchableOpacity style={{ width: 40, height: 40, marginTop: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F8', borderRadius: 50 }}>
                                            <Feather name="phone" size={24} color="black" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ width: 40, height: 40, marginTop: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F8', borderRadius: 50 }}>
                                            <AntDesign name="message1" size={24} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{ width: '100%', height: '65%' }}>
                                <View style={{ width: '90%', height: '100%', marginLeft: '5%', marginTop: 10 }}>
                                    <TouchableOpacity
                                        style={{ marginTop: 5 }}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: '500' }}>
                                            Xem trang cá nhân
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ marginTop: 5 }}
                                        onPress={() => {
                                            setModalVisible(false);
                                            setIsVisibleGrantDeputyGroup(true);
                                        }}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: '500' }}>
                                            Bổ nhiệm làm phó nhóm
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ marginTop: 5 }}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: '500' }}>
                                            Chặn thành viên
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                    onPress={()=>{
                                        XoaThanhVien(selectedUser._id)
                                    }}
                                        style={{ marginTop: 5 }}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: '500', color: 'red' }}>
                                            Xóa khỏi nhóm
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={{ width: '100%', height: '100%' }}>
                            <View style={{ width: '100%', height: 40, borderBottomWidth: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 15, fontWeight: '500' }}>
                                    Thông tin thành viên
                                </Text>
                            </View>
                            <View style={{ width: '100%', height: 60, borderBottomWidth: 0.5 }}>
                                <View style={{ width: '100%', height: '100%', flexDirection: 'row' }}>
                                    <View style={{ width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Image
                                            source={{ uri: selectedUser.avatar }}
                                            style={{ width: 50, height: 50, borderRadius: 25 }}
                                        />
                                    </View>
                                    <View style={{ width: '50%', height: '100%', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '600' }}>
                                            {selectedUser.name}
                                        </Text>
                                    </View>
                                    <View style={{ width: '30%', height: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <TouchableOpacity style={{ width: 40, height: 40, marginTop: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F8', borderRadius: 50 }}>
                                            <Feather name="phone" size={24} color="black" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ width: 40, height: 40, marginTop: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F8', borderRadius: 50 }}>
                                            <AntDesign name="message1" size={24} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{ width: '100%', height: '65%' }}>
                                <View style={{ width: '90%', height: '100%', marginLeft: '5%', marginTop: 10 }}>
                                    <TouchableOpacity
                                        style={{ marginTop: 5 }}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: '500' }}>
                                            Xem trang cá nhân
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>
                    )}

                </View>
            </Modal>
            {/* modal gan quyen pho nhom */}
            <Modal
                isVisible={isVisibleModalGrantDeputyGroup}
                onBackdropPress={toggleVisibleModalGrantDeputyGroup}
                style={{
                    // position:'absolute',
                    top: 0,
                    right: '5%',
                    width: '100%',
                    height: '100%',
                }}
                backdropOpacity={0.65}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={600}
                backdropTransitionOutTiming={600}
                hideModalContentWhileAnimating={true}
            >
                <View style={{ width: '100%', height: 150, backgroundColor: 'white', borderRadius: 10 }}>
                    <View style={{ width: '100%', height: '60%', marginTop: 10, borderBottomWidth: 0.5 }}>
                        <Text style={{ fontSize: 22, fontWeight: '600', marginLeft: 10 }}>
                            Chuyển quyền phó nhóm cho {selectedUser?.name}
                        </Text>
                    </View>
                    <View style={{ width: '60%', height: '40%', marginLeft: '40%', flexDirection: 'row' }}>
                        <TouchableOpacity
                            style={{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => setIsVisibleGrantDeputyGroup(false)}
                        >
                            <Text style={{ fontSize: 18, fontWeight: '500' }}>
                                Hủy
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ width: '70%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                            onPress={handleTranferDeputyGroup}
                        >
                            <Text style={{ fontSize: 18, fontWeight: '500', color: 'red' }}>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});