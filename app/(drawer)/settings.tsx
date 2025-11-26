import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme'; // ✅ Import đúng phải là dòng này
import { sendFeedback } from '@/src/data/feedbackStore';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const { isDarkMode, setTheme, profile } = useUserStore();

  // State cho Modal Góp ý
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập nội dung góp ý!');
        return;
    }
    
    // Gửi dữ liệu thật vào Store
    await sendFeedback(feedbackText, profile.fullName || 'Người dùng ẩn danh');
    
    setFeedbackText('');
    setModalVisible(false);
    Alert.alert('Cảm ơn', 'Phản hồi của bạn đã được gửi đến Admin!');
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cài đặt ⚙️</Text>

        {/* Phần Chung */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chung</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Chế độ tối (Dark Mode)</Text>
            <Switch value={isDarkMode} onValueChange={(val) => setTheme(val)} />
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

        {/* Phần Hỗ trợ & Phản hồi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          
          {/* Nút mở Modal Góp ý */}
          <TouchableOpacity style={styles.row} onPress={() => setModalVisible(true)}>
            <Text style={styles.label}>Gửi phản hồi cho Admin</Text>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Liên hệ', 'Hotline: 1900 1234')}>
            <Text style={styles.label}>Liên hệ Hotline</Text>
            <Ionicons name="call-outline" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Thông tin', 'Phiên bản 2.0.0 (Pro)')}>
            <Text style={styles.label}>Về ứng dụng</Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* MODAL NHẬP PHẢN HỒI */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Góp ý / Báo lỗi</Text>
                <Text style={{color:'#666', marginBottom:10}}>Ý kiến của bạn giúp ứng dụng tốt hơn:</Text>
                
                <TextInput 
                    style={styles.input} 
                    multiline 
                    placeholder="Nhập nội dung tại đây..." 
                    value={feedbackText}
                    onChangeText={setFeedbackText}
                />
                
                <View style={styles.modalButtons}>
                    <Button title="Huỷ" onPress={() => setModalVisible(false)} color="#888"/>
                    <Button title="Gửi ngay" onPress={handleSendFeedback} color={Colors.light.tint}/>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.light.tint, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  label: { fontSize: 16, color: '#333' },
  value: { color: '#888', marginRight: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, height: 100, textAlignVertical: 'top', fontSize: 16, marginBottom: 15, backgroundColor: '#fafafa' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 }
});