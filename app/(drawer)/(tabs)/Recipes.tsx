import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ⚠️ Key của bạn (Giữ nguyên nếu đã đúng)
const EDAMAM_APP_ID = '4aa0c3f0'; 
const EDAMAM_APP_KEY = '89337a9fcd49b6bb6cdc9ddf554be77e';

type Recipe = {
  uri: string;
  label: string;
  image: string;
  calories: number;
  totalTime: number;
  source: string;
  url: string;
};

const RecipeSkeleton = () => {
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
    <View style={styles.cardSkeleton}>
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />
      <View style={{ padding: 10 }}>
        <Animated.View style={[styles.textSkeleton, { width: '90%', height: 15, marginBottom: 8, opacity }]} />
        <Animated.View style={[styles.textSkeleton, { width: '60%', height: 12, opacity }]} />
      </View>
    </View>
  );
};

export default function RecipesTab() {
  const [query, setQuery] = useState('healthy'); 
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    if (!query.trim()) return;
    
    Keyboard.dismiss();
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // ✅ URL API V2 MỚI NHẤT
      const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.hits) {
        const mappedRecipes = data.hits.map((hit: any) => ({
          uri: hit.recipe.uri,
          label: hit.recipe.label,
          image: hit.recipe.image,
          calories: Math.round(hit.recipe.calories / (hit.recipe.yield || 1)), 
          totalTime: hit.recipe.totalTime,
          source: hit.recipe.source,
          url: hit.recipe.url,
        }));
        setRecipes(mappedRecipes);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Trường hợp không có hits (data rỗng hoặc lỗi key)
        console.log("API Response:", data);
      }
    } catch (error) {
      console.error("Lỗi API Edamam:", error);
      Alert.alert("Lỗi", "Không thể tải công thức. Vui lòng thử lại.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const openRecipe = async (url: string) => {
    Haptics.selectionAsync();
    await WebBrowser.openBrowserAsync(url);
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.card} onPress={() => openRecipe(item.url)} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" transition={500} />
      <View style={styles.info}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.label}</Text>
        
        <View style={styles.metaRow}>
            <View style={styles.badge}>
                <Ionicons name="flame" size={12} color="#FF5722" />
                <Text style={styles.metaText}>{item.calories} kcal</Text>
            </View>
            <View style={styles.badge}>
                <Ionicons name="time" size={12} color="#666" />
                <Text style={styles.metaText}>{item.totalTime > 0 ? item.totalTime + 'm' : '15m'}</Text>
            </View>
        </View>
        
        <View style={styles.sourceRow}>
            <Text style={styles.source}>Nguồn: {item.source}</Text>
            <Ionicons name="open-outline" size={14} color={Colors.light.tint} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
                style={styles.input}
                placeholder="Tìm món (vd: beef, salad)..."
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={fetchRecipes}
                returnKeyType="search"
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#ccc" />
                </TouchableOpacity>
            )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={fetchRecipes}>
            <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.list}>
            <View style={styles.rowSkeleton}><RecipeSkeleton /><RecipeSkeleton /></View>
            <View style={styles.rowSkeleton}><RecipeSkeleton /><RecipeSkeleton /></View>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={recipes}
          keyExtractor={(item) => item.uri}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ gap: 15 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
                <Ionicons name="nutrition-outline" size={50} color="#ddd" />
                <Text style={{color: '#999', marginTop: 10}}>Không tìm thấy công thức nào</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  searchContainer: { flexDirection: 'row', padding: 15, gap: 10, backgroundColor: '#fff', elevation: 2 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, height: 46 },
  input: { flex: 1, height: '100%', marginLeft: 10, fontSize: 16, color: '#333' },
  searchBtn: { backgroundColor: Colors.light.tint, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 12, height: 46 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 15, paddingBottom: 30 },
  rowSkeleton: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  image: { width: '100%', height: 140, backgroundColor: '#eee' },
  info: { padding: 12 },
  cardTitle: { fontWeight: '700', fontSize: 14, marginBottom: 8, height: 40, color: '#333' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  metaText: { fontSize: 11, color: '#555', marginLeft: 4, fontWeight: '600' },
  sourceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  source: { fontSize: 10, color: '#999', fontStyle: 'italic' },
  cardSkeleton: { flex: 1, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 1 },
  imageSkeleton: { width: '100%', height: 140, backgroundColor: '#E0E0E0' },
  textSkeleton: { backgroundColor: '#E0E0E0', borderRadius: 4 },
  emptyBox: { alignItems: 'center', marginTop: 50 },
});