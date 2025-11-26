import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Cần quyền truy cập camera để hoạt động</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraType() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current && !isTakingPhoto) {
      setIsTakingPhoto(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true, 
          skipProcessing: true, 
        });
        
        if (photo?.uri) {
          // Điều hướng sang trang kết quả
          router.replace({
            pathname: '/results',
            params: { imageUri: photo.uri },
          });
        }
      } catch (e) {
        console.error(e);
        setIsTakingPhoto(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. CAMERA VIEW (Đóng thẻ ngay lập tức, KHÔNG chứa children) */}
      <CameraView 
        style={styles.camera} 
        facing={facing} 
        ref={cameraRef} 
      />

      {/* 2. LỚP PHỦ GIAO DIỆN (OVERLAY - Nằm đè lên Camera) */}
      <View style={styles.overlay}>
        
        {/* Nút Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        {/* Các nút điều khiển dưới cùng */}
        <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.flipBtn} onPress={toggleCameraType}>
                <Ionicons name="camera-reverse-outline" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureBtn} onPress={takePicture} disabled={isTakingPhoto}>
                {isTakingPhoto ? (
                    <ActivityIndicator color="black" />
                ) : (
                    <View style={styles.captureInner} />
                )}
            </TouchableOpacity>

            <View style={{width: 50}} /> 
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  message: { textAlign: 'center', paddingBottom: 10, color: 'white' },
  permissionBtn: { backgroundColor: '#C1121F', padding: 10, borderRadius: 5, alignSelf: 'center' },
  permissionText: { color: 'white', fontWeight: 'bold' },
  
  camera: { flex: 1 }, 

  overlay: {
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 50,
  },
  
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },

  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  flipBtn: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  captureBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2, borderColor: 'black',
  },
});