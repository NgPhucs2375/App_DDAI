import * as CommunityService from '@/src/services/api'; // Import Service
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  // Tải dữ liệu thật từ Server
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetchFeedbacks = async () => {
        try {
          const data = await (CommunityService.getFeedbacks() as unknown as Promise<any[]>);
          if (active && Array.isArray(data)) setFeedbacks(data);
        } catch (e) {
          console.warn('Failed to load feedbacks', e);
        }
      };
      fetchFeedbacks();
      return () => { active = false; };
    }, [])
  );

  const handleLogout = () => router.replace('/login');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel 🛡️</Text>
        <TouchableOpacity onPress={handleLogout}><Ionicons name="log-out-outline" size={24} color="#fff" /></TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
         <Text style={styles.subTitle}>Hòm thư góp ý ({feedbacks.length})</Text>
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50, color: '#888'}}>Chưa có phản hồi nào.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.user}>{item.user_name}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.content}>{item.content}</Text>
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
  statsContainer: { padding: 16 },
  subTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  user: { fontWeight: 'bold', color: '#2980b9' },
  date: { color: '#888', fontSize: 12 },
  content: { color: '#333' },
});