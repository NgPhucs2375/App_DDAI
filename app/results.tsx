import { API_URL } from '@/src/constants/ApiConfig';
import { useUserStore } from '@/src/store/userStore'; // <--- Import Store
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- SKELETON LOADER (Giữ nguyên) ---
const SkeletonLoader = () => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return (
        <View style={styles.resultContainer}>
             <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 20}}>
                <Animated.View style={{width: 150, height: 24, backgroundColor: '#E0E0E0', borderRadius: 4, opacity}} />
                <Animated.View style={{width: 80, height: 40, backgroundColor: '#E0E0E0', borderRadius: 16, opacity}} />
             </View>
             <Animated.View style={{width: '100%', height: 100, backgroundColor: '#E0E0E0', borderRadius: 12, opacity}} />
        </View>
    );
};

export default function AnalysisResultScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { profile } = useUserStore(); // <--- Lấy thông tin User thật
  const { updateStreak } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (imageUri && profile.id) {
      analyzePhoto(imageUri);
    }
  }, [imageUri]);

  const analyzePhoto = async (uri: string) => {
    try {
      setLoading(true);
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

      // Gửi kèm user_id để check dị ứng
      const response = await fetch(`${API_URL}/analyze/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            image_base64: base64,
            user_id: profile.id // <--- ID thật của người dùng
        }),
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
        const response = await fetch(`${API_URL}/meals/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: profile.id, // <--- SỬA LỖI: Dùng ID thật thay vì số 1
                mealType: 'lunch', // (Có thể mở rộng logic chọn bữa sau)
                items: result.food_name,
                calories: result.calories,
                protein: result.macros?.protein || 0,
                carbs: result.macros?.carbs || 0,
                fat: result.macros?.fat || 0
            }),
        });

        if (response.ok) {
            updateStreak();
            Alert.alert("Thành công", "Đã lưu vào nhật ký! Dữ liệu sẽ hiển thị ngay.", [
                { text: "OK", onPress: () => router.replace('/') } // Về trang chủ để thấy cập nhật
            ]);
        } else {
            Alert.alert("Lỗi", "Server không lưu được dữ liệu.");
        }
    } catch (e) {
        Alert.alert("Lỗi mạng", "Không thể kết nối tới Server.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      <View style={styles.imageHeader}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? <SkeletonLoader /> : (
        result && (
            <View style={styles.resultContainer}>
                {/* ⚠️ CẢNH BÁO DỊ ỨNG (QUAN TRỌNG) */}
                {result.warning ? (
                    <View style={styles.warningBox}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                            <Ionicons name="warning" size={28} color="#fff" />
                            <Text style={styles.warningTitle}>CẢNH BÁO DỊ ỨNG!</Text>
                        </View>
                        <Text style={styles.warningText}>{result.warning}</Text>
                    </View>
                ) : null}

                {/* TIÊU ĐỀ */}
                <View style={styles.titleSection}>
                    <View style={{flex: 1}}>
                        <Text style={styles.foodName}>{result.food_name}</Text>
                        <Text style={styles.unitText}>{result.unit}</Text>
                    </View>
                    <View style={styles.caloriesBadge}>
                        <Text style={styles.calVal}>{Math.round(result.calories)}</Text>
                        <Text style={{color:'#fff', fontSize:10, fontWeight:'bold'}}>KCAL</Text>
                    </View>
                </View>

                {/* MACROS */}
                <View style={styles.macrosCard}>
                    <MacroItem label="Đạm" value={result.macros?.protein} color="#4ECDC4" />
                    <View style={styles.divider} />
                    <MacroItem label="Carb" value={result.macros?.carbs} color="#FF6B6B" />
                    <View style={styles.divider} />
                    <MacroItem label="Béo" value={result.macros?.fat} color="#FFE66D" />
                </View>

                {/* NHẬN XÉT AI */}
                <View style={styles.aiBox}>
                    <Text style={styles.aiText}>💡 {result.message}</Text>
                </View>

                {/* NÚT LƯU */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToHistory}>
                    <Text style={styles.saveBtnText}>Lưu & Cập nhật trang chủ</Text>
                </TouchableOpacity>
            </View>
        )
      )}
    </ScrollView>
  );
}

const MacroItem = ({ label, value, color }: any) => (
    <View style={{alignItems: 'center', flex: 1}}>
        <Text style={{fontSize: 18, fontWeight: '800', color}}>{value}g</Text>
        <Text style={{fontSize: 12, color: '#999'}}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff' },
  imageHeader: { width: '100%', height: 350 },
  image: { width: '100%', height: '100%' },
  closeBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 20 },
  
  resultContainer: { marginTop: -40, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 600 },
  
  // Style Cảnh báo
  warningBox: { backgroundColor: '#D32F2F', padding: 15, borderRadius: 12, marginBottom: 20, shadowColor: 'red', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  warningTitle: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  warningText: { color: '#fff', marginTop: 5, fontSize: 15, lineHeight: 22 },

  titleSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  foodName: { fontSize: 24, fontWeight: '800', color: '#333', flex: 1, marginRight: 10 },
  unitText: { color: '#888' },
  caloriesBadge: { backgroundColor: '#FF6B6B', padding: 10, borderRadius: 12, alignItems: 'center', minWidth: 70 },
  calVal: { color: '#fff', fontSize: 20, fontWeight: '900' },

  macrosCard: { flexDirection: 'row', backgroundColor: '#FAFAFA', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  divider: { width: 1, backgroundColor: '#eee', height: '100%' },

  aiBox: { backgroundColor: '#F0F8FF', padding: 15, borderRadius: 12, marginBottom: 30 },
  aiText: { color: '#2C3E50', fontSize: 15, lineHeight: 22 },

  saveBtn: { backgroundColor: '#2D3436', padding: 18, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});