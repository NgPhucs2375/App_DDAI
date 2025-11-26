import { deleteFeedback, Feedback, loadFeedbacks } from '@/src/data/feedbackStore'; // Import Store
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router'; // Thêm useFocusEffect
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Load dữ liệu thật mỗi khi vào màn hình
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await loadFeedbacks();
    setFeedbacks(data);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa phản hồi này?', [
      { text: 'Huỷ', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive',
        onPress: async () => {
            const updated = await deleteFeedback(id);
            setFeedbacks(updated);
        } 
      }
    ]);
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard 🛡️</Text>
        <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
         <Text style={styles.subTitle}>Hòm thư góp ý ({feedbacks.length})</Text>
         <TouchableOpacity onPress={loadData}>
            <Ionicons name="refresh" size={20} color="#333" />
         </TouchableOpacity>
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
            <Text style={{textAlign: 'center', marginTop: 50, color: '#888'}}>Chưa có phản hồi nào.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.user}>{item.user}</Text>
                <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Đã xử lý / Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { backgroundColor: '#2c3e50', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 16 },
  subTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  user: { fontWeight: 'bold', color: '#2980b9', fontSize: 16 },
  date: { color: '#888', fontSize: 12 },
  content: { marginBottom: 15, color: '#333', lineHeight: 20 },
  deleteBtn: { alignSelf: 'flex-end', padding: 5 },
  deleteText: { color: '#c0392b', fontSize: 12, fontWeight: 'bold' },
});