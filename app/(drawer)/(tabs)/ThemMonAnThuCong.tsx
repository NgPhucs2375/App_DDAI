import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Alert,
  ListRenderItem,
  Platform, 
} from 'react-native';
import { useRouter } from 'expo-router'; // Dùng để chuyển hướng
import AppHeader from '../../../components/AppHeader'; // Component Header tùy chỉnh

// --- 1. ĐỊNH NGHĨA INTERFACE (Kiểu dữ liệu TypeScript) ---
interface Food {
  id: string;
  name: string;
  calories: number;
}

// --- Dữ liệu giả định ---
const foodDatabase: Food[] = [
  { id: '1', name: 'Phở Bò', calories: 400 },
  { id: '2', name: 'Bánh Mì Thịt', calories: 350 },
  { id: '3', 'name': 'Cơm Gà Xối Mỡ', calories: 650 },
  { id: '4', name: 'Bún Chả', calories: 480 },
  { id: '5', name: 'Gỏi Cuốn Tôm Thịt', calories: 200 },
];

const LIGHT_BLUE = '#7DD3FC';
const TEXT_COLOR = '#4A4A4A';
const BORDER_COLOR = '#D1D5DB';

// --- Component Chính ---
export default function AddManualFoodScreen() {
  const router = useRouter(); 
  
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Food[]>([]); 
  const [selectedFood, setSelectedFood] = useState<Food | null>(null); 
  const [quantity, setQuantity] = useState<string>('1');

  // --- Logic Tìm kiếm ---
  const handleSearch = (text: string) => { 
    setSearchText(text);
    if (text.length > 1) {
      const filtered = foodDatabase.filter(food =>
        food.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
    setSelectedFood(null);
  };

  // --- Logic Chọn món ---
  const selectFoodItem = (food: Food) => { 
    setSelectedFood(food);
    setSearchResults([]);
    setSearchText(food.name); 
  };
  const handleCameraPress = () => {
    router.push('/(drawer)/(tabs)/KetQuaAI'); // Bây giờ 'router' đã được định nghĩa và hoạt động
    console.log('--- Đã nhấn: Chuyển đến màn hình Kết quả AI (/nutrition-result) ---');
  };
  // --- Logic LƯU và CHUYỂN HƯỚNG ---
  const handleSave = () => {
    if (!selectedFood) return; 

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Lỗi", "Số lượng không hợp lệ.");
      return;
    }
    
    const totalCalories = selectedFood.calories * qty;
    
    // Hiển thị Alert và xử lý chuyển hướng trong onPress của nút OK
    Alert.alert(
      "Đã Lưu vào Nhật Ký",
      `Bạn đã thêm ${qty} phần ${selectedFood.name}.\nTổng Calo: ${totalCalories} kcal`,
      [
        {
          text: "OK",
          onPress: () => {
            // Chuyển hướng đến màn hình KetQuaAI
            router.replace('/(drawer)/(tabs)/KetQuaAI'); 
            
            // Reset form sau khi chuyển hướng
            setSearchText('');
            setSelectedFood(null);
            setQuantity('1');
          }
        }
      ]
    );
  };

  // --- Render Item FlatList ---
  const renderItem: ListRenderItem<Food> = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem} 
      onPress={() => selectFoodItem(item)}
    >
      <Text style={styles.resultText}>{item.name}</Text>
      <Text style={styles.resultCalorie}>{item.calories} kcal</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.fullScreen}> 
      {/* 1. APPHEADER */}
      <AppHeader />
      
      <SafeAreaView style={styles.contentSafeArea}>
        <View style={styles.container}>
          
          {/* Tiêu đề nội dung */}
          <Text style={styles.contentTitle}>🍽️ Thêm Món Ăn Thủ Công</Text> 
          
          {/* --- 1. FORM TÌM KIẾM --- */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Tìm kiếm món ăn:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập tên món ăn..."
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>

          {/* --- 2. KẾT QUẢ TÌM KIẾM --- */}
          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={styles.list} 
                keyboardShouldPersistTaps="always"
              />
            </View>
          )}

          {/* --- 3. FORM NHẬP SỐ LƯỢNG VÀ LƯU --- */}
          {selectedFood && (
            <View style={styles.detailsContainer}>
              <Text style={styles.selectedTitle}>Món đã chọn: {selectedFood.name}</Text>
              <Text style={styles.selectedCalorie}>~ {selectedFood.calories} kcal/phần</Text>
              
              <Text style={styles.label}>Nhập Số Lượng:</Text>
              <TextInput
                style={styles.quantityInput}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleCameraPress}>
                <Text style={styles.saveButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { 
    flex: 1, 
    backgroundColor: '#F8F8F8',
    // Xử lý padding cho Android nếu cần
    paddingTop: Platform.OS === 'android' ? 25 : 0, 
  },
  contentSafeArea: {
    flex: 1,
  },
  container: { flex: 1, padding: 20 },
  contentTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: TEXT_COLOR }, 
  label: { fontSize: 16, color: TEXT_COLOR, fontWeight: '600', marginBottom: 8, marginTop: 15 },
  formContainer: { marginBottom: 10 },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  resultsContainer: { 
    maxHeight: 200, 
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 5,
  },
  list: { 
    flexGrow: 0,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultText: { fontSize: 16, color: TEXT_COLOR, fontWeight: '500' },
  resultCalorie: { fontSize: 14, color: '#888' },
  detailsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: LIGHT_BLUE,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  selectedTitle: { fontSize: 18, fontWeight: 'bold', color: LIGHT_BLUE, marginBottom: 5 },
  selectedCalorie: { fontSize: 14, color: '#666', marginBottom: 15 },
  quantityInput: {
    height: 50,
    width: 80,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: LIGHT_BLUE,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});