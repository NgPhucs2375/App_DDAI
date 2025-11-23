import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/AppHeader';

export default function SettingsScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cài đặt ⚙️</Text>

        {/* UC25: Cài đặt ứng dụng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chung</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Chế độ tối (Dark Mode)</Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Thông báo nhắc nhở</Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Ngôn ngữ', 'Hiện tại chỉ hỗ trợ Tiếng Việt')}>
            <Text style={styles.label}>Ngôn ngữ</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.value}>Tiếng Việt</Text>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </View>
          </TouchableOpacity>
        </View>

        {/* UC26: Liên hệ hỗ trợ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Liên hệ', 'Email: hotro@foodapp.com\nHotline: 1900 1234')}>
            <Text style={styles.label}>Liên hệ chúng tôi</Text>
            <Ionicons name="mail-outline" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Thông tin', 'Phiên bản 1.0.0')}>
            <Text style={styles.label}>Về ứng dụng</Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#C1121F', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  label: { fontSize: 16, color: '#333' },
  value: { color: '#888', marginRight: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
});