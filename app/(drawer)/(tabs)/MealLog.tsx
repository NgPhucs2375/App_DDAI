import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { FoodService, MealService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// --- COMPONENT CON: THANH TIẾN ĐỘ MACRO ---
const MacroBar = ({ label, value, max = 50, color }: any) => {
    const percent = Math.min((value / max) * 100, 100);
    return (
        <View style={{marginBottom: 12}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                <Text style={{fontSize: 12, color: '#666', fontWeight: '600'}}>{label}</Text>
                <Text style={{fontSize: 12, fontWeight: 'bold', color: '#333'}}>{value}g</Text>
            </View>
            <View style={{height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'hidden'}}>
                <View style={{width: `${percent}%`, height: '100%', backgroundColor: color, borderRadius: 3}} />
            </View>
        </View>
    );
};

export default function MealLogTab() {
    const router = useRouter();
    const userId = useUserStore(s => s.profile.id);
    const { updateStreak } = useUserStore();

    const [mealType, setMealType] = useState<MealType>('breakfast');
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [recentFoods, setRecentFoods] = useState<any[]>([]); 
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [quantity, setQuantity] = useState('1'); 
    const [note, setNote] = useState('');

    // Load món hay ăn khi mở màn hình
    useEffect(() => {
        loadRecents();
    }, []);

    const loadRecents = async () => {
        try {
            const history = await MealService.getHistory(Number(userId));
            if (history && Array.isArray(history)) {
                const unique = history.slice(0, 5).map(h => ({
                    MaThucPham: 'RECENT_' + h.id, 
                    TenThucPham: h.items ? h.items.split('(')[0].trim() : 'Món cũ',
                    Calories: h.calories,
                    DonVi: 'phần',
                    Protein: h.protein, Carbs: h.carbs, ChatBeo: h.fat
                }));
                setRecentFoods(unique);
            }
        } catch (e) {
            console.log("Lỗi tải lịch sử:", e);
        }
    };

    // Tìm kiếm thông minh (Debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1 && !selectedFood) {
                setIsSearching(true);
                try {
                    const results = await FoodService.search(query);
                    if (Array.isArray(results) && results.length > 0) {
                        setSuggestions(results);
                        setShowSuggestions(true);
                    } else {
                        setSuggestions([]);
                    }
                } catch (error) {
                    console.error("Lỗi tìm kiếm:", error);
                } finally {
                    setIsSearching(false);
                }
            } else if (query.trim().length === 0) {
                setSuggestions(recentFoods);
                setIsSearching(false);
            }
        }, 400); 

        return () => clearTimeout(delayDebounceFn);
    }, [query, selectedFood, recentFoods]);

    const handleSelectFood = (food: any) => {
        Haptics.selectionAsync();
        setSelectedFood(food);
        setQuery(food.TenThucPham); 
        setQuantity('1'); 
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    const changeQuantity = (amount: number) => {
        const newVal = Math.max(0.1, Number(quantity) + amount);
        setQuantity(newVal.toFixed(1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Tính toán dinh dưỡng
    const multiplier = Number(quantity) || 0;
    const currentCalories = selectedFood ? Math.round(selectedFood.Calories * multiplier) : 0;
    const currentProtein = selectedFood ? (selectedFood.Protein * multiplier).toFixed(1) : 0;
    const currentCarbs = selectedFood ? (selectedFood.Carbs * multiplier).toFixed(1) : 0;
    const currentFat = selectedFood ? (selectedFood.ChatBeo * multiplier).toFixed(1) : 0;

    const onSubmit = async () => {
        if (!query.trim()) {
            Alert.alert('Chưa nhập tên món', 'Vui lòng chọn hoặc nhập tên món ăn.');
            return;
        }

        const finalItemName = selectedFood 
            ? `${selectedFood.TenThucPham} (${quantity} ${selectedFood.DonVi})`
            : query; 

        try {
            if (!selectedFood) {
                Alert.alert("Món tự nhập", "Bạn đang nhập món chưa có trong dữ liệu. Calo sẽ bằng 0.", [
                    { text: "Hủy", style: "cancel" },
                    { text: "Lưu luôn", onPress: () => performSave(finalItemName, 0, 0, 0, 0) }
                ]);
            } else {
                await performSave(finalItemName, currentCalories, Number(currentProtein), Number(currentCarbs), Number(currentFat));
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu.');
        }
    };

    const performSave = async (name: string, cal: number, pro: number, carb: number, fat: number) => {
        const result = await MealService.add({
            user_id: Number(userId) || 1,
            mealType: mealType,
            items: note ? `${name} - ${note}` : name,
            calories: cal, protein: pro, carbs: carb, fat: fat
        });

        if (result) {
            updateStreak();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Đã lưu! 🎉', 'Món ăn đã được thêm vào nhật ký.', [
                { text: 'Xem lịch sử', onPress: () => router.replace('/(drawer)/(tabs)/MealHistory') },
                { text: 'Thêm món khác', style: 'cancel', onPress: () => {
                    setSelectedFood(null);
                    setQuery('');
                    setQuantity('1');
                    setNote('');
                }}
            ]);
        }
    };

    return (
        // 👇 ĐÃ BỎ TouchableWithoutFeedback Ở NGOÀI CÙNG -> KHẮC PHỤC LỖI SCROLL
        <View style={styles.container}>
            <AppHeader />
            <ScrollView 
                contentContainerStyle={styles.content} 
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag" // 👇 Vuốt màn hình sẽ tắt bàn phím
                onScrollBeginDrag={() => {
                    setShowSuggestions(false); // 👇 Vuốt màn hình sẽ tắt gợi ý
                    Keyboard.dismiss();
                }}
            >
                
                {/* 1. CHỌN BỮA ĂN */}
                <View style={styles.mealSelector}>
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.mealTab, mealType === t && styles.mealTabActive]}
                            onPress={() => { setMealType(t); Haptics.selectionAsync(); }}
                        >
                            <Text style={[styles.mealEmoji]}>
                                {t === 'breakfast' ? '🍳' : t === 'lunch' ? '🍱' : t === 'dinner' ? '🍲' : '🍿'}
                            </Text>
                            <Text style={[styles.mealText, mealType === t && styles.mealTextActive]}>
                                {t === 'breakfast' ? 'Sáng' : t === 'lunch' ? 'Trưa' : t === 'dinner' ? 'Tối' : 'Vặt'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Tìm kiếm món ăn</Text>

                {/* 2. THANH TÌM KIẾM & DANH SÁCH GỢI Ý */}
                <View style={{ zIndex: 100, marginBottom: 20 }}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color={Colors.light.tint} style={{marginRight: 10}} />
                        <TextInput
                            placeholder="Gõ tên món (vd: Phở, Cơm...)"
                            value={query}
                            onChangeText={(text) => {
                                setQuery(text);
                                if(selectedFood) setSelectedFood(null); 
                            }}
                            style={styles.searchInput}
                            onFocus={() => {
                                if (query.length === 0 && recentFoods.length > 0) {
                                    setSuggestions(recentFoods);
                                    setShowSuggestions(true);
                                }
                            }}
                        />
                        {isSearching ? <ActivityIndicator size="small" color={Colors.light.tint} /> : 
                         query.length > 0 && (
                            <TouchableOpacity onPress={() => { setQuery(''); setSelectedFood(null); }}>
                                <Ionicons name="close-circle" size={20} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* LIST GỢI Ý */}
                    {showSuggestions && suggestions.length > 0 && (
                        <View style={styles.dropdown}>
                            <View style={styles.dropdownHeader}>
                                <Text style={styles.dropdownTitle}>
                                    {query.length === 0 ? "🕒 Món hay ăn" : "🔎 Kết quả tìm kiếm"}
                                </Text>
                            </View>
                            <ScrollView 
                                style={{maxHeight: 220}} 
                                nestedScrollEnabled={true} 
                                keyboardShouldPersistTaps="handled"
                            >
                                {suggestions.map((item, index) => (
                                    <TouchableOpacity 
                                        key={item.MaThucPham || index} 
                                        style={styles.suggestItem} 
                                        onPress={() => handleSelectFood(item)}
                                    >
                                        <View style={styles.suggestInfo}>
                                            <Text style={styles.suggestName}>{item.TenThucPham}</Text>
                                            <Text style={styles.suggestCalo}>
                                                {item.Calories} kcal <Text style={{color:'#999'}}>/ {item.DonVi}</Text>
                                            </Text>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color={Colors.light.tint} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    
                    {showSuggestions && suggestions.length === 0 && query.length > 1 && !isSearching && (
                         <View style={styles.dropdown}>
                            <Text style={{padding:15, textAlign:'center', color:'#999'}}>Không tìm thấy món này</Text>
                         </View>
                    )}
                </View>

                {/* 3. CARD DINH DƯỠNG */}
                {selectedFood && (
                    <Animated.View style={styles.nutritionCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{selectedFood.TenThucPham}</Text>
                            <View style={styles.caloBadge}>
                                <Text style={styles.caloNum}>{currentCalories}</Text>
                                <Text style={styles.caloUnit}>kcal</Text>
                            </View>
                        </View>

                        <View style={styles.qtyContainer}>
                            <Text style={{color: '#666', marginBottom: 5}}>Số lượng ({selectedFood.DonVi}):</Text>
                            <View style={styles.qtyControl}>
                                <TouchableOpacity onPress={() => changeQuantity(-0.5)} style={styles.qtyBtn}>
                                    <Ionicons name="remove" size={20} color="#fff" />
                                </TouchableOpacity>
                                <TextInput
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="numeric"
                                    style={styles.qtyInput}
                                />
                                <TouchableOpacity onPress={() => changeQuantity(0.5)} style={styles.qtyBtn}>
                                    <Ionicons name="add" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.macroSection}>
                            <MacroBar label="Đạm (Protein)" value={currentProtein} color="#4ECDC4" />
                            <MacroBar label="Tinh bột (Carbs)" value={currentCarbs} color="#FF6B6B" />
                            <MacroBar label="Chất béo (Fat)" value={currentFat} color="#FFE66D" />
                        </View>
                    </Animated.View>
                )}

                <Text style={[styles.sectionTitle, {marginTop: 20}]}>Ghi chú thêm</Text>
                <TextInput
                    placeholder="VD: Không hành, ít nước béo..."
                    value={note}
                    onChangeText={setNote}
                    style={styles.noteInput}
                    multiline
                />

                <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
                    <Text style={styles.submitText}>LƯU VÀO NHẬT KÝ</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </TouchableOpacity>

                <View style={{height: 100}} /> 
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    content: { padding: 20 },
    mealSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, backgroundColor: '#fff', padding: 5, borderRadius: 16, elevation: 2 },
    mealTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
    mealTabActive: { backgroundColor: '#FFF0E6' },
    mealEmoji: { fontSize: 20, marginBottom: 4 },
    mealText: { fontSize: 12, color: '#999', fontWeight: '600' },
    mealTextActive: { color: '#FF5722', fontWeight: 'bold' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436', marginBottom: 10 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 15, height: 54, borderWidth: 1, borderColor: '#E0E0E0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    searchInput: { flex: 1, fontSize: 16, height: '100%' },
    dropdown: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 14, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, zIndex: 999, paddingVertical: 5 },
    dropdownHeader: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#FAFAFA', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
    dropdownTitle: { fontSize: 12, color: '#888', fontWeight: '700', textTransform: 'uppercase' },
    suggestItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    suggestInfo: { flex: 1 },
    suggestName: { fontWeight: '600', fontSize: 15, color: '#2D3436' },
    suggestCalo: { fontSize: 13, color: Colors.light.tint, marginTop: 2, fontWeight: '500' },
    nutritionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderLeftWidth: 5, borderLeftColor: Colors.light.tint },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 20, fontWeight: '800', color: '#2D3436', flex: 1, marginRight: 10 },
    caloBadge: { backgroundColor: '#2D3436', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center' },
    caloNum: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    caloUnit: { color: '#bbb', fontSize: 10 },
    qtyContainer: { marginBottom: 15 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 5 },
    qtyBtn: { width: 40, height: 40, backgroundColor: Colors.light.tint, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    qtyInput: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    macroSection: { marginTop: 5 },
    noteInput: { backgroundColor: '#fff', borderRadius: 14, padding: 15, height: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E0E0E0', fontSize: 15 },
    submitBtn: { backgroundColor: Colors.light.tint, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 16, marginTop: 30, shadowColor: Colors.light.tint, shadowOpacity: 0.3, shadowOffset: {width: 0, height: 5}, elevation: 6 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 10, letterSpacing: 1 },
});