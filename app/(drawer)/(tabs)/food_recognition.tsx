import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AppHeader from '../../../components/AppHeader';
import { Colors } from '../../../constants/theme';

const CLARIFAI_API_KEY = (Constants.expoConfig?.extra as any)?.CLARIFAI_API_KEY || '';

export default function FoodRecognitionScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    setImage(null);
    setResult(null);
    setError(null);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Ứng dụng cần quyền truy cập ảnh để hoạt động.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  };

  const recognizeFood = async () => {
    if (!image) {
      alert('Vui lòng chọn một bức ảnh trước.');
      return;
    }

    if (!CLARIFAI_API_KEY) {
      alert('Thiếu CLARIFAI_API_KEY. Vui lòng cấu hình trong app.json -> extra.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });

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
        body: JSON.stringify({
          inputs: [
            {
              data: { image: { base64 } },
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.status?.code !== 10000) {
        console.error('Lỗi API Clarifai:', JSON.stringify(data, null, 2));
        setError('❌ API lỗi: ' + (data.status?.description || 'Không rõ lỗi'));
        return;
      }

      setResult(data.outputs[0].data.concepts);
    } catch (err: any) {
      console.error('❌ Lỗi:', err);
      setError('Có lỗi khi nhận diện hình ảnh: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Trình nhận diện món ăn</Text>

        <Button title="📷 Chọn ảnh món ăn" onPress={pickImage} />

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <View style={{ height: 40, marginVertical: 10 }}>
          <Button
            title={loading ? 'Đang nhận diện...' : '🍜 Nhận diện món ăn'}
            onPress={recognizeFood}
            disabled={loading || !image}
          />
        </View>

        {loading && <ActivityIndicator size="large" color={Colors.light.tint} />}

        {error && (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultTitle, { color: 'red' }]}>{error}</Text>
          </View>
        )}

        {result && result.length > 0 && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Kết quả nhận diện:</Text>
            {result.slice(0, 4).map((item: any) => (
              <Text key={item.id} style={styles.resultItem}>
                🍽️ {item.name} ({(item.value * 100).toFixed(1)}%)
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.text,
  },
  image: {
    width: 250,
    height: 250,
    marginVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    padding: 15,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: Colors.light.text,
  },
  resultItem: {
    fontSize: 15,
    lineHeight: 22,
    textTransform: 'capitalize',
    color: Colors.light.text,
  },
});
