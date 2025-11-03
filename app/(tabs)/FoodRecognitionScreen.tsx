import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Button, Image, ScrollView, Text, View } from "react-native";


export default function FoodRecognitionScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // 👉 Chọn ảnh từ thư viện
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Ứng dụng cần quyền truy cập ảnh để hoạt động.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ mới
      quality: 1,
      allowsEditing: true,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  };

  // 👉 Nhận diện món ăn bằng Clarifai
  const recognizeFood = async () => {
    if (!image) {
      alert("Chưa chọn ảnh mà đòi nhận diện cái gì?");
      return;
    }

    try {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: "base64",
      });

      const clarifaiApiKey = "acfb3f32028545b9b1646ca29d9a6de2";
      const user_id = "clarifai";
      const app_id = "main"; // Clarifai yêu cầu có 2 field này
      const model_id = "food-item-recognition"; // Mô hình nhận diện món ăn

      const response = await fetch(
        `https://api.clarifai.com/v2/models/${model_id}/outputs`,
        {
          method: "POST",
          headers: {
            "Authorization": `Key ${clarifaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_app_id: { user_id, app_id }, // ✅ Thêm dòng này mới hợp lệ
            inputs: [
              {
                data: { image: { base64 } },
              },
            ],
          }),
        }
      );

      const data = await response.json();
      console.log("📦 Kết quả Clarifai:", JSON.stringify(data, null, 2));

      if (data.status?.code !== 10000) {
        alert("❌ API lỗi: " + data.status?.description);
        return;
      }

      setResult(data.outputs[0].data.concepts);
    } catch (err) {
      console.error("❌ Lỗi:", err);
      alert("Có lỗi khi nhận diện hình ảnh.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Button title="📷 Chọn ảnh món ăn" onPress={pickImage} />

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: 250,
            height: 250,
            marginVertical: 20,
            borderRadius: 12,
          }}
        />
      )}

      <Button title="🍜 Nhận diện món ăn" onPress={recognizeFood} />

      {result && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            Kết quả nhận diện:
          </Text>
          {result.map((item: any, i: number) => (
            <Text key={i}>
              🍽️ {item.name} ({(item.value * 100).toFixed(1)}%)
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
