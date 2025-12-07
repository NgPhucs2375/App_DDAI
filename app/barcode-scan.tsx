import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BarcodeScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white', textAlign: 'center', marginTop: 50}}>Cần quyền Camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>Cấp quyền</Text></TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    try {
      // Gọi API OpenFoodFacts (Miễn phí)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await response.json();

      if (json.status === 1) {
        const product = json.product;
        // Chuyển hướng sang trang kết quả (Tái sử dụng trang Result nhưng truyền data thay vì ảnh)
        // Lưu ý: Bạn cần sửa trang Results để nhận params dạng data trực tiếp (tôi sẽ hướng dẫn ở bước sau)
        Alert.alert("Tìm thấy!", `${product.product_name}\nCalo: ${product.nutriments['energy-kcal_100g']} kcal/100g`, [
            { text: "Quét lại", onPress: () => setScanned(false) }
        ]);
      } else {
        Alert.alert("Không tìm thấy", "Sản phẩm này chưa có trong cơ sở dữ liệu.", [
            { text: "Thử lại", onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không kết nối được server sản phẩm.");
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_e"], // Các loại mã vạch phổ biến
        }}
      />
      
      {/* Khung ngắm */}
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.text}>Đưa mã vạch vào khung</Text>
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  btn: { backgroundColor: 'white', padding: 10, marginTop: 20, alignSelf: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 150, borderWidth: 2, borderColor: '#00CEC9', borderRadius: 10 },
  text: { color: 'white', marginTop: 20, fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5 },
  closeBtn: { position: 'absolute', top: 50, left: 20, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
});