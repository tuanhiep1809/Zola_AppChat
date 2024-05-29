import React, { useState, useEffect,useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import {
  Ionicons,
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import axiosPrivate from "../api/axiosPrivate.js";
import { AuthenticatedUserContext } from "../App.js";
import { set } from "date-fns";
import { useNavigation } from "@react-navigation/native";

function FormatTenQuaDai(text, maxLength) {
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + "..."
    : text;
}
export default function User() {
  const { user } = useContext(AuthenticatedUserContext);
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  // lấy danh sách bạn bè của user hiện hành
  const fetchUserData = async () => {
    try {
      const users = await axiosPrivate(`/friends/${user.uid}`);
        console.log("users",users)
     setUsers(users);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
    });

    return unsubscribe;
  }, [navigation]);
  
  //hàm render danh sách liên hệ đẫ tìm
  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => { }}>
      <View style={{ alignItems: "center", width: 100 }}>
        <Image
          style={{
            width: 55,
            height: 55,
            borderRadius: 50 / 2,
          }}
          source={{ uri: item.avatar }}
        />
        <Text style={{ fontSize: 20, fontWeight: "400", textAlign: "center" }}>
          {FormatTenQuaDai(item.name, 18)}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  // Lọc danh sách liên hệ theo tên, kết quả tìm kiếm sẽ được hiển thị sau 300ms
  const [filteredUsers, setFilteredUsers] = useState([]);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setSearchUserByPhone(null);
      handleSearch();
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchText]);
  const [searchUserByPhone , setSearchUserByPhone] = useState({});
   // pending1: userId1 đã gửi lời mời cho userId2 
        // pending2: userId2 đã gửi lời mời cho userId1
        // accepted: userId1 và userId2 đã là bạn 
        // nofriend: userId1 và userId2 chưa là bạn
        // declined1: userId1 bị từ chối kết bạn từ userId2
        // declined2: userId2 bị từ chối kết bạn từ userId1
  const [isFriend, setIsFriend] = useState("");
  const handleSearch = async () => {
    
    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase())
    );
    // nếu không có kết quả tìm kiếm thì kiểm tra xem số điện thoại có tồn tại không
    if(filteredUsers.length === 0){
      const formattedSDT = searchText.replace(/^0+/, "");
      const phoneNumber = "+84"+formattedSDT;
      const response = await axiosPrivate(
        `/user/number/${phoneNumber}`
      );
      if(response){
        // kiểm tra xem số đó có phải là số của mình không, phải thì k hiện
        if (response?.number==user.phoneNumber){
          setSearchUserByPhone(null)
        }
        else{
          //id 1 là user hiện hành, id 2 người đang đc tìm thấy
          const stateFriend = await axiosPrivate("/friendRequest/state", {
            params: { userId1: user.uid, userId2: response._id },
          })
          console.log("stateFriend",stateFriend)
          setIsFriend(stateFriend);          
          setSearchUserByPhone(response);  
        }
      }
    
    }
    setFilteredUsers(filteredUsers);
  };
  //Hàm kết bạn
  const KetBan = async () => {
    try{
      await axiosPrivate.post("/friendRequest/send", {
        senderUserId: user.uid,
        receiverUserId: searchUserByPhone._id,
      });
      setIsFriend("pending1");
    }catch(err){
      console.log("Lỗi kết bạn",err);
    }
  };
  //hàm đồng ý kết bạn
  const DongY = async () => {

    try{
      await axiosPrivate.post("/friendRequest/accept", {
        friendRequestId: searchUserByPhone._id+"-"+user.uid,
      });
      setIsFriend("accepted");
    }catch(err){
      console.log("Lỗi đồng ý kết bạn",err);
    }
  };
  //hàm thu hồi lời mời kết bạn
  async function ThuHoi() {
    const id = user.uid+"-"+searchUserByPhone._id;
    try {
      await axiosPrivate.post(`/friendRequest/cancel`, { friendRequestId: id });
      setIsFriend("nofriend");
    } catch (error) {
      console.log(error);
    }
  }
  //hàm mở cuộc trò chuyện
  function OpenConvertation(){
    if(isFriend ==="accepted"){
      const searchUser = users.find((user) => user.userId === searchUserByPhone._id);
      // console.log("searchUser",searchUser)
      // tìm kiếm cuộc trò chuyện giữ mình và searchUser
      navigation.navigate('Conversations', { searchUser: searchUser })
    }
    else{
      console.log("Chưa là bạn")
    }
  }
  //Hàm render danh sách tìm kiếm
  const renderUserItemSearch = ({ item }) => (

    <TouchableOpacity onPress={() => { console.log("item",item); navigation.navigate('Conversations', { searchUser: item }) }}>
      <View
        style={{
          alignItems: "center",
          width: "100%",
          flexDirection: "row",
          padding: 15,
          paddingRight: 25,
          justifyContent: "space-between",
        }}
      >
        <View style={{ alignItems: "center", flexDirection: "row", gap: 15 }}>
          <Image
            style={{
              width: 55,
              height: 55,
              borderRadius: 50 / 2,
            }}
            source={{ uri: item.avatar }}
          />
          <Text
            style={{ fontSize: 20, fontWeight: "400", textAlign: "center" }}
          >
            {FormatTenQuaDai(item.name, 18)}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 45,
            height: 45,
            borderRadius: 50,
            backgroundColor: "#E0FFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="phone" size={20} color="#006AF5" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          height: 56,
          alignItems: "center",
          backgroundColor: "#0895FB",
          width: "100%",
        }}
      >
        <TouchableOpacity
          style={{ marginLeft: 20 }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back-outline" size={28} color="white" />
        </TouchableOpacity>

        <View
          style={{
            marginLeft: 20,
            fontWeight: "bold",
            backgroundColor: "white",
            borderRadius: 8,
            width: 255,
            height: 33,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 8,
            marginRight: 20,
          }}
        >
          <Feather name="search" size={24} color="#767A7F" />
          <TextInput
            placeholder="Tìm kiếm"
            autoFocus={true}
            placeholderTextColor={"#767A7F"}
            style={{
              marginLeft: 10,
              fontWeight: "400",
              fontSize: 18,
              width: 180,
              height: 28,
              color: "black",
            }}
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
          />

          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <MaterialIcons name="cancel" size={24} color="#767A7F" />
            </TouchableOpacity>
          )}
        </View>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
      </View>
      {/* ======================================= */}
      {searchText.length == 0 ? (
        <View style={{ flex: 1, padding: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 600 }}>Liên hệ đã tìm</Text>
          <FlatList
            data={users}
            horizontal
            //   keyExtractor={(item) => item.id.toString()}
            renderItem={renderUserItem}
          //   contentContainerStyle={styles.userList}
          />
        </View>
      ) : filteredUsers.length === 0 ? searchUserByPhone ?(
       <TouchableOpacity onPress={OpenConvertation} activeOpacity={0.8} style={{ backgroundColor: "#fff",width:'100%',height:60, flexDirection:'row',alignItems:'center',justifyContent:'space-around', paddingHorizontal:5}}>
          <Image style={{width:45, height:45,borderRadius:100}} source={{uri:searchUserByPhone.avatar}} />
          <View style={{width:'58%', height:'100%', alignItems:'flex-start',justifyContent:'center'}}>
            <Text style={{fontSize:17,fontWeight:500}}>
              {searchUserByPhone.name}
            </Text>
            <Text  style={{fontSize:16,fontWeight:500,color:'#767A7F'}}>
             Số điện thoại: {searchUserByPhone.number}
            </Text>
          </View>
            {isFriend ==="accepted"? (
            <TouchableOpacity style={{ width:40, height:40, borderRadius:50, backgroundColor:'#E0FFFF', alignItems:'center', justifyContent:'center'}}>
              <Feather name="phone" size={20} color="#006AF5" />
          </TouchableOpacity>)
          :isFriend ==="nofriend"||isFriend==="declined2"?(
          <TouchableOpacity onPress={KetBan} style={{width:85, height:35, borderRadius:15, backgroundColor:'#E0FFFF', alignItems:'center', justifyContent:'center'}}>
            <Text style={{fontSize:16,fontWeight:500,color:'#006AF5'}}>Kết bạn</Text>
          </TouchableOpacity>
          )
          :isFriend ==="pending2"?(
            <TouchableOpacity onPress={DongY}  style={{width:85, height:35, borderRadius:15, backgroundColor:'#E0FFFF', alignItems:'center', justifyContent:'center'}}>
            <Text style={{fontSize:16,fontWeight:500,color:'#006AF5'}}>Đồng ý</Text>
          </TouchableOpacity>
          )
          :isFriend ==="pending1"?( <TouchableOpacity onPress={ThuHoi}  style={{width:85, height:35, borderRadius:15, backgroundColor:'#E0E0E0', alignItems:'center', justifyContent:'center'}}>
          <Text style={{fontSize:16,fontWeight:500,color:'black'}}>Thu hồi</Text>
        </TouchableOpacity>)
          :
          <View style={{width:85}}>
            </View>}
       </TouchableOpacity>
      )
      :
      (
        // Hiển thị nội dung khi không có kết quả tìm kiếm
        <Text style={{ fontSize: 18, fontWeight: 600, textAlign: "center" }}>
          Không có kết quả tìm kiếm
        </Text>
      ) : (
        // Hiển thị danh sách kết quả tìm kiếm
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItemSearch}
        //   keyExtractor={(item) => item.id.toString()}
        //   contentContainerStyle={styles.userList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D6D9DC",
  },
  FlatList: {
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
