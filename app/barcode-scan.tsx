import { Colors } from '@/constants/theme';
import { MealService } from '@/src/services/api'; // Import Service
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';

export default function BarcodeScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const userId = useUserStore(s => s.profile.id);

  // State
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torch, setTorch] = useState(false); // Đèn Flash
  const [product, setProduct] = useState<any>(null); // Dữ liệu món ăn quét được
  const [modalVisible, setModalVisible] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white', textAlign: 'center', marginTop: 50}}>Cần quyền Camera để quét mã</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnPerm}><Text>Cấp quyền</Text></TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    Vibration.vibrate(100); // Rung nhẹ báo hiệu nhận mã

    try {
      setLoading(true);
      // 1. Gọi API OpenFoodFacts
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await response.json();

      if (json.status === 1) {
        const p = json.product;
        const nutriments = p.nutriments;
        
        // Chuẩn hóa dữ liệu
        const foundProduct = {
            name: p.product_name || "Sản phẩm không tên",
            image: p.image_front_small_url || null,
            calories: Math.round(nutriments['energy-kcal_100g'] || 0),
            protein: nutriments.proteins_100g || 0,
            carbs: nutriments.carbohydrates_100g || 0,
            fat: nutriments.fat_100g || 0,
            unit: '100g/ml',
            barcode: data
        };

        setProduct(foundProduct);
        setModalVisible(true);
      } else {
        Alert.alert("Rất tiếc 😔", "Không tìm thấy sản phẩm này trong dữ liệu toàn cầu.", [
            { text: "Quét lại", onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      Alert.alert("Lỗi mạng", "Kiểm tra kết nối internet.");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDiary = async () => {
    if (!product) return;
    
    // 1. Lưu vào Nhật ký ăn uống (Meal)
    const result = await MealService.add({
        user_id: Number(userId),
        mealType: 'snack', // Mặc định là ăn vặt
        items: `${product.name} (Quét mã)`,
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat
    });

    // 2. (Nâng cao) Gửi món này lên Server để Admin duyệt (nếu muốn đóng góp)
    // Bạn có thể gọi thêm API addFood ở đây nếu muốn.

    if (result) {
        setModalVisible(false);
        Alert.alert("Thành công", "Đã thêm vào nhật ký ăn vặt! 🍫", [
            { text: "Về trang chủ", onPress: () => router.replace('/') },
            { text: "Quét tiếp", onPress: () => { setScanned(false); setProduct(null); } }
        ]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch} // Bật tắt đèn Flash
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_e"],
        }}
      />
      
      {/* UI Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.headerRow}>
            <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}>
                <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quét mã vạch</Text>
            <TouchableOpacity style={styles.roundBtn} onPress={() => setTorch(!torch)}>
                <Ionicons name={torch ? "flash" : "flash-off"} size={24} color={torch ? "#F1C40F" : "#fff"} />
            </TouchableOpacity>
        </View>

        {/* Khung quét */}
        <View style={styles.scanArea}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            {loading && <ActivityIndicator size="large" color={Colors.light.tint} style={{marginTop: 50}} />}
            {!loading && <View style={styles.scanLine} />}
        </View>

        <Text style={styles.hintText}>Di chuyển camera đến mã vạch sản phẩm</Text>
      </View>

      {/* Modal Kết quả (Product Card) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {product && (
                    <>
                        {product.image && (
                            <Image source={{uri: product.image}} style={styles.prodImage} resizeMode="contain" />
                        )}
                        <Text style={styles.prodName}>{product.name}</Text>
                        <Text style={styles.prodBarcode}>Code: {product.barcode}</Text>
                        
                        <View style={styles.macroRow}>
                            <MacroBox label="Calo" val={product.calories} unit="kcal" color="#E74C3C"/>
                            <MacroBox label="Đạm" val={product.protein} unit="g" color="#3498DB"/>
                            <MacroBox label="Carb" val={product.carbs} unit="g" color="#F1C40F"/>
                            <MacroBox label="Béo" val={product.fat} unit="g" color="#E67E22"/>
                        </View>

                        <Text style={styles.note}>*Thông tin trên 100g/ml sản phẩm</Text>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToDiary}>
                            <Text style={styles.saveBtnText}>Lưu vào Nhật ký</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); setScanned(false); }}>
                            <Text style={{color: '#666'}}>Quét lại</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
      </Modal>
    </View>
  );
}

const MacroBox = ({label, val, unit, color}: any) => (
    <View style={{alignItems: 'center', flex: 1}}>
        <Text style={{fontWeight: 'bold', fontSize: 16, color: color}}>{val}</Text>
        <Text style={{fontSize: 10, color: '#999'}}>{unit}</Text>
        <Text style={{fontSize: 12, marginTop: 2}}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  btnPerm: { backgroundColor: 'white', padding: 10, marginTop: 20, alignSelf: 'center', borderRadius: 5 },
  
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'space-between', paddingVertical: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  roundBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  
  scanArea: { width: 280, height: 200, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  // Tạo 4 góc khung quét
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 4, borderLeftWidth: 4, borderColor: Colors.light.tint },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 4, borderRightWidth: 4, borderColor: Colors.light.tint },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: Colors.light.tint },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 4, borderRightWidth: 4, borderColor: Colors.light.tint },
  scanLine: { width: '90%', height: 2, backgroundColor: 'red', opacity: 0.6 },

  hintText: { color: 'white', textAlign: 'center', fontSize: 14, marginBottom: 20 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, alignItems: 'center' },
  prodImage: { width: 100, height: 100, marginBottom: 10, borderRadius: 10 },
  prodName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  prodBarcode: { fontSize: 12, color: '#999', marginBottom: 20 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  note: { fontSize: 11, color: '#aaa', fontStyle: 'italic', marginBottom: 20 },
  saveBtn: { backgroundColor: Colors.light.tint, width: '100%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 10 },
});