import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../../../components/AppHeader';
import { Colors } from '../../../constants/theme';

type Meal = {
	id: string;
	mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
	items: string;
	calories?: number;
	createdAt: string; // ISO
};

export default function MealHistoryTab() {
	const [data, setData] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const loadPage = useCallback(async (reset = false) => {
		if (reset) { setPage(1); setHasMore(true); }
		if (!hasMore && !reset) return;
		try {
			if (!reset) setLoading(true);
			// TODO(BE): Gọi GET /meals?page=1&pageSize=20 hoặc /meals?cursor=...
			// const res = await fetch(`${API_URL}/meals?page=${reset ? 1 : page}`);
			// const json = await res.json();
			// setData(reset ? json.items : [...data, ...json.items]);
			// setHasMore(json.hasMore);

			// Demo giả lập
			const demo: Meal[] = Array.from({ length: 10 }, (_, i) => ({
				id: `${reset ? 1 : page}-${i}`,
				mealType: (['breakfast','lunch','dinner','snack'] as const)[i % 4],
				items: 'Món ăn demo',
				calories: 300 + i * 10,
				createdAt: new Date(Date.now() - i * 36e5).toISOString(),
			}));
			setData(reset ? demo : [...data, ...demo]);
			setHasMore((reset ? 1 : page) < 5); // demo 5 trang
			setPage((reset ? 1 : page) + 1);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [data, hasMore, page]);

	useEffect(() => { loadPage(true); }, []);

	const onRefresh = () => {
		setRefreshing(true);
		loadPage(true);
	};

	const renderItem = ({ item }: { item: Meal }) => (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>
				{item.mealType === 'breakfast' ? 'Bữa sáng' : item.mealType === 'lunch' ? 'Bữa trưa' : item.mealType === 'dinner' ? 'Bữa tối' : 'Ăn vặt'}
			</Text>
			<Text style={styles.cardText}>{item.items}</Text>
			{!!item.calories && <Text style={styles.badge}>{item.calories} kcal</Text>}
			<Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<AppHeader />
			{loading && data.length === 0 ? (
				<View style={styles.center}><ActivityIndicator /></View>
			) : (
				<FlatList
					contentContainerStyle={styles.list}
					data={data}
					keyExtractor={(x) => x.id}
					renderItem={renderItem}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
					onEndReached={() => loadPage(false)}
					onEndReachedThreshold={0.2}
					ListFooterComponent={hasMore ? <ActivityIndicator /> : <Text style={styles.footer}>Hết dữ liệu</Text>}
				/>
			)}

			{/*
				HƯỚNG DẪN KẾT NỐI BE:
				- Tạo endpoint GET /meals?cursor=xxx hoặc ?page=n&pageSize=20.
				- Trả về { items: Meal[], hasMore: boolean, nextCursor? }.
				- Client: tạo mealsApi.list({ page }) và dùng ở loadPage.
				- Có thể dùng React Query (useInfiniteQuery) để handle phân trang & cache.
			*/}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.light.background },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	list: { padding: 16, gap: 12 },
	card: {
		backgroundColor: Colors.light.card,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.light.border,
		padding: 12,
	},
	cardTitle: { fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
	cardText: { color: Colors.light.text },
	badge: {
		alignSelf: 'flex-start',
		marginTop: 8,
		backgroundColor: Colors.light.border,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		color: Colors.light.text,
	},
	time: { marginTop: 6, color: Colors.light.icon, fontSize: 12 },
	footer: { textAlign: 'center', color: Colors.light.icon, paddingVertical: 12 },
});

