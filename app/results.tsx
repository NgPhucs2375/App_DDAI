import { API_URL } from '@/src/constants/ApiConfig';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AnalysisResultScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (imageUri) {
      analyzePhoto(imageUri);
    }
  }, [imageUri]);

  const analyzePhoto = async (uri: string) => {
    try {
      setLoading(true);
      
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

      // Gọi API phân tích
      const response = await fetch(`${API_URL}/analyze/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64 }),
      });

      const data = await response.json();
      setResult(data);

    } catch (error) {
      Alert.alert("Lỗi", "Không kết nối được Server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!result?.success) return;
    try {
        await fetch(`${API_URL}/meals/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 1, // Thay bằng ID user thật của bạn nếu cần
                mealType: 'lunch',
                items: result.food_name,
                calories: result.calories,
                protein: result.macros?.protein || 0,
                carbs: result.macros?.carbs || 0,
                fat: result.macros?.fat || 0
            }),
        });
        Alert.alert("Thành công", "Đã lưu vào Nhật ký!");
        router.replace('/(drawer)/(tabs)/MealHistory'); 
    } catch (e) {
        Alert.alert("Lỗi", "Không lưu được.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 1. ẢNH CHỤP (Full Width đẹp mắt) */}
      <View style={styles.imageHeader}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 2. TRẠNG THÁI LOADING */}
      {loading && (
        <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>AI đang phân tích món ăn...</Text>
        </View>
      )}

      {/* 3. KẾT QUẢ PHÂN TÍCH */}
      {!loading && result && (
        <View style={styles.resultContainer}>
            
            {/* TÊN MÓN & CALO */}
            <View style={styles.titleSection}>
                <View style={{flex: 1}}>
                    <Text style={styles.foodName}>{result.food_name}</Text>
                    <Text style={styles.unitText}>{result.unit || "1 phần tiêu chuẩn"}</Text>
                </View>
                <View style={styles.caloriesBadge}>
                    <Text style={styles.calVal}>{Math.round(result.calories)}</Text>
                    <Text style={styles.calLabel}>KCAL</Text>
                </View>
            </View>

            {/* THANH MACROS (Dinh dưỡng chính) */}
            <View style={styles.macrosCard}>
                <MacroItem 
                    label="Đạm (Protein)" 
                    value={result.macros?.protein} 
                    color="#4ECDC4" 
                    icon="fitness"
                />
                <View style={styles.verticalDivider} />
                <MacroItem 
                    label="Đường (Carbs)" 
                    value={result.macros?.carbs} 
                    color="#FF6B6B" 
                    icon="pizza"
                />
                <View style={styles.verticalDivider} />
                <MacroItem 
                    label="Béo (Fat)" 
                    value={result.macros?.fat} 
                    color="#FFE66D" 
                    icon="water"
                />
            </View>

            {/* VI CHẤT (Chất xơ & Vitamin) */}
            <View style={styles.microRow}>
                <View style={styles.microItem}>
                    <Ionicons name="leaf" size={18} color="#2ECC71" />
                    <Text style={styles.microText}>Xơ: {result.micros?.fiber}g</Text>
                </View>
                <View style={styles.microItem}>
                    <Ionicons name="flask" size={18} color="#9B59B6" />
                    <Text style={styles.microText}>Vitamin: {result.micros?.vitamin}</Text>
                </View>
            </View>

            {/* THÔNG BÁO TỪ AI */}
            <View style={styles.aiBox}>
                <Ionicons name="sparkles" size={20} color="#F1C40F" style={{marginRight: 8}} />
                <Text style={styles.aiText}>{result.message}</Text>
            </View>

            {/* NÚT LƯU */}
            {result.success && (
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToHistory}>
                    <Text style={styles.saveBtnText}>Lưu vào Nhật ký</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
      )}
    </ScrollView>
  );
}

// Component con hiển thị từng Macro
const MacroItem = ({ label, value, color, icon }: any) => (
    <View style={styles.macroCol}>
        <Ionicons name={icon} size={24} color={color} style={{marginBottom: 5}} />
        <Text style={styles.macroValue}>{value}<Text style={{fontSize:12, fontWeight:'normal'}}>g</Text></Text>
        <Text style={styles.macroLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FA' },
  
  imageHeader: { width: '100%', height: 300, backgroundColor: '#ddd' },
  image: { width: '100%', height: '100%' },
  closeBtn: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },

  loadingBox: { marginTop: 50, alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#666', fontSize: 16 },

  resultContainer: { 
    marginTop: -30, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25, 
    minHeight: 500,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 
  },

  titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  foodName: { fontSize: 24, fontWeight: '800', color: '#2D3436', flex: 1, marginRight: 10 },
  unitText: { fontSize: 14, color: '#888', marginTop: 4 },
  
  caloriesBadge: { 
    backgroundColor: '#FF6B6B', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 16, 
    alignItems: 'center', minWidth: 80 
  },
  calVal: { color: '#fff', fontSize: 22, fontWeight: '800' },
  calLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 'bold' },

  macrosCard: { 
    flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 20, padding: 20, 
    justifyContent: 'space-between', marginBottom: 20, borderWidth: 1, borderColor: '#eee' 
  },
  macroCol: { alignItems: 'center', flex: 1 },
  macroValue: { fontSize: 18, fontWeight: '700', color: '#2D3436' },
  macroLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  verticalDivider: { width: 1, backgroundColor: '#E0E0E0', height: '80%' },

  microRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  microItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', flex: 0.48 
  },
  microText: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: '#555' },

  aiBox: { 
    flexDirection: 'row', backgroundColor: '#FFF9C4', padding: 15, borderRadius: 12, 
    marginBottom: 30, alignItems: 'center' 
  },
  aiText: { flex: 1, fontSize: 14, color: '#7F6000', lineHeight: 20 },

  saveBtn: { 
    backgroundColor: '#2D3436', paddingVertical: 18, borderRadius: 16, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 10 }
});