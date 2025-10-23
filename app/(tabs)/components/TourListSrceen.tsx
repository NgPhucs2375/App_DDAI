import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { tours } from '../../../src/data/tour';
import TourCard from '../../components/TourCard';

export default function TourListScreen() {
  // nếu cần gọi API, sử dụng useEffect/useState ở đây

  return (
    <View style={styles.wrap}>
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TourCard tour={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#fff' },
});

// Default export tạm để expo-router không cảnh báo
function _FoodAPIPlaceholder() {
  return null;
}