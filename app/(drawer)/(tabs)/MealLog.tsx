import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../../components/AppHeader';
import { Colors } from '../../../constants/theme';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function MealLogTab() {
	const [mealType, setMealType] = useState<MealType>('breakfast');
	const [items, setItems] = useState(''); // ví dụ: "2 quả trứng, 1 lát bánh mì"
	const [calories, setCalories] = useState('');
	const [note, setNote] = useState('');

	const onSubmit = async () => {
		if (!items.trim()) {
			Alert.alert('Thiếu thông tin', 'Vui lòng nhập món ăn.');
			return;
		}
		// TODO(BE): Gọi API tạo log bữa ăn
		// Ví dụ:
		// const res = await fetch(`${API_URL}/meals`, {
		//   method: 'POST',
		//   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		//   body: JSON.stringify({ mealType, items, calories: Number(calories) || null, note })
		// })
		// if (!res.ok) handleError(); else navigate or show success
		Alert.alert('Đã lưu', 'Bữa ăn của bạn đã được ghi lại (demo).');
		setItems(''); setCalories(''); setNote('');
	};

	return (
		<View style={styles.container}>
			<AppHeader />
			<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
				<Text style={styles.title}>Ghi nhật ký bữa ăn</Text>

				<Text style={styles.label}>Loại bữa</Text>
				<View style={styles.segmentRow}>
					{(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
						<TouchableOpacity
							key={t}
							style={[styles.segment, mealType === t && styles.segmentActive]}
							onPress={() => setMealType(t)}
						>
							<Text style={[styles.segmentText, mealType === t && styles.segmentTextActive]}>
								{t === 'breakfast' ? 'Sáng' : t === 'lunch' ? 'Trưa' : t === 'dinner' ? 'Tối' : 'Ăn vặt'}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<Text style={styles.label}>Món ăn / nguyên liệu</Text>
				<TextInput
					placeholder="Ví dụ: 2 trứng, 1 lát bánh mì..."
					value={items}
					onChangeText={setItems}
					style={styles.input}
					multiline
				/>

				<Text style={styles.label}>Calo ước tính (kcal)</Text>
				<TextInput
					placeholder="Ví dụ: 350"
					value={calories}
					onChangeText={setCalories}
					style={styles.input}
					keyboardType="number-pad"
				/>

				<Text style={styles.label}>Ghi chú</Text>
				<TextInput
					placeholder="Cảm nhận sau khi ăn, thời gian, vị trí..."
					value={note}
					onChangeText={setNote}
					style={[styles.input, { height: 80 }]}
					multiline
				/>

				<TouchableOpacity style={styles.button} onPress={onSubmit}>
					<Text style={styles.buttonText}>Lưu bữa ăn</Text>
				</TouchableOpacity>

				{/*
					HƯỚNG DẪN KẾT NỐI BE:
					- Tạo endpoint POST /meals nhận body { mealType, items, calories, note }.
					- Trả về { id, createdAt, ... } sau khi lưu.
					- Client: tạo service mealsApi.create(...) và dùng ở onSubmit.
					- Quản lý state: có thể dùng React Query (useMutation) để cache và invalidates query 'meals'.
				*/}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.light.background },
	content: { padding: 16 },
	title: { fontSize: 20, fontWeight: '600', color: Colors.light.text, marginBottom: 12 },
	label: { color: Colors.light.text, marginTop: 8, marginBottom: 6, fontWeight: '500' },
	input: {
		backgroundColor: Colors.light.card,
		borderWidth: 1,
		borderColor: Colors.light.border,
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: Colors.light.text,
	},
	segmentRow: { flexDirection: 'row', gap: 8 },
	segment: {
		backgroundColor: Colors.light.card,
		borderWidth: 1,
		borderColor: Colors.light.border,
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 14,
	},
	segmentActive: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
	segmentText: { color: Colors.light.text },
	segmentTextActive: { color: '#fff', fontWeight: '600' },
	button: { backgroundColor: Colors.light.tint, borderRadius: 12, paddingVertical: 14, marginTop: 16, alignItems: 'center' },
	buttonText: { color: '#fff', fontWeight: '600' },
});

