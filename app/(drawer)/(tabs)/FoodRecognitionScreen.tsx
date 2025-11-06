import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";


const CLARIFAI_API_KEY = "acfb3f32028545b9b1646ca29d9a6de2"; 


export default function FoodRecognitionScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any[] | null>(null); // Đặt kiểu dữ liệu là mảng
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const [error, setError] = useState<string | null>(null); // Thêm trạng thái lỗi

  // 👉 Chọn ảnh từ thư viện
  const pickImage = async () => {
    // Reset trạng thái
    setImage(null);
    setResult(null);
    setError(null);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Ứng dụng cần quyền truy cập ảnh để hoạt động.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1], // Giữ ảnh vuông
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  };

  // 👉 Nhận diện món ăn bằng Clarifai
  const recognizeFood = async () => {
    if (!image) {
      alert("Vui lòng chọn một bức ảnh trước.");
      return;
    }

    setLoading(true); // Bắt đầu loading
    setResult(null);
    setError(null);

    try {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: "base64",
      });

      // 🔧 Sửa thông tin model cho rõ ràng
      const USER_ID = "clarifai"; // Đây là chủ sở hữu của model
      const APP_ID = "main"; // Ứng dụng chứa model
      const MODEL_ID = "food-item-recognition"; // Tên model

      // 🔧 Sửa URL để gọi model công khai
      const url = `https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/models/${MODEL_ID}/outputs`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Key ${CLARIFAI_API_KEY}`, // ✅ Dùng key bảo mật
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ❌ Không cần user_app_id trong body khi đã có ở URL
          inputs: [
            {
              data: { image: { base64 } },
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.status?.code !== 10000) {
        console.error("Lỗi API Clarifai:", JSON.stringify(data, null, 2));
        setError("❌ API lỗi: " + (data.status?.description || "Không rõ lỗi"));
        return;
      }

      // ✅ Kết quả trả về rất rõ ràng
      setResult(data.outputs[0].data.concepts);

    } catch (err: any) {
      console.error("❌ Lỗi:", err);
      setError("Có lỗi khi nhận diện hình ảnh: " + err.message);
    } finally {
      setLoading(false); // Dừng loading
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trình nhận diện món ăn</Text>
      
      <Button title="📷 Chọn ảnh món ăn" onPress={pickImage} />

      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      <View style={{ height: 40, marginVertical: 10 }}>
        {/* Nút này sẽ bị vô hiệu hóa khi đang loading */}
        <Button
          title={loading ? "Đang nhận diện..." : "🍜 Nhận diện món ăn"}
          onPress={recognizeFood}
          disabled={loading || !image} // Tắt nút khi đang load hoặc chưa có ảnh
        />
      </View>

      {/* Hiển thị thanh loading */}
      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, { color: 'red' }]}>{error}</Text>
        </View>
      )}

      {/* Hiển thị kết quả */}
      {result && result.length > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Kết quả nhận diện:</Text>
          {/* Chỉ hiển thị 4 kết quả đầu tiên */}
          {result.slice(0, 4).map((item: any) => (
            <Text key={item.id} style={styles.resultItem}>
              🍽️ {item.name} ({(item.value * 100).toFixed(1)}%)
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Thêm một số Styles cho đẹp
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
    marginVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  resultItem: {
    fontSize: 15,
    lineHeight: 22,
    textTransform: "capitalize", // Viết hoa chữ cái đầu
  }
});