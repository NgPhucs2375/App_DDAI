import { Colors } from '@/constants/theme';
import { addMeal } from '@/src/data/mealStore';
import { loadProfile } from '@/src/data/profileStore';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ⚠️ KEY CỦA BẠN (Đã điền sẵn)
const CLARIFAI_API_KEY = 'edc81fc3e88c4031a44f19b1ff152711';
//const CALORIE_NINJAS_KEY = 'nKdMqWga1Xex0ZhWFTltzw==';
const EDAMAM_APP_ID = 'db96b1e9'; 
const EDAMAM_APP_KEY = '5dabdf6a82874ec1830132477e77c35f'; 

interface NutritionInfo {
  label: string;
  value: string;
  percentage: string;
  color: string;
}

export default function AnalysisResultScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  // State cho Modal sửa tên
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

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
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Lỗi', error.message);
      setFoodName('Không xác định');
    } finally {
      setLoading(false);
    }
  };

  const fetchClarifaiName = async (base64: string) => {
    const USER_ID = 'clarifai';
    const APP_ID = 'main';
    const MODEL_ID = 'bd367be194cf45149e75f01d59f77ba7'; // Food Model v1.0
    
    const url = `https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/models/${MODEL_ID}/outputs`;

    console.log("🤖 Đang gửi ảnh lên Clarifai...");

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Key ${CLARIFAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: [{ data: { image: { base64 } } }] }),
    });

    const data = await response.json();

    if (data.status?.code !== 10000) {
        console.error("Lỗi Clarifai:", data.status);
        throw new Error('Không nhận diện được ảnh (Lỗi API).');
    }
    
    const concepts = data.outputs[0].data.concepts;
    console.log("🔍 Kết quả AI nhìn thấy:", concepts.map((c: any) => `${c.name} (${Math.round(c.value * 100)}%)`));

    if (concepts && concepts.length > 0) {
        return concepts[0].name; 
    } else {
        throw new Error('AI không nhìn ra món gì cả.');
    }
  };

  const fetchRealNutrition = async (query: string) => {
    // Thêm "1 serving" để API dễ hiểu hơn
    const queryWithServing = `1 serving ${query}`; 
    const encodedQuery = encodeURIComponent(queryWithServing);
    
    // URL chuẩn
    const url = `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&nutrition-type=logging&ingr=${encodedQuery}`;

    console.log("🔥 Đang gọi Edamam:", url);

    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Lỗi kết nối API: ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 Dữ liệu nhận được:", data); // Log ra để kiểm tra

    // --- ĐOẠN SỬA LỖI QUAN TRỌNG ---
    // Nếu calories = 0 hoặc không có totalNutrients -> Coi như không tìm thấy
    if (!data || (data.calories === 0 && !data.totalNutrients)) {
        throw new Error('Không tìm thấy thông tin dinh dưỡng cho món này.');
    }

    // Lấy biến nutrients ra cho gọn và an toàn
    // Nếu totalNutrients không có thì gán bằng rỗng {} để không bị lỗi crash
    const nutrients = data.totalNutrients || {}; 

    setNutritionData([
        { 
            label: 'Calories', 
            value: `${data.calories || 0} kcal`, 
            percentage: '100%', 
            color: Colors.light.tint 
        },
        { 
            label: 'Protein', 
            // Dùng optional chaining (?.) và toán tử OR (||) để an toàn
            value: `${Math.round(nutrients.PROCNT?.quantity || 0)}g`, 
            percentage: '30%', 
            color: '#E9C46A' 
        },
        { 
            label: 'Carbs', 
            // CHOCDF là mã của Carbs trong Edamam
            value: `${Math.round(nutrients.CHOCDF?.quantity || 0)}g`, 
            percentage: '50%', 
            color: '#2A9D8F' 
        },
        { 
            label: 'Fat', 
            // FAT là mã của Chất béo
            value: `${Math.round(nutrients.FAT?.quantity || 0)}g`, 
            percentage: '20%', 
            color: '#F4A261' 
        },
        { 
            label: 'Sugar', 
            // SUGAR là mã của Đường
            value: `${Math.round(nutrients.SUGAR?.quantity || 0)}g`, 
            percentage: '10%', 
            color: '#FF8888' 
        },
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
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
    router.replace('/(drawer)/(tabs)/MealHistory');
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

        {/* KẾT QUẢ (Cho phép bấm vào để sửa) */}
        <View style={styles.resultCard}>
            <TouchableOpacity onPress={() => {
                setEditedName(foodName);
                setIsEditingName(true);
            }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.foodName}>{foodName || '---'}</Text>
                    <Ionicons name="pencil" size={18} color={Colors.light.tint} style={{marginLeft: 8}} />
                </View>
            </TouchableOpacity>

            {warning && <View style={styles.warningBox}><Text style={styles.warningText}>{warning}</Text></View>}

            <Text style={styles.apiCredit}>
               {loading ? '' : 'Chạm vào tên món để sửa nếu sai ✏️'}
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

      {/* MODAL SỬA TÊN MÓN */}
      <Modal visible={isEditingName} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Sửa tên món ăn</Text>
                  <Text style={{color: '#666', marginBottom: 10}}>Nhập tên tiếng Anh để tìm chuẩn nhất (vd: banana, pho, rice)</Text>

                  <TextInput 
                      style={styles.input} 
                      value={editedName} 
                      onChangeText={setEditedName}
                      autoFocus
                  />

                  <View style={styles.modalButtons}>
                      <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setIsEditingName(false)}>
                          <Text style={styles.btnText}>Huỷ</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={[styles.btn, styles.btnSave]} 
                          onPress={() => {
                              setIsEditingName(false);
                              setFoodName(editedName);
                              setStep('Đang tính lại dinh dưỡng...');
                              setLoading(true);
                              fetchRealNutrition(editedName)
                                  .then(() => setLoading(false))
                                  .catch(() => {
                                      Alert.alert('Lỗi', 'Không tìm thấy thông tin dinh dưỡng cho món này');
                                      setLoading(false);
                                  });
                          }}
                      >
                          <Text style={[styles.btnText, {color: '#fff'}]}>Cập nhật</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
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

  // --- CÁC STYLES BỔ SUNG CHO MODAL ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#fafafa' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: Colors.light.tint },
  btnText: { fontWeight: '600', fontSize: 16 },
});