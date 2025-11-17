import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../../components/AppHeader';
import { Colors } from '../../../constants/theme';

type Recipe = {
	id: string;
	title: string;
	image?: string;
	calories?: number;
};

export default function RecipesTab() {
	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<Recipe[]>([]);

	// Debounce đơn giản
	const debouncedQuery = useMemo(() => query.trim(), [query]);

	useEffect(() => {
		let mounted = true;
		const fetchRecipes = async () => {
			setLoading(true);
			try {
				// TODO(BE): Gọi GET /recipes?query=...
				// const res = await fetch(`${API_URL}/recipes?query=${encodeURIComponent(debouncedQuery)}`);
				// const json = await res.json(); setData(json.items)
				const demo: Recipe[] = Array.from({ length: 12 }, (_, i) => ({
					id: `${debouncedQuery || 'all'}-${i}`,
					title: debouncedQuery ? `Món ${debouncedQuery} #${i + 1}` : `Công thức #${i + 1}`,
					image: 'https://picsum.photos/seed/food' + i + '/300/200',
					calories: 300 + i * 15,
				}));
				if (mounted) setData(demo);
			} finally {
				if (mounted) setLoading(false);
			}
		};
		fetchRecipes();
		return () => { mounted = false; };
	}, [debouncedQuery]);

	const renderItem = ({ item }: { item: Recipe }) => (
		<TouchableOpacity style={styles.card} onPress={() => {/* TODO(NAV): router.push(`/recipes/${item.id}`) */}}>
			{item.image && <Image source={{ uri: item.image }} style={styles.image} />}
			<Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
			{!!item.calories && <Text style={styles.cardSub}>{item.calories} kcal</Text>}
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<AppHeader />
			<View style={styles.searchWrap}>
				<TextInput
					placeholder="Tìm công thức..."
					placeholderTextColor={Colors.light.icon}
					value={query}
					onChangeText={setQuery}
					style={styles.search}
				/>
			</View>

			{loading ? (
				<View style={styles.center}><ActivityIndicator /></View>
			) : (
				<FlatList
					contentContainerStyle={styles.list}
					data={data}
					keyExtractor={(x) => x.id}
					renderItem={renderItem}
					numColumns={2}
					columnWrapperStyle={{ gap: 12 }}
				/>
			)}

			{/*
				HƯỚNG DẪN KẾT NỐI BE:
				- GET /recipes?query=keyword&page=1&pageSize=20 trả về danh sách Recipe.
				- Thêm trang chi tiết: app/(drawer)/(tabs)/recipes/[id].tsx, gọi GET /recipes/:id.
				- Có thể cache bằng React Query; thêm filter chip: loại món, thời gian nấu, dinh dưỡng.
			*/}
		</View>
	);
}

const CARD_H = 180;

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.light.background },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	searchWrap: { padding: 16 },
	search: {
		backgroundColor: Colors.light.card,
		borderWidth: 1,
		borderColor: Colors.light.border,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: Colors.light.text,
	},
	list: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
	card: {
		flex: 1,
		backgroundColor: Colors.light.card,
		borderWidth: 1,
		borderColor: Colors.light.border,
		borderRadius: 12,
		padding: 10,
		height: CARD_H,
	},
	image: { width: '100%', height: 90, borderRadius: 8, marginBottom: 8 },
	cardTitle: { color: Colors.light.text, fontWeight: '600' },
	cardSub: { color: Colors.light.icon, marginTop: 4 },
});

