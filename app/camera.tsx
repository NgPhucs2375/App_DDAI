import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  // Use a permissive ref type due to expo-camera typings
  const cameraRef = useRef<any>(null);

  if (!permission) {
    // Quyền camera đang được tải
    return <View />;
  }

  if (!permission.granted) {
    // QIIuyền camera chưa được cấp
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          Chúng tôi cần quyền truy cập camera của bạn
        </Text>
        <Button onPress={requestPermission} title="Cấp quyền" />
      </View>
    );
  }

  function toggleCameraType() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync?.({
        quality: 0.5, // Giảm chất lượng chút để gửi API nhanh hơn
      });
      
      if (photo?.uri) {
        // ĐIỀU HƯỚNG SANG MÀN HÌNH KẾT QUẢ MỚI
        router.replace({
          pathname: '/results', // <--- Quan trọng: Trỏ đúng file vừa tạo
          params: { imageUri: photo.uri },
        });
      }
    }
  };
      
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
          </TouchableOpacity>
        </View>
      </CameraView>

      <View style={styles.captureButtonContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.text}>Huỷ</Text>
      </TouchableOpacity>
    </View>
  );
}

// (Thêm styles chi tiết cho camera)
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: 'black' },
  camera: { height: '70%', width: '100%' },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 20,
  },
  button: { alignSelf: 'flex-start', alignItems: 'center' },
  text: { fontSize: 18, color: 'white' },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'grey',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
});