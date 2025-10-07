//========================================================//
//==                   Trang chi tiết                   ==//
//========================================================//

import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34495e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  text: {
    fontSize: 18,
    color: '#ecf0f1',
    marginBottom: 25,
  },});

export default function DetailsScreen() {

  const router = useRouter();
  const {userName} = useLocalSearchParams();// Lấy tham số userName từ URL
  return (
    // <View style={styles.container}>
    //   <Text style={styles.title}>Thông tin chi tiết</Text>
    //   <Text style={styles.text}>Đây là màn hình chi tiết sản phẩm hoặc nội dung</Text>
    //   <Button 
    //   title ="Quay lại"
    //   onPress={() => router.back()}/>
    // </View>

    <View style={styles.container}>
      <Text style={styles.title}>Thông tin chi tiết</Text>
      {userName ? ( <Text style={styles.text}>
        Chào,{userName}! Rất vui được gặp bạn 👋 !</Text>) :
         (<Text style={styles.text}>Không có tên người dùng được cung cấp.</Text>)}

         <Button title="Quay lại" onPress = {() => router.back()}/>
    </View>
  );
}