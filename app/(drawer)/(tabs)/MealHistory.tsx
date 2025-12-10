import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { MealService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image // Đã import Image
  ,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

// Skeleton Loading Component
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
  const userId = useUserStore(s => s.profile.id);
  const [data, setData] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null); 

  const loadData = useCallback(async () => {
    if (!refreshing) setLoading(true); 
    try {
      if (userId) {
        const meals = await MealService.getHistory(Number(userId));
        if (Array.isArray(meals)) {
            setData(meals);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
        "Xác nhận xóa", 
        `Bạn có chắc muốn xóa món "${name}" không?`,
        [
            { text: "Hủy", style: "cancel" },
            { 
                text: "Xóa", 
                style: "destructive", 
                onPress: async () => {
                    const success = await MealService.delete(id);
                    if (success) {
                        const newMeals = data.filter(m => m.id !== id);
                        setData(newMeals);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    } else {
                        Alert.alert("Lỗi", "Không thể xóa món này.");
                    }
                }
            }
        ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable renderRightActions={() => (
        <TouchableOpacity 
            style={styles.deleteAction} 
            onPress={() => handleDelete(item.id, item.items)}
        >
            <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
    )}>
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7} 
        onPress={() => {
            Haptics.selectionAsync();
            setSelectedItem(item);
        }}
      >
        {/* HEADER CỦA CARD (ĐÃ SỬA ĐỂ HIỆN ẢNH) */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8}}>
            <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>
                    {item.mealType === 'breakfast' ? '🍳 Sáng' : item.mealType === 'lunch' ? '🍱 Trưa' : item.mealType === 'dinner' ? '🍲 Tối' : '🍿 Ăn vặt'}
                </Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString('vi-VN')} • {new Date(item.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</Text>
            </View>

            {/* 👇 HIỂN THỊ ẢNH NẾU CÓ */}
            {item.image_url ? (
                <Image 
                    source={{ uri: item.image_url }} 
                    style={styles.foodImage} 
                    resizeMode="cover"
                />
            ) : null}
        </View>

        <Text style={styles.cardText} numberOfLines={2}>{item.items}</Text>
        
        <View style={styles.footerRow}>
           <Text style={styles.badge}>{item.calories} kcal</Text>
           {item.protein > 0 && <Text style={styles.subBadge}>Đạm: {item.protein}g</Text>}
           {item.fat > 0 && <Text style={styles.subBadge}>Béo: {item.fat}g</Text>}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={{paddingHorizontal: 20, paddingVertical: 15}}>
         <Text style={{fontSize: 22, fontWeight: '800', color: '#333'}}>Lịch sử ăn uống 📅</Text>
         <Text style={{fontSize: 13, color: '#888'}}>Vuốt sang trái để xóa</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.list}><SkeletonItem /><SkeletonItem /><SkeletonItem /></View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={data}
          keyExtractor={(x) => x.id.toString()}
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

      {/* Modal Chi Tiết Món Ăn */}
      <Modal visible={!!selectedItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {/* Ảnh to trong Modal */}
                {selectedItem?.image_url && (
                    <Image 
                        source={{ uri: selectedItem.image_url }} 
                        style={styles.modalImage} 
                        resizeMode="cover"
                    />
                )}
                
                <Text style={styles.modalTitle}>{selectedItem?.items}</Text>
                <View style={styles.modalDivider}/>
                
                <View style={styles.modalRow}>
                    <Text style={{fontSize:16}}>🔥 Calo:</Text> 
                    <Text style={{fontWeight:'bold', fontSize:16, color:'#E74C3C'}}>{selectedItem?.calories} kcal</Text>
                </View>
                <View style={styles.modalRow}>
                    <Text style={{fontSize:16}}>🥩 Đạm:</Text> 
                    <Text style={{fontWeight:'bold', fontSize:16, color:'#3498DB'}}>{selectedItem?.protein}g</Text>
                </View>
                <View style={styles.modalRow}>
                    <Text style={{fontSize:16}}>🍚 Carb:</Text> 
                    <Text style={{fontWeight:'bold', fontSize:16, color:'#F1C40F'}}>{selectedItem?.carbs}g</Text>
                </View>
                <View style={styles.modalRow}>
                    <Text style={{fontSize:16}}>🥑 Béo:</Text> 
                    <Text style={{fontWeight:'bold', fontSize:16, color:'#E67E22'}}>{selectedItem?.fat}g</Text>
                </View>

                <TouchableOpacity 
                    style={styles.closeBtn} 
                    onPress={() => setSelectedItem(null)}
                >
                    <Text style={{color:'#fff', fontWeight:'bold', fontSize:16}}>Đóng</Text>
                </TouchableOpacity>
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
  
  // Style ảnh nhỏ trong Card
  foodImage: { width: 50, height: 50, borderRadius: 10, marginLeft: 10, backgroundColor: '#eee' },
  
  cardTitle: { fontWeight: '700', color: Colors.light.tint, textTransform: 'uppercase', fontSize: 12 },
  time: { color: '#999', fontSize: 11, marginTop: 2 },
  cardText: { color: '#333', fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 5 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: '#555', fontWeight: '700', fontSize: 13, overflow: 'hidden' },
  subBadge: { fontSize: 12, color: '#888' },
  
  deleteAction: { 
    backgroundColor: '#FF5252', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 80, 
    height: '100%', 
    borderRadius: 16, 
    marginLeft: 10,
    marginBottom: 15 
  },
  
  emptyBox: { alignItems: 'center', marginTop: 50 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, elevation: 5 },
  // Style ảnh to trong Modal
  modalImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 15, backgroundColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
  modalDivider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9', paddingBottom: 8 },
  closeBtn: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 15 }
});