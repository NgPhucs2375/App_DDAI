import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { loadMeals, Meal, removeMeal } from '@/src/data/mealStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // Rung phản hồi
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Animated // Dùng cho Animation Skeleton
    ,

    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

// --- COMPONENT SKELETON LOADING (UX PRO) ---
const SkeletonItem = () => {
  const opacity = new Animated.Value(0.3);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.card}>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 10}}>
            <Animated.View style={{width: 80, height: 20, backgroundColor: '#E0E0E0', borderRadius: 4, opacity}} />
            <Animated.View style={{width: 50, height: 15, backgroundColor: '#E0E0E0', borderRadius: 4, opacity}} />
        </View>
        <Animated.View style={{width: '60%', height: 24, backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 10, opacity}} />
        <Animated.View style={{width: 40, height: 15, backgroundColor: '#E0E0E0', borderRadius: 4, opacity}} />
    </View>
  );
};

export default function MealHistoryTab() {
  const [data, setData] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Meal | null>(null);

  const loadData = useCallback(async () => {
    // Không set loading=true khi refresh để tránh giật màn hình
    if (!refreshing) setLoading(true); 
    try {
      const meals = await loadMeals();
      // Giả lập delay mạng một chút để thấy hiệu ứng Skeleton (0.5s)
      await new Promise(r => setTimeout(r, 500)); 
      setData(meals);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDelete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); // Rung cảnh báo
    Alert.alert('Xác nhận', 'Xóa bữa ăn này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
            const updatedList = await removeMeal(id);
            setData(updatedList);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Rung xác nhận
        },
      },
    ]);
  };

  const openEditModal = (item: Meal) => {
    Haptics.selectionAsync();
    setEditingItem({ ...item });
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setData((prev) => prev.map((item) => (item.id === editingItem.id ? editingItem : item)));
    setModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderItem = ({ item }: { item: Meal }) => (
    <Swipeable renderRightActions={() => (
        <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
    )}>
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => openEditModal(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {item.mealType === 'breakfast' ? 'Sáng' : item.mealType === 'lunch' ? 'Trưa' : item.mealType === 'dinner' ? 'Tối' : 'Ăn vặt'}
          </Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
        </View>
        <Text style={styles.cardText}>{item.items}</Text>
        <View style={styles.footerRow}>
           <Text style={styles.badge}>{item.calories} kcal</Text>
           <Ionicons name="create-outline" size={16} color={Colors.light.icon} />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={{paddingHorizontal: 20, paddingVertical: 15}}>
         <Text style={{fontSize: 22, fontWeight: '800', color: '#333'}}>Lịch sử 📅</Text>
         <Text style={{fontSize: 13, color: '#888'}}>Vuốt để xóa • Chạm để sửa</Text>
      </View>

      {loading && !refreshing ? (
        // HIỂN THỊ SKELETON KHI LOADING
        <View style={styles.list}>
            <SkeletonItem /><SkeletonItem /><SkeletonItem />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={data}
          keyExtractor={(x) => x.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
          ListFooterComponent={data.length === 0 ? 
            <View style={styles.emptyBox}>
                <Ionicons name="fast-food-outline" size={40} color="#ccc" />
                <Text style={{color: '#999', marginTop: 10}}>Chưa có bữa ăn nào</Text>
            </View> : null
          }
        />
      )}

      {/* Modal Sửa giữ nguyên UI nhưng thêm Haptics ở trên */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa</Text>
            <TextInput style={styles.input} value={editingItem?.items} onChangeText={(t) => setEditingItem(prev => prev ? ({ ...prev, items: t }) : null)} />
            <TextInput style={styles.input} keyboardType="numeric" value={editingItem?.calories?.toString()} onChangeText={(t) => setEditingItem(prev => prev ? ({ ...prev, calories: Number(t) }) : null)} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}>Huỷ</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveEdit}><Text style={[styles.btnText, { color: '#fff' }]}>Lưu</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  list: { padding: 20, paddingTop: 0, gap: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontWeight: '700', color: Colors.light.tint, textTransform: 'uppercase', fontSize: 12 },
  time: { color: '#999', fontSize: 12 },
  cardText: { color: '#333', fontSize: 18, fontWeight: '600', marginBottom: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: '#555', fontWeight: '700', fontSize: 13, overflow: 'hidden' },
  deleteAction: { backgroundColor: '#FF5252', justifyContent: 'center', alignItems: 'center', width: 80, height: '84%', marginTop: 0, borderRadius: 16, marginLeft: 10 },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 16, backgroundColor: '#FAFAFA' },
  modalButtons: { flexDirection: 'row', gap: 15, marginTop: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  btnCancel: { backgroundColor: '#F0F0F0' },
  btnSave: { backgroundColor: Colors.light.tint },
  btnText: { fontWeight: '700', fontSize: 15 },
});