import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TourListScreen from '../../src/components/TourListSrceen';

const Tab = createBottomTabNavigator();

// ============ STYLE ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0288D1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5bc0de',
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
});

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* Avatar */}
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        {/* Ô tìm kiếm */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Tìm kiếm..."
            placeholderTextColor="#555"
            style={styles.searchInput}
          />
        </View>

        {/* Nút bên phải */}
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View style={styles.content}>
        <Text style={styles.title}>Trang chủ</Text>
        <Button title="Xem chi tiết" onPress={() => router.push('/details')} />

        {/* <View style={{ flex: 1, width: '100%' }}>
          <Tab.Navigator>
            <Tab.Screen name="Tours" component={TourListScreen} />
          </Tab.Navigator>
        </View> */}
         <View style={{ flex: 1, width: '100%' }}>
            <TourListScreen />
         </View>

      </View>
    </View>
  );
}
