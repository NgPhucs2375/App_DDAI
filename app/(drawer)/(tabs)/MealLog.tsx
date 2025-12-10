import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { FoodService, MealService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker'; // 👇 Import ImagePicker
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated, Dimensions, Image,
    Keyboard, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';

const { width } = Dimensions.get('window');
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
    
    // 👇 State for selected image
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => { loadRecents(); }, []);

    const loadRecents = async () => {
        try {
            const history = await MealService.getHistory(Number(userId));
            if (history && Array.isArray(history)) {
                const unique = history.slice(0, 5).map(h => ({
                    MaThucPham: 'RECENT_' + h.id, 
                    TenThucPham: h.items ? h.items.split('(')[0].trim() : 'Món cũ',
                    Calories: h.calories, DonVi: 'phần',
                    Protein: h.protein, Carbs: h.carbs, ChatBeo: h.fat
                }));
                setRecentFoods(unique);
            }
        } catch (e) { console.log("Lỗi tải lịch sử:", e); }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1 && !selectedFood) {
                setIsSearching(true);
                try {
                    const results = await FoodService.search(query);
                    if (Array.isArray(results) && results.length > 0) {
                        setSuggestions(results);
                        setShowSuggestions(true);
                    } else setSuggestions([]);
                } catch (error) { console.error(error); } finally { setIsSearching(false); }
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

    // 👇 Function to pick image from gallery
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true, // Crucial: Get base64 string for upload
        });

        if (!result.canceled && result.assets[0].base64) {
            setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const onSubmit = async () => {
        if (!query.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập tên món.'); return; }

        const finalItemName = selectedFood 
            ? `${selectedFood.TenThucPham} (${quantity} ${selectedFood.DonVi})`
            : query; 
        
        const multiplier = Number(quantity) || 0;
        const cal = selectedFood ? Math.round(selectedFood.Calories * multiplier) : 0;
        const pro = selectedFood ? Number((selectedFood.Protein * multiplier).toFixed(1)) : 0;
        const carb = selectedFood ? Number((selectedFood.Carbs * multiplier).toFixed(1)) : 0;
        const fat = selectedFood ? Number((selectedFood.ChatBeo * multiplier).toFixed(1)) : 0;

        try {
            // 👇 Send API request with image base64
            const result = await MealService.add({
                user_id: Number(userId) || 1,
                mealType: mealType,
                items: note ? `${finalItemName} - ${note}` : finalItemName,
                calories: cal, protein: pro, carbs: carb, fat: fat,
                image_base64: selectedImage || undefined // Send image if selected
            });

            if (result) {
                updateStreak();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Đã lưu! 🎉', 'Món ăn đã được thêm.', [
                    { text: 'Xong', onPress: () => {
                        setSelectedFood(null); setQuery(''); setQuantity('1'); setNote(''); setSelectedImage(null);
                        router.replace('/(drawer)/(tabs)/MealHistory');
                    }}
                ]);
            }
        } catch (error) { Alert.alert('Lỗi', 'Không thể lưu.'); }
    };

    return (
        <View style={styles.container}>
            <AppHeader />
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                
                {/* 1. MEAL SELECTION */}
                <View style={styles.mealSelector}>
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                        <TouchableOpacity key={t} style={[styles.mealTab, mealType === t && styles.mealTabActive]} onPress={() => setMealType(t)}>
                            <Text style={styles.mealEmoji}>{t === 'breakfast' ? '🍳' : t === 'lunch' ? '🍱' : t === 'dinner' ? '🍲' : '🍿'}</Text>
                            <Text style={[styles.mealText, mealType === t && styles.mealTextActive]}>
                                {t === 'breakfast' ? 'Sáng' : t === 'lunch' ? 'Trưa' : t === 'dinner' ? 'Tối' : 'Vặt'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 2. SEARCH BOX */}
                <Text style={styles.sectionTitle}>Tìm kiếm món ăn</Text>
                <View style={{ zIndex: 100, marginBottom: 20 }}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color={Colors.light.tint} style={{marginRight: 10}} />
                        <TextInput
                            placeholder="Gõ tên món (vd: Phở...)"
                            value={query}
                            onChangeText={(t) => { setQuery(t); if(selectedFood) setSelectedFood(null); }}
                            style={styles.searchInput}
                            onFocus={() => { if (!query && recentFoods.length) { setSuggestions(recentFoods); setShowSuggestions(true); }}}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => { setQuery(''); setSelectedFood(null); }}>
                                <Ionicons name="close-circle" size={20} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <View style={styles.dropdown}>
                            <ScrollView style={{maxHeight: 220}} keyboardShouldPersistTaps="handled">
                                {suggestions.map((item, index) => (
                                    <TouchableOpacity key={index} style={styles.suggestItem} onPress={() => handleSelectFood(item)}>
                                        <View style={{flex:1}}>
                                            <Text style={styles.suggestName}>{item.TenThucPham}</Text>
                                            <Text style={styles.suggestCalo}>{item.Calories} kcal / {item.DonVi}</Text>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color={Colors.light.tint} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* 3. NUTRITION CARD (If food selected) */}
                {selectedFood && (
                    <Animated.View style={styles.nutritionCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{selectedFood.TenThucPham}</Text>
                            <View style={styles.caloBadge}><Text style={styles.caloNum}>{Math.round(selectedFood.Calories * Number(quantity))}</Text><Text style={styles.caloUnit}>kcal</Text></View>
                        </View>
                        <View style={styles.qtyContainer}>
                            <Text style={{color: '#666', marginBottom: 5}}>Số lượng ({selectedFood.DonVi}):</Text>
                            <View style={styles.qtyControl}>
                                <TouchableOpacity onPress={() => changeQuantity(-0.5)} style={styles.qtyBtn}><Ionicons name="remove" size={20} color="#fff" /></TouchableOpacity>
                                <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={styles.qtyInput} />
                                <TouchableOpacity onPress={() => changeQuantity(0.5)} style={styles.qtyBtn}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.macroSection}>
                            <MacroBar label="Đạm" value={(selectedFood.Protein * Number(quantity)).toFixed(1)} color="#4ECDC4" />
                            <MacroBar label="Carb" value={(selectedFood.Carbs * Number(quantity)).toFixed(1)} color="#FF6B6B" />
                            <MacroBar label="Béo" value={(selectedFood.ChatBeo * Number(quantity)).toFixed(1)} color="#FFE66D" />
                        </View>
                    </Animated.View>
                )}

                {/* 4. 👇 IMAGE PICKER SECTION (NEW) */}
                <Text style={[styles.sectionTitle, {marginTop: 10}]}>Hình ảnh (Tùy chọn)</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                    ) : (
                        <View style={{alignItems: 'center'}}>
                            <Ionicons name="camera-outline" size={30} color="#999" />
                            <Text style={{color: '#999', marginTop: 5}}>Thêm ảnh minh họa</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, {marginTop: 20}]}>Ghi chú</Text>
                <TextInput placeholder="VD: Không hành..." value={note} onChangeText={setNote} style={styles.noteInput} multiline />

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
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 15, height: 54, borderWidth: 1, borderColor: '#E0E0E0', elevation: 2 },
    searchInput: { flex: 1, fontSize: 16, height: '100%' },
    dropdown: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 14, elevation: 8, zIndex: 999 },
    suggestItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    suggestName: { fontWeight: '600', fontSize: 15, color: '#2D3436' },
    suggestCalo: { fontSize: 13, color: Colors.light.tint, marginTop: 2 },
    nutritionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3, borderLeftWidth: 5, borderLeftColor: Colors.light.tint },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 20, fontWeight: '800', color: '#2D3436', flex: 1 },
    caloBadge: { backgroundColor: '#2D3436', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center', flexDirection: 'row', gap: 2 },
    caloNum: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    caloUnit: { color: '#bbb', fontSize: 10 },
    qtyContainer: { marginBottom: 15 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 5 },
    qtyBtn: { width: 40, height: 40, backgroundColor: Colors.light.tint, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    qtyInput: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#333' },
    macroSection: { marginTop: 5 },
    
    // Style Image Picker
    imagePicker: { height: 150, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    
    noteInput: { backgroundColor: '#fff', borderRadius: 14, padding: 15, height: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E0E0E0', fontSize: 15 },
    submitBtn: { backgroundColor: Colors.light.tint, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 16, marginTop: 30, elevation: 6 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 10, letterSpacing: 1 },
});