import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_FEEDBACKS = [
  { id: '1', user: 'User A', content: 'App nhận diện món phở chưa chuẩn lắm.', date: '2025-11-20' },
  { id: '2', user: 'User B', content: 'Cần thêm món Bún chả.', date: '2025-11-21' },
  { id: '3', user: 'User C', content: 'Giao diện đẹp, dễ dùng!', date: '2025-11-22' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACKS);

  const handleDelete = (id: string) => {
    Alert.alert('Xóa Feedback', 'Bạn có chắc muốn xóa?', [
      { text: 'Huỷ' },
      { text: 'Xóa', onPress: () => setFeedbacks(prev => prev.filter(f => f.id !== id)) }
    ]);
  };

  const handleLogout = () => router.replace('/login');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard 🛡️</Text>
        <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Quản lý Feedback & Comment</Text>

      <FlatList
        data={feedbacks}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.user}>{item.user}</Text>
                <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Xóa Feedback</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { backgroundColor: '#333', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  subTitle: { fontSize: 18, fontWeight: 'bold', margin: 16, color: '#333' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  user: { fontWeight: 'bold' },
  date: { color: '#888', fontSize: 12 },
  content: { marginBottom: 10, color: '#555' },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteText: { color: 'red', fontSize: 12, fontWeight: 'bold' },
});