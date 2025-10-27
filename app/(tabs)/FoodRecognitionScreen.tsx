import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Button, Image, Text, View } from "react-native";

export default function FoodRecognitionScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Ứng dụng cần quyền truy cập ảnh để hoạt động.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  };

  const recognizeFood = async () => {
    if (!image) return alert("Chưa chọn ảnh mà đòi nhận diện cái gì?");
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "photo.jpg",
      } as any);

      const response = await axios.post(
        "https://api.logmeal.com/v2/image/recognition/complete",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer bd3c40d00f8aa2841b798826be953c3fde2a41af", // ← đổi thành token bạn đã lấy
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi nhận diện. Có thể token hoặc ảnh bị lỗi.");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Button title="Chọn ảnh món ăn" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 250, height: 250, marginVertical: 20 }} />}
      <Button title="Nhận diện món ăn" onPress={recognizeFood} />
      {result && (
        <Text style={{ marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </Text>
      )}
    </View>
  );
}

