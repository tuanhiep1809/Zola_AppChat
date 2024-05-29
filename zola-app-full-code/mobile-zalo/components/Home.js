import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View,Image,TouchableOpacity } from "react-native";
import Swiper from "react-native-swiper/src";
import { useState } from "react";
export default function SwiperComponent({navigation}) {
    const [laguage,setLaguage] = useState('vn')
  return (
    <View style={styles.container}>
        <Text style={{color:'#006AF5',fontSize:33,fontWeight:700,marginVertical: 10,}}>
            Zola
        </Text>
        <Image source={require('../assets/backgroundHome.jpg')} style={styles.backImage} />
      <View style={styles.ViewSwiper}>
        <Swiper style={styles.wrapper} showsButtons={false}>
          <View style={styles.slide1}>
            <Image source={require('../assets/slide_1_light.png')} style={styles.backImageSlide} />
            <Text style={styles.textSlice1}>{laguage=='vn'? "Gọi video ổn định": "Smooth video call" }</Text>
            <Text style={styles.textSlice2}>{laguage=='vn'? "Trò chuyện thật đã với chất lượng video ổn định mọi lúc, mọi nơi": "Perform video calls with high-quality over all type of networks" }</Text>
          </View>
          <View style={styles.slide1}>
          <Image source={require('../assets/slide_2_dark.png')} style={styles.backImageSlide} />
          <Text style={styles.textSlice1}>{laguage=='vn'? "Chát nhóm tiện ích": "Convenient group chat" }</Text>
            <Text style={styles.textSlice2}>{laguage=='vn'? "Nơi cùng nhau trao đổi, giữ liên lạc với gia đình, bạn bè, đồng nghiệp...": "Stay in tounch with your family, colloeagues and friends" }</Text>
          </View>
          <View style={styles.slide1}>
            <Image source={require('../assets/slide_3_dark.png')} style={styles.backImageSlide} />
            <Text style={styles.textSlice1}>{laguage=='vn'? "Gửi ảnh nhanh chóng": "Qick photo sharing" }</Text>
            <Text style={styles.textSlice2}>{laguage=='vn'? "Trao đổi hình ảnh chất lượng cao với bạn bè và người thân thật nhanh chóng và dễ dàng": "Share photos in high quality with everyone easily" }</Text>
          </View>
          <View style={styles.slide1}>
            <Image source={require('../assets/slide_4_dark.png')} style={styles.backImageSlide} />
            <Text style={styles.textSlice1}>{laguage=='vn'? "Nhật ký bạn bè": "Social timeline" }</Text>
            <Text style={styles.textSlice2}>{laguage=='vn'? "Nơi cập nhật hoạt động mới nhất của những người bạn quan tâm": "Stay updated with latest activities of people you care about" }</Text>
          </View>
          <View style={styles.slide2}>
            <Image source={require('../assets/slide_5.png')} style={styles.backImageSlide} />
          </View>
        </Swiper>
      </View>
      <TouchableOpacity
      onPress={()=>{navigation.navigate('Login')}}
      style={styles.ButtonLogin}>
          <Text style={{color:'white',fontSize:20,fontWeight:500}}>{laguage=='vn'? "ĐĂNG NHẬP": "LOGIN" }</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={()=>{navigation.navigate('Signup')}}
        style={styles.ButtonSignup}>
          <Text style={{color:'black',fontSize:20,fontWeight:500}}>{laguage=='vn'? "ĐĂNG KÝ": "REGISTER" }</Text>
        </TouchableOpacity>
        <View style={styles.laguage}>
        <TouchableOpacity onPress={()=>setLaguage('vn')}>
        <Text style={{color: laguage == 'vn'?'black':'#767A7F',textDecorationLine:  laguage == 'vn'?'underline':null ,fontSize:20,fontWeight:500}}>Tiếng Việt</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setLaguage('en')}>
        <Text style={{color:laguage == 'en'?'black':'#767A7F',textDecorationLine:  laguage == 'en'?'underline':null ,fontSize:20,fontWeight:500}}>English</Text>
        </TouchableOpacity>
        </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  backImage: {
    width: "100%",
    height: 300,
    position: "absolute",
    top: 60,
    resizeMode: "cover",
  },
  ViewSwiper: {
    height: 490,
    width: "100%",
  },
  backImageSlide:{
    width: "50%",
    height: 200,
    marginBottom: 40,
    resizeMode: "contain",
  },
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slide2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textSlice1: {
    color: "black",
    fontSize: 21,
    fontWeight: "bold",
  },
  textSlice2: {
    color: "gray",
    fontSize: 16,
    textAlign:'center',
    fontWeight: "bold",
  },
  ButtonLogin:{
    backgroundColor:'#52A0FF',
    width:'59%',
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:50,
    marginTop:20,
  },
  ButtonSignup:{
    backgroundColor:'#F4F5F6',
    width:'59%',
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:50,
    marginTop:20,
  },
  laguage:{
    width:'100%',
    marginTop:20,
    height:50,
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
    gap:30,
  }
});
