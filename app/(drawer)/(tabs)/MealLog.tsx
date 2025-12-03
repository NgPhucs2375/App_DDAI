import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { FoodService, MealService } from '@/src/services/api'; // Thêm FoodService
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function MealLogTab() {
    const router = useRouter();
    const userId = useUserStore(s => s.profile.id);

    const [mealType, setMealType] = useState<MealType>('breakfast');
    
    // State cho tìm kiếm
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // State cho món ăn đã chọn
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [quantity, setQuantity] = useState('1'); // Mặc định là 1 phần/100g
    const [note, setNote] = useState('');

    // Hàm tìm kiếm (Debounce nhẹ)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1 && !selectedFood) {
                try {
                    const results = await FoodService.search(query);
                    if (Array.isArray(results)) {
                        setSuggestions(results);
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500); // Đợi 0.5s sau khi gõ mới tìm

        return () => clearTimeout(delayDebounceFn);
    }, [query, selectedFood]);

    const handleSelectFood = (food: any) => {
        setSelectedFood(food);
        setQuery(food.TenThucPham); // Điền tên vào ô nhập
        setQuantity('1'); // Reset số lượng
        setShowSuggestions(false);
    };

    const clearSelection = () => {
        setSelectedFood(null);
        setQuery('');
        setSuggestions([]);
        setQuantity('1');
    };

    // Tính toán dinh dưỡng dựa trên số lượng
    const multiplier = Number(quantity) || 0;
    const currentCalories = selectedFood ? Math.round(selectedFood.Calories * multiplier) : 0;
    const currentProtein = selectedFood ? (selectedFood.Protein * multiplier).toFixed(1) : 0;
    const currentCarbs = selectedFood ? (selectedFood.Carbs * multiplier).toFixed(1) : 0;
    const currentFat = selectedFood ? (selectedFood.ChatBeo * multiplier).toFixed(1) : 0;

    const onSubmit = async () => {
        if (!query.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món ăn.');
            return;
        }

        // Nếu người dùng nhập tay hoàn toàn (không chọn từ gợi ý)
        // Ta vẫn cho lưu nhưng chỉ lưu Tên và Calo do họ tự nhập (nếu có logic đó)
        // Ở đây ta ưu tiên flow chọn từ DB cho chuẩn.
        
        try {
            const finalItemName = selectedFood 
                ? `${selectedFood.TenThucPham} (${quantity} ${selectedFood.DonVi})`
                : query; // Nếu nhập tay

            const finalCalories = selectedFood ? currentCalories : 0; // Nếu nhập tay mà ko có ô nhập calo thì = 0 (hoặc bạn thêm ô nhập calo riêng cho case này)

            // Nếu chưa chọn món từ DB, cảnh báo nhẹ
            if (!selectedFood) {
                Alert.alert("Lưu ý", "Bạn đang nhập tên món mà chưa chọn từ danh sách gợi ý. Dinh dưỡng sẽ không được tính chính xác.", [
                    { text: "Hủy", style: "cancel" },
                    { text: "Vẫn lưu", onPress: () => saveMeal(finalItemName, 0, 0, 0, 0) }
                ]);
                return;
            }

            await saveMeal(finalItemName, finalCalories, Number(currentProtein), Number(currentCarbs), Number(currentFat));

        } catch (error) {
            Alert.alert('Lỗi', 'Đã có sự cố xảy ra.');
        }
    };

    const saveMeal = async (name: string, cal: number, pro: number, carb: number, fat: number) => {
        const result = await MealService.add({
            user_id: Number(userId) || 1,
            mealType: mealType,
            items: note ? `${name} - ${note}` : name,
            calories: cal,
            protein: pro,
            carbs: carb,
            fat: fat
        });

        if (result) {
            Alert.alert('Thành công', 'Đã lưu bữa ăn!', [
                { text: 'Xem lịch sử', onPress: () => router.replace('/(drawer)/(tabs)/MealHistory') },
                { text: 'Nhập tiếp', style: 'cancel', onPress: clearSelection }
            ]);
        } else {
            Alert.alert('Lỗi', 'Không lưu được.');
        }
    }

    return (
        <View style={styles.container}>
            <AppHeader />
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Thêm món ăn 🍽️</Text>

                {/* Chọn bữa */}
                <View style={styles.segmentRow}>
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.segment, mealType === t && styles.segmentActive]}
                            onPress={() => setMealType(t)}
                        >
                            <Text style={[styles.segmentText, mealType === t && styles.segmentTextActive]}>
                                {t === 'breakfast' ? 'Sáng' : t === 'lunch' ? 'Trưa' : t === 'dinner' ? 'Tối' : 'Vặt'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Ô TÌM KIẾM MÓN ĂN */}
                <Text style={styles.label}>Tên món ăn</Text>
                <View style={{position: 'relative', zIndex: 100}}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#888" style={{marginRight: 10}} />
                        <TextInput
                            placeholder="Gõ tên món (vd: Phở, Cơm...)"
                            value={query}
                            onChangeText={(text) => {
                                setQuery(text);
                                if(selectedFood) setSelectedFood(null); // Reset nếu sửa tên
                            }}
                            style={styles.searchInput}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={clearSelection}>
                                <Ionicons name="close-circle" size={20} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Danh sách gợi ý (Dropdown) */}
                    {showSuggestions && suggestions.length > 0 && (
                        <View style={styles.dropdown}>
                            {suggestions.map((item) => (
                                <TouchableOpacity key={item.MaThucPham} style={styles.suggestionItem} onPress={() => handleSelectFood(item)}>
                                    <Text style={{fontWeight: 'bold', color: '#333'}}>{item.TenThucPham}</Text>
                                    <Text style={{fontSize: 12, color: '#666'}}>{item.Calories} kcal / {item.DonVi}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* KHU VỰC CHỈNH SỐ LƯỢNG & HIỂN THỊ DINH DƯỠNG */}
                {selectedFood && (
                    <View style={styles.nutritionCard}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.foodName}>{selectedFood.TenThucPham}</Text>
                            <Text style={styles.baseUnit}>Đơn vị chuẩn: {selectedFood.DonVi}</Text>
                        </View>

                        <View style={{flexDirection:'row', alignItems:'center', marginVertical: 15}}>
                            <Text style={{fontSize: 16, marginRight: 10}}>Số lượng:</Text>
                            <TextInput
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                style={styles.qtyInput}
                                selectTextOnFocus
                            />
                            <Text style={{fontSize: 16, marginLeft: 10}}>x {selectedFood.DonVi}</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Thông số tổng */}
                        <View style={styles.macrosRow}>
                            <MacroBox label="Calo" value={currentCalories} unit="kcal" color="#E74C3C" />
                            <MacroBox label="Đạm" value={currentProtein} unit="g" color="#3498DB" />
                            <MacroBox label="Carb" value={currentCarbs} unit="g" color="#F1C40F" />
                            <MacroBox label="Béo" value={currentFat} unit="g" color="#E67E22" />
                        </View>
                    </View>
                )}

                <Text style={styles.label}>Ghi chú (Tùy chọn)</Text>
                <TextInput
                    placeholder="Thêm ghi chú..."
                    value={note}
                    onChangeText={setNote}
                    style={[styles.input, { height: 60 }]}
                    multiline
                />

                <TouchableOpacity style={styles.button} onPress={onSubmit}>
                    <Text style={styles.buttonText}>Lưu vào Nhật ký</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const MacroBox = ({label, value, unit, color}: any) => (
    <View style={{alignItems: 'center'}}>
        <Text style={{fontWeight: 'bold', fontSize: 18, color: color}}>{value}</Text>
        <Text style={{fontSize: 10, color: '#666'}}>{unit}</Text>
        <Text style={{fontSize: 12, marginTop: 2}}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 20, color: '#333' },
    
    segmentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', marginHorizontal: 4, borderWidth: 1, borderColor: '#eee' },
    segmentActive: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
    segmentText: { color: '#666', fontWeight: '500' },
    segmentTextActive: { color: '#fff', fontWeight: '700' },

    label: { fontWeight: '600', marginBottom: 8, color: '#555', marginTop: 10 },
    
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 15, height: 50 },
    searchInput: { flex: 1, fontSize: 16, height: '100%' },
    
    dropdown: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 12, padding: 5, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, maxHeight: 200 },
    suggestionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },

    nutritionCard: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginTop: 20, borderWidth: 1, borderColor: '#E0E0E0' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    foodName: { fontSize: 18, fontWeight: 'bold', color: Colors.light.tint, flex: 1 },
    baseUnit: { fontSize: 12, color: '#888' },
    
    qtyInput: { backgroundColor: '#F0F0F0', width: 60, textAlign: 'center', borderRadius: 8, paddingVertical: 5, fontSize: 18, fontWeight: 'bold', borderWidth: 1, borderColor: '#ccc' },
    
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    macrosRow: { flexDirection: 'row', justifyContent: 'space-between' },

    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15, fontSize: 16 },
    
    button: { backgroundColor: Colors.light.tint, padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 30, elevation: 3 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});