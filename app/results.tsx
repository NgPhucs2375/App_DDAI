import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/theme';
import { loadProfile } from '../src/data/profileStore';

// Lấy API Key từ app.json
const CLARIFAI_API_KEY = (Constants.expoConfig?.extra as any)?.CLARIFAI_API_KEY || '';

// Interface cho dữ liệu dinh dưỡng
interface NutritionInfo {
  label: string;
  value: string;
  percentage: string;
  color: string;
}

export default function AnalysisResultScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const [loading, setLoading] = useState(true);
  const [foodName, setFoodName] = useState<string>('Đang phân tích...');
  const [nutritionData, setNutritionData] = useState<NutritionInfo[]>([]);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  // 1. Tự động chạy phân tích khi mở màn hình
  useEffect(() => {
    loadUserAllergies();
    if (imageUri) {
      analyzeImage(imageUri);
    }
  }, [imageUri]);

  // 2. Tải dị ứng của người dùng để cảnh báo (UC19)
  const loadUserAllergies = async () => {
    const profile = await loadProfile();
    if (profile?.allergies) {
      setUserAllergies(profile.allergies.map(a => a.toLowerCase()));
    }
  };

  // 3. Hàm gọi API Clarifai
  const analyzeImage = async (uri: string) => {
    try {
      setLoading(true);
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

      const USER_ID = 'clarifai';
      const APP_ID = 'main';
      const MODEL_ID = 'food-item-recognition';
      const url = `https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/models/${MODEL_ID}/outputs`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Key ${CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: [{ data: { image: { base64 } } }] }),
      });

      const data = await response.json();
      if (data.status?.code !== 10000) throw new Error('Không thể nhận diện ảnh.');

      const bestGuess = data.outputs[0].data.concepts[0].name;
      setFoodName(bestGuess);
      
      // Kiểm tra dị ứng
      checkAllergy(bestGuess);

      // Giả lập dữ liệu dinh dưỡng (UC12 - Định lượng)
      generateMockNutrition(bestGuess);

    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
      setFoodName('Không nhận diện được');
    } finally {
      setLoading(false);
    }
  };

  // Logic cảnh báo dị ứng (UC19)
  const checkAllergy = (food: string) => {
    const found = userAllergies.find(allergy => food.toLowerCase().includes(allergy));
    if (found) {
      setWarning(`⚠️ Cảnh báo: Món này có thể chứa ${found}!`);
    }
  };

// DATABASE GIẢ LẬP (Dictionary)
const FOOD_DB: Record<string, any> = {
  'pho': { cal: 450, pro: 20, carb: 60, fat: 12, label: 'Phở Bò' },
  'burger': { cal: 550, pro: 25, carb: 45, fat: 28, label: 'Hamburger' },
  'pizza': { cal: 280, pro: 12, carb: 35, fat: 10, label: 'Pizza (1 lát)' },
  'salad': { cal: 150, pro: 5, carb: 10, fat: 8, label: 'Salad Rau' },
  'rice': { cal: 300, pro: 6, carb: 60, fat: 2, label: 'Cơm Trắng' },
  'egg': { cal: 70, pro: 6, carb: 1, fat: 5, label: 'Trứng Luộc' },
};

const generateMockNutrition = (name: string) => {
  // Tìm kiếm trong DB (so sánh tương đối)
  const key = Object.keys(FOOD_DB).find(k => name.toLowerCase().includes(k)) || 'unknown';
  
  let data;
  if (key !== 'unknown') {
    data = FOOD_DB[key];
    setFoodName(data.label); // Cập nhật tên tiếng Việt đẹp hơn
  } else {
    // Fallback nếu không tìm thấy: Random nhưng có logic
    data = { cal: 200, pro: 10, carb: 20, fat: 5 }; 
    setFoodName(name); // Giữ nguyên tên tiếng Anh từ AI
  }

  setNutritionData([
    { label: 'Calories', value: `${data.cal} kcal`, percentage: '100%', color: Colors.light.tint },
    { label: 'Protein', value: `${data.pro}g`, percentage: '30%', color: '#E9C46A' },
    { label: 'Carbs', value: `${data.carb}g`, percentage: '50%', color: '#2A9D8F' },
    { label: 'Fat', value: `${data.fat}g`, percentage: '20%', color: '#F4A261' },
  ]);
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Kết quả Phân tích</Text>
            <View style={{width: 24}} />
        </View>

        {/* ẢNH & TRẠNG THÁI */}
        <View style={styles.imageBox}>
           {imageUri && <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />}
           {loading && (
             <View style={styles.loadingOverlay}>
               <ActivityIndicator size="large" color="#fff" />
               <Text style={styles.loadingText}>AI đang phân tích...</Text>
             </View>
           )}
        </View>

        {/* KẾT QUẢ TÊN MÓN */}
        <View style={styles.resultCard}>
            <Text style={styles.foodName}>{foodName}</Text>
            {warning && <Text style={styles.warningText}>{warning}</Text>}
        </View>

        {/* DINH DƯỠNG */}
        {!loading && (
            <View style={styles.nutritionList}>
                {nutritionData.map((item, index) => (
                    <View key={index} style={styles.barContainer}>
                        <View style={styles.barHeader}>
                            <Text style={styles.barLabel}>{item.label}</Text>
                            <Text style={styles.barValue}>{item.value}</Text>
                        </View>
                        <View style={styles.track}>
                            <View style={[styles.fill, { width: item.percentage as any, backgroundColor: item.color }]} />
                        </View>
                    </View>
                ))}
            </View>
        )}

        {/* NÚT LƯU */}
        {!loading && (
            <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={() => {
                    Alert.alert('Đã lưu', 'Đã thêm vào nhật ký bữa ăn!');
                    router.replace('/(drawer)/(tabs)/MealHistory');
                }}
            >
                <Text style={styles.saveBtnText}>+ Thêm vào Nhật ký</Text>
            </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backBtn: { padding: 5 },
  
  imageBox: { height: 250, borderRadius: 20, overflow: 'hidden', backgroundColor: '#ddd', marginBottom: 20 },
  image: { width: '100%', height: '100%' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontWeight: '600' },

  resultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  foodName: { fontSize: 24, fontWeight: 'bold', color: Colors.light.tint, textTransform: 'capitalize' },
  warningText: { color: '#D32F2F', marginTop: 10, fontWeight: 'bold', fontSize: 15 },

  nutritionList: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20 },
  barContainer: { marginBottom: 15 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  barLabel: { fontSize: 15, color: '#555', fontWeight: '500' },
  barValue: { fontWeight: 'bold', color: '#333' },
  track: { height: 8, backgroundColor: '#eee', borderRadius: 4 },
  fill: { height: '100%', borderRadius: 4 },

  saveBtn: { backgroundColor: Colors.light.tint, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});