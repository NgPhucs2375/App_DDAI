import { Colors } from '@/constants/theme';
import { addMeal } from '@/src/data/mealStore';
import { loadProfile } from '@/src/data/profileStore';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics'; // Import Rung
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

// ⚠️ KEY CỦA BẠN (Giữ nguyên key cũ của bạn)
const CLARIFAI_API_KEY = (Constants.expoConfig?.extra as any)?.CLARIFAI_API_KEY || '';
const CALORIE_NINJAS_KEY = 'sMLT540LFc9N0TN3FAQZHg==tEYWQLdKLn9z0kr4'; 

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
  const [step, setStep] = useState('');
  const [foodName, setFoodName] = useState<string>('');
  const [nutritionData, setNutritionData] = useState<NutritionInfo[]>([]);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    loadUserAllergies();
    if (imageUri) {
      processImagePipeline(imageUri);
    }
  }, [imageUri]);

  const loadUserAllergies = async () => {
    const profile = await loadProfile();
    if (profile?.allergies) setUserAllergies(profile.allergies.map(a => a.toLowerCase()));
  };

  const processImagePipeline = async (uri: string) => {
    try {
      setLoading(true);
      setStep('AI đang phân tích ảnh...');
      
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const clarifaiName = await fetchClarifaiName(base64);
      
      setFoodName(clarifaiName);
      checkAllergy(clarifaiName);

      setStep('Đang tra cứu dinh dưỡng...');
      await fetchRealNutrition(clarifaiName);
      
      // Rung báo thành công khi xong hết
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Rung báo lỗi
      Alert.alert('Lỗi', error.message);
      setFoodName('Không xác định');
    } finally {
      setLoading(false);
    }
  };

  const fetchClarifaiName = async (base64: string) => {
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
    if (data.status?.code !== 10000) throw new Error('Không nhận diện được ảnh.');
    return data.outputs[0].data.concepts[0].name;
  };

  const fetchRealNutrition = async (query: string) => {
    const url = `https://api.calorieninjas.com/v1/nutrition?query=${query}`;
    console.log("Đang gọi API:", url);
    const response = await fetch(url, {
      headers: { 'X-Api-Key': CALORIE_NINJAS_KEY }
    });
    
if (!response.ok) {
        const text = await response.text();
        console.error("LỖI API CALORIE:", text); // Xem log này nó báo gì?
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Không tìm thấy dữ liệu dinh dưỡng.');
    }

    const item = data.items[0];
    setNutritionData([
      { label: 'Calories', value: `${item.calories} kcal`, percentage: '100%', color: Colors.light.tint },
      { label: 'Protein', value: `${item.protein_g}g`, percentage: '30%', color: '#E9C46A' },
      { label: 'Carbs', value: `${item.carbohydrates_total_g}g`, percentage: '50%', color: '#2A9D8F' },
      { label: 'Fat', value: `${item.fat_total_g}g`, percentage: '20%', color: '#F4A261' },
      { label: 'Sugar', value: `${item.sugar_g}g`, percentage: '10%', color: '#FF8888' },
    ]);
  };

  const checkAllergy = (food: string) => {
    const found = userAllergies.find(allergy => food.toLowerCase().includes(allergy));
    if (found) {
        setWarning(`⚠️ CẢNH BÁO: Món này có chứa ${found.toUpperCase()}!`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Rung khi ấn lưu
    
    const calValue = nutritionData.find(n => n.label === 'Calories')?.value.replace(' kcal', '');
    const newMeal = {
      id: Date.now().toString(),
      mealType: 'lunch' as const,
      items: foodName,
      calories: Number(calValue) || 0,
      createdAt: new Date().toISOString(),
    };
    await addMeal(newMeal);
    Alert.alert('Thành công', 'Đã thêm vào nhật ký!');
    router.replace('/(drawer)/(tabs)/MealHistory'); // Quay về lịch sử
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Kết quả phân tích</Text>
            <View style={{width: 24}} />
        </View>

        <View style={styles.imageBox}>
           {imageUri && <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />}
           {loading && (
             <View style={styles.loadingOverlay}>
               <ActivityIndicator size="large" color="#fff" />
               <Text style={styles.loadingText}>{step}</Text>
             </View>
           )}
        </View>

        <View style={styles.resultCard}>
            <Text style={styles.foodName}>{foodName || '---'}</Text>
            {warning && <View style={styles.warningBox}><Text style={styles.warningText}>{warning}</Text></View>}
            <Text style={styles.apiCredit}>
               {loading ? '' : 'Verified by CalorieNinjas API ✅'}
            </Text>
        </View>

        {!loading && nutritionData.length > 0 && (
            <View style={styles.nutritionList}>
                {nutritionData.map((item, index) => (
                    <View key={index} style={styles.barContainer}>
                        <View style={styles.barHeader}>
                            <Text style={styles.barLabel}>{item.label}</Text>
                            <Text style={styles.barValue}>{item.value}</Text>
                        </View>
                        <View style={styles.track}>
                            <View style={[styles.fill, { width: (Math.min(parseFloat(item.value), 100) + '%') as any, backgroundColor: item.color }]} />
                        </View>
                    </View>
                ))}
            </View>
        )}

        {!loading && (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>+ Lưu vào Nhật ký</Text>
            </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F9FC' },
  container: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  backBtn: { padding: 5 },
  
  imageBox: { height: 260, borderRadius: 20, overflow: 'hidden', backgroundColor: '#ddd', marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2 },
  image: { width: '100%', height: '100%' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 15, fontWeight: '600', fontSize: 16 },
  
  resultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 20, elevation: 2 },
  foodName: { fontSize: 26, fontWeight: '800', color: Colors.light.tint, textTransform: 'capitalize', marginBottom: 5 },
  warningBox: { backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8, marginTop: 10, width: '100%' },
  warningText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  apiCredit: { color: '#999', marginTop: 10, fontSize: 12, fontStyle: 'italic' },
  
  nutritionList: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, elevation: 2 },
  barContainer: { marginBottom: 15 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 15, color: '#555', fontWeight: '600' },
  barValue: { fontWeight: '700', color: '#333' },
  track: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4 },
  fill: { height: '100%', borderRadius: 4 },
  
  saveBtn: { backgroundColor: Colors.light.tint, padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 40, shadowColor: Colors.light.tint, shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
});