import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
export default function App({navigation}) {
  const [name, setName] = useState("");
  const [isFieldsFilled, setIsFieldsFilled] = useState(false);
    const [ErorName,setErorName] = useState('')
  useEffect(() => {
    setIsFieldsFilled(name !== "");
  }, [name]);
  const clearTextInput = () => {
    setName("");
    setErorName('')
  };
  function handelTaoTen() {
    // Kiểm tra xem tên có đúng định dạng không
    const nameRegex = /^[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝa-zA-Z\s]{0,100}$/;

    if (nameRegex.test(name.trim())) {
        // Chuyển chữ cái đầu tiên sau dấu cách thành chữ in hoa
        const formattedName = name.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });

        // Kiểm tra độ dài của tên
        if (formattedName.length >= 2 && formattedName.length <= 40) {
          // console.log(formattedName);
            navigation.navigate('SignupSDT', { name: formattedName });
        } else {
            setErorName('Tên quá ngắn. Vui lòng nhập tên dài hơn 2 kí tự và không quá 40 kí tự');
        }
    } else {
        setErorName('Tên không hợp lệ. Vui lòng chỉ nhập chữ cái và dấu cách');
    }
}
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 19, fontWeight: 700 }}>Tên Zalo</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "blue",
        }}
      >
        <TextInput
          style={styles.input}
          placeholder="Gồm 2-40 kí tự"
          autoCapitalize="sentences"
          autoCorrect={false}
          autoFocus={true}
          textContentType="givenName"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        {name.length > 0 && (
          <TouchableOpacity style={{marginTop:10}} onPress={clearTextInput}>
            <MaterialIcons name="clear" size={31} color="gray" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={{fontSize:18,color:'red',marginTop:15}}>
        {ErorName}
      </Text>
      <Text style={{ fontSize: 19, marginTop: 15 }}>Lưu ý khi đặt tên:</Text>
      <View
        style={{ width: "100%", height: null, flexDirection: "row", gap: 5 }}
      >
        <Entypo
          style={{ marginTop: 15 }}
          name="dot-single"
          size={26}
          color="black"
        />
        <Text style={{ fontSize: 16, marginTop: 15 }}>Không vi phạm</Text>
        <TouchableOpacity>
          <Text style={{ color: "blue", fontSize: 16, marginTop: 15 }}>
            Quy định đặt tên trên Zalo
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{ width: "100%", height: null, flexDirection: "row", gap: 5 }}
      >
        <Entypo
          style={{ marginTop: 15 }}
          name="dot-single"
          size={26}
          color="black"
        />
        <Text style={{ fontSize: 16, marginTop: 15 }}>
          Nên sử dụng tên thật để giúp bạn bè dễ nhận ra bạn .
        </Text>
      </View>
      <TouchableOpacity
      onPress={handelTaoTen}
        style={{
          borderRadius: 100,
          width: 50,
          height: 50,
          backgroundColor: isFieldsFilled ? "blue" : "gray",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          bottom: 30,
          right: 30,
        }}
        disabled={!isFieldsFilled}
      >
        <MaterialIcons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    marginTop: 15,
    width: "90%",
    height: 50,
    fontSize: 19,
  },
});
