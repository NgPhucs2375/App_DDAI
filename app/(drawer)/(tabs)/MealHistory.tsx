import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Modal,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

type Meal = {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: string;
  calories?: number;
  createdAt: string; // ISO
};

export default function MealHistoryTab() {
  const [data, setData] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // State cho Modal Sửa (UC13)
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Meal | null>(null);

  // 1. Load Data (Giữ nguyên logic cũ của bạn)
  const loadPage = useCallback(async (reset = false) => {
    if (reset) { setPage(1); setHasMore(true); }
    if (!hasMore && !reset) return;
    try {
      if (!reset) setLoading(true);
      // Demo giả lập
      const demo: Meal[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${reset ? 1 : page}-${i}`,
        mealType: (['breakfast', 'lunch', 'dinner', 'snack'] as const)[i % 4],
        items: reset && i === 0 ? 'Phở bò (Demo)' : 'Món ăn demo',
        calories: 300 + i * 10,
        createdAt: new Date(Date.now() - i * 36e5).toISOString(),
      }));
      setData(reset ? demo : [...data, ...demo]);
      setHasMore((reset ? 1 : page) < 5);
      setPage((reset ? 1 : page) + 1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data, hasMore, page]);

  useEffect(() => { loadPage(true); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPage(true);
  };

  // 2. Xử lý XÓA (UC14)
  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bữa ăn này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => setData((prev) => prev.filter((item) => item.id !== id)),
      },
    ]);
  };

  // 3. Xử lý SỬA (UC13)
  const openEditModal = (item: Meal) => {
    setEditingItem({ ...item });
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setData((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    setModalVisible(false);
    Alert.alert('Thành công', 'Đã cập nhật thông tin bữa ăn.');
  };

  // UI Nút Xóa khi vuốt
  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDelete(id)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Xóa</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Meal }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => openEditModal(item)} // Nhấn để sửa
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {item.mealType === 'breakfast' ? 'Bữa sáng' : item.mealType === 'lunch' ? 'Bữa trưa' : item.mealType === 'dinner' ? 'Bữa tối' : 'Ăn vặt'}
          </Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
        </View>
        
        <Text style={styles.cardText}>{item.items}</Text>
        <View style={styles.footerRow}>
           {!!item.calories && <Text style={styles.badge}>{item.calories} kcal</Text>}
           <Ionicons name="create-outline" size={16} color={Colors.light.icon} />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={{paddingHorizontal: 16, paddingVertical: 10}}>
         <Text style={{fontSize: 18, fontWeight: 'bold', color: Colors.light.text}}>Lịch sử ăn uống 📅</Text>
         <Text style={{fontSize: 12, color: '#888'}}>Vuốt trái để xóa • Chạm để sửa</Text>
      </View>

      {loading && data.length === 0 ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={data}
          keyExtractor={(x) => x.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={() => loadPage(false)}
          onEndReachedThreshold={0.2}
          ListFooterComponent={hasMore ? <ActivityIndicator /> : <Text style={styles.footer}>Hết dữ liệu</Text>}
        />
      )}

      {/* MODAL SỬA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa bữa ăn</Text>
            
            <Text style={styles.label}>Tên món:</Text>
            <TextInput
              style={styles.input}
              value={editingItem?.items}
              onChangeText={(t) => setEditingItem(prev => prev ? ({ ...prev, items: t }) : null)}
            />

            <Text style={styles.label}>Calo (kcal):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editingItem?.calories?.toString()}
              onChangeText={(t) => setEditingItem(prev => prev ? ({ ...prev, calories: Number(t) }) : null)}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveEdit}>
                <Text style={[styles.btnText, { color: '#fff' }]}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontWeight: '600', color: Colors.light.text },
  time: { color: Colors.light.icon, fontSize: 12 },
  cardText: { color: Colors.light.text, fontSize: 16, marginBottom: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    color: Colors.light.tint,
    fontWeight: 'bold',
    fontSize: 12,
    overflow: 'hidden',
  },
  footer: { textAlign: 'center', color: Colors.light.icon, paddingVertical: 12 },
  
  deleteAction: {
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%', 
    marginBottom: 10, // Khớp với marginBottom của card
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { marginBottom: 6, fontWeight: '500', color: '#555' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: Colors.light.tint },
  btnText: { fontWeight: '600', fontSize: 16 },
});