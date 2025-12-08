import { Colors } from '@/constants/theme';
import { CommunityService } from '@/src/services/api';
// import { NotificationService } from '@/src/services/NotificationService'; // <--- TẠM TẮT DÒNG NÀY
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, logout, setTheme, isDarkMode } = useUserStore();
  
  // State cho Modal phản hồi
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // State cho Thông báo (Mặc định là Tắt)
  const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        style: 'destructive', 
        onPress: () => {
          logout();
          router.replace('/login');
        }
      },
    ]);
  };

  const handleSendFeedback = async () => {
      if (!feedbackText.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập nội dung góp ý!');
          return;
      }
      try {
          const userId = Number(profile.id) || 0;
          const userName = profile.fullName || 'Người dùng ẩn danh';
          await CommunityService.sendFeedback(userId, userName, feedbackText);
          setFeedbackText('');
          setModalVisible(false);
          Alert.alert('Cảm ơn', 'Phản hồi của bạn đã được gửi đến Admin!');
      } catch (error) {
          Alert.alert('Lỗi', 'Không gửi được phản hồi.');
      }
  };

  // --- LOGIC BẬT/TẮT THÔNG BÁO (ĐÃ VÔ HIỆU HÓA TẠM THỜI) ---
  const toggleNotification = async (value: boolean) => {
    setIsNotifyEnabled(value);
    if (value) {
        // TẠM TẮT ĐỂ CHẠY EXPO GO
        // await NotificationService.setupDailyMeals();
        Alert.alert("Thông báo", "Tính năng nhắc nhở chỉ hoạt động trên bản cài đặt (APK), không hỗ trợ Expo Go.");
        
        // Tự động tắt lại switch sau 1s cho đỡ hiểu lầm
        setTimeout(() => setIsNotifyEnabled(false), 500);
    } else {
        // await NotificationService.cancelAll();
    }
  };

  const SettingItem = ({ icon, title, type = 'arrow', value, onValueChange }: any) => (
    <TouchableOpacity 
        style={styles.item} 
        onPress={type === 'arrow' ? onValueChange : undefined} 
        activeOpacity={type === 'switch' ? 1 : 0.7} 
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.iconBox, { backgroundColor: '#F0F5FF' }]}>
          <Ionicons name={icon} size={22} color={Colors.light.tint} />
        </View>
        <Text style={styles.itemText}>{title}</Text>
      </View>
      
      {type === 'arrow' && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
      
      {type === 'switch' && (
        <Switch 
            value={value} 
            onValueChange={onValueChange} 
            trackColor={{ false: "#767577", true: Colors.light.tint }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Cài đặt</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Nhóm Tài khoản */}
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <View style={styles.section}>
          <SettingItem icon="person-outline" title="Chỉnh sửa hồ sơ" onValueChange={() => router.push('/profile')} />
          <SettingItem icon="lock-closed-outline" title="Đổi mật khẩu" />
        </View>

        {/* Nhóm Chung */}
        <Text style={styles.sectionTitle}>Chung</Text>
        <View style={styles.section}>
          
          <SettingItem 
            icon="notifications-outline" 
            title="Nhắc nhở ăn uống" 
            type="switch" 
            value={isNotifyEnabled}
            onValueChange={toggleNotification}
          />

          <SettingItem 
            icon="moon-outline" 
            title="Giao diện tối (Dark Mode)" 
            type="switch" 
            value={isDarkMode} 
            onValueChange={setTheme} 
          />
        </View>

        {/* Nhóm Hỗ trợ */}
        <Text style={styles.sectionTitle}>Hỗ trợ</Text>
        <View style={styles.section}>
          <SettingItem icon="mail-outline" title="Gửi phản hồi" onValueChange={() => setModalVisible(true)} />
          <SettingItem icon="information-circle-outline" title="Về ứng dụng FitLife" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Phản hồi */}
      <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Gửi góp ý</Text>
                  <TextInput 
                      style={styles.input} 
                      placeholder="Nhập nội dung..." 
                      multiline 
                      value={feedbackText}
                      onChangeText={setFeedbackText}
                  />
                  <View style={{flexDirection:'row', justifyContent:'flex-end', gap: 10, marginTop: 15}}>
                      <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}><Text>Hủy</Text></TouchableOpacity>
                      <TouchableOpacity onPress={handleSendFeedback} style={styles.btnSend}><Text style={{color:'#fff'}}>Gửi</Text></TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40, color: '#333' },
  sectionTitle: { fontSize: 14, color: '#666', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 5, marginBottom: 25, elevation: 2 },
  
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemText: { fontSize: 16, color: '#333', fontWeight: '500' },
  
  logoutBtn: { backgroundColor: '#FFE5E5', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#FF4500', fontWeight: 'bold', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#f9f9f9', height: 100, borderRadius: 10, padding: 10, textAlignVertical: 'top' },
  btnCancel: { padding: 10 },
  btnSend: { backgroundColor: Colors.light.tint, padding: 10, borderRadius: 8, paddingHorizontal: 20 },
});