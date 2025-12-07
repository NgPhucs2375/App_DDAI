import { API_URL } from '@/src/constants/ApiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Định nghĩa kiểu dữ liệu cơ bản
type StatData = {
  users: number;
  meals: number;
  pending_foods: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'foods' | 'feedbacks'>('stats');
  
  // State dữ liệu
  const [stats, setStats] = useState<StatData>({ users: 0, meals: 0, pending_foods: 0 });
  const [pendingFoods, setPendingFoods] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Hàm tải dữ liệu tổng hợp
  const loadData = async () => {
    setLoading(true);
    try {
        // 1. Lấy Thống kê
        const resStats = await fetch(`${API_URL}/admin/stats`);
        if (resStats.ok) setStats(await resStats.json());

        // 2. Lấy danh sách món AI học (chưa duyệt)
        const resFoods = await fetch(`${API_URL}/admin/pending-foods`);
        if (resFoods.ok) setPendingFoods(await resFoods.json());

        // 3. Lấy Feedback
        const resFb = await fetch(`${API_URL}/admin/feedbacks`);
        if (resFb.ok) setFeedbacks(await resFb.json());

    } catch (e) {
        console.error("Lỗi tải dữ liệu Admin:", e);
        // Không Alert lỗi mạng liên tục để tránh phiền, chỉ log
    } finally {
        setLoading(false);
    }
  };

  // Tự động tải lại khi vào màn hình
  useFocusEffect(useCallback(() => { loadData(); }, []));

  // --- CÁC HÀM XỬ LÝ (ACTIONS) ---
  const handleApproveFood = async (id: string) => {
    try {
        await fetch(`${API_URL}/admin/approve-food/${id}`, { method: 'POST' });
        Alert.alert("Thành công", "Đã duyệt món ăn này vào cơ sở dữ liệu chính thức!");
        loadData(); // Tải lại để cập nhật danh sách
    } catch (e) {
        Alert.alert("Lỗi", "Không thể duyệt món.");
    }
  };

  const handleDeleteFood = async (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa món rác này không?", [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa ngay", 
            style: "destructive", 
            onPress: async () => {
                try {
                    await fetch(`${API_URL}/admin/delete-food/${id}`, { method: 'DELETE' });
                    loadData();
                } catch (e) { Alert.alert("Lỗi", "Không thể xóa."); }
            }
        }
    ]);
  };

  const handleLogout = () => {
      router.replace('/login');
  };

  // --- UI COMPONENTS ---

  const renderStatCard = (label: string, value: number, icon: any, color: string, bgColor: string) => (
      <View style={[styles.statCard, { backgroundColor: bgColor }]}>
          <View style={[styles.iconBox, { backgroundColor: '#fff' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
      </View>
  );

  const renderFoodItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
        <View style={styles.cardContent}>
            <View style={styles.foodIcon}>
                <Ionicons name="fast-food" size={24} color="#FF6B6B" />
            </View>
            <View style={{flex: 1, marginLeft: 10}}>
                <Text style={styles.itemTitle}>{item.TenThucPham}</Text>
                <Text style={styles.itemSub}>
                   🔥 {item.Calories} kcal  •  🥩 {item.Protein}g Pro
                </Text>
            </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnReject} onPress={() => handleDeleteFood(item.MaThucPham)}>
                <Text style={styles.btnTextConfig}>Xóa bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnApprove} onPress={() => handleApproveFood(item.MaThucPham)}>
                <Text style={[styles.btnTextConfig, {color: '#fff'}]}>Duyệt ✔️</Text>
            </TouchableOpacity>
        </View>
    </View>
  );

  const renderFeedbackItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
            <Text style={styles.itemTitle}>{item.user_name || 'Ẩn danh'}</Text>
            <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>
        </View>
        <Text style={styles.feedbackContent}>"{item.content}"</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* 1. HEADER */}
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>ADMIN PORTAL 🛡️</Text>
            <Text style={styles.headerSub}>Hệ thống quản trị Dinh Dưỡng</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 2. TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'stats' && styles.activeTab]} onPress={() => setActiveTab('stats')}>
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>Thống kê</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'foods' && styles.activeTab]} onPress={() => setActiveTab('foods')}>
            <Text style={[styles.tabText, activeTab === 'foods' && styles.activeTabText]}>Duyệt món {stats.pending_foods > 0 && `(${stats.pending_foods})`}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'feedbacks' && styles.activeTab]} onPress={() => setActiveTab('feedbacks')}>
            <Text style={[styles.tabText, activeTab === 'feedbacks' && styles.activeTabText]}>Góp ý</Text>
        </TouchableOpacity>
      </View>

      {/* 3. CONTENT AREA */}
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="large" color="#2C3E50" style={{marginTop: 50}} /> : (
            <>
                {/* TAB THỐNG KÊ */}
                {activeTab === 'stats' && (
                    <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
                        <View style={styles.grid}>
                            {renderStatCard("Người dùng", stats.users, "people", "#3498DB", "#EBF5FB")}
                            {renderStatCard("Bữa ăn đã log", stats.meals, "restaurant", "#E67E22", "#FDF2E9")}
                            {renderStatCard("Chờ duyệt", stats.pending_foods, "hourglass", "#9B59B6", "#F4ECF7")}
                            {renderStatCard("Tổng góp ý", feedbacks.length, "chatbox", "#2ECC71", "#EAFAF1")}
                        </View>
                        
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={24} color="#555" />
                            <Text style={{flex:1, marginLeft:10, color:'#555'}}>
                                Đây là khu vực quản trị. Bạn có thể duyệt các món ăn do AI tự học để làm sạch dữ liệu hệ thống.
                            </Text>
                        </View>
                    </ScrollView>
                )}

                {/* TAB DUYỆT MÓN */}
                {activeTab === 'foods' && (
                    <FlatList
                        data={pendingFoods}
                        keyExtractor={item => item.MaThucPham}
                        renderItem={renderFoodItem}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <Ionicons name="checkmark-done-circle" size={60} color="#DDD" />
                                <Text style={styles.emptyText}>Tuyệt vời! Không có món rác nào.</Text>
                            </View>
                        }
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                        contentContainerStyle={{paddingBottom: 20}}
                    />
                )}

                {/* TAB FEEDBACK */}
                {activeTab === 'feedbacks' && (
                    <FlatList
                        data={feedbacks}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderFeedbackItem}
                        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có góp ý nào.</Text>}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                    />
                )}
            </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  
  // Header Style
  header: { backgroundColor: '#2C3E50', padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  headerSub: { color: '#BDC3C7', fontSize: 12 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 8 },

  // Tab Style
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2, padding: 5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#2C3E50' },
  tabText: { color: '#95A5A6', fontWeight: '600' },
  activeTabText: { color: '#2C3E50', fontWeight: 'bold' },

  // Content
  content: { flex: 1, padding: 15 },

  // Stats Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  statLabel: { fontSize: 12, color: '#7F8C8D' },

  infoBox: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },

  // Card Item (Food & Feedback)
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  foodIcon: { width: 50, height: 50, backgroundColor: '#FFF5F5', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemSub: { fontSize: 13, color: '#666', marginTop: 4 },
  
  actionRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  btnReject: { flex: 1, backgroundColor: '#F2F2F2', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnApprove: { flex: 1, backgroundColor: '#2ECC71', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTextConfig: { fontWeight: 'bold', color: '#555', fontSize: 13 },

  feedbackContent: { color: '#444', fontStyle: 'italic', lineHeight: 20 },
  dateText: { fontSize: 11, color: '#999' },

  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#999', marginTop: 10, textAlign: 'center' }
});