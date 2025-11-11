//========================================================//
//==                   Trang chi tiết                   ==//
//========================================================//

import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../../../components/AppHeader';
import { Colors } from '../../../constants/theme';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: Colors.light.text,
  },
   text: { fontSize: 22, fontWeight: 'bold' },
});
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
      <AppHeader />
      
      {/* BODY */}
      <Text style={styles.title}>Thông tin chi tiết</Text>
      {userName ? ( <Text style={styles.text}>
        Chào,{userName}! Rất vui được gặp bạn 👋 !</Text>) :
         (<Text style={styles.text}>Không có tên người dùng được cung cấp.</Text>)}

         <Button title="Quay lại" onPress = {() => router.back()}/>
    </View>
  );
}