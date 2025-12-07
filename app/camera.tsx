import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Animation Scanner
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startScanAnimation();
  }, []);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();
  };

  const scanYi = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, height - 250], 
  });

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Cần quyền truy cập camera</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}><Text style={styles.permissionText}>Cấp quyền</Text></TouchableOpacity>
      </View>
    );
  }

  function toggleCameraType() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1, skipProcessing: true });
        if (photo?.uri) {
          const manipulated = await manipulateAsync(
            photo.uri,
            [{ resize: { width: 800 } }], 
            { compress: 0.6, format: SaveFormat.JPEG }
          );
          router.replace({ pathname: '/results', params: { imageUri: manipulated.uri } });
        }
      } catch (e) {
        console.error(e);
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. CAMERA VIEW (KHÔNG CÓ CHILDREN) */}
      <CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} />

      {/* 2. OVERLAY SCANNER (Nằm đè lên Camera) */}
      <View style={styles.overlayLayer}>
          <View style={styles.scannerContainer}>
            <View style={styles.maskRow} />
            <View style={styles.maskCenter}>
                <View style={styles.maskSide} />
                <View style={styles.scanArea}>
                    <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanYi }] }]} />
                    <View style={[styles.corner, styles.tl]} />
                    <View style={[styles.corner, styles.tr]} />
                    <View style={[styles.corner, styles.bl]} />
                    <View style={[styles.corner, styles.br]} />
                </View>
                <View style={styles.maskSide} />
            </View>
            <View style={styles.maskRow} />
          </View>
      </View>

      {/* 3. OVERLAY CONTROLS (Nút bấm) */}
      <View style={styles.controlsLayer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.flipBtn} onPress={toggleCameraType}>
                  <Ionicons name="camera-reverse-outline" size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.captureBtn, isProcessing && {opacity: 0.5}]} onPress={takePicture} disabled={isProcessing}>
                  <View style={styles.captureInner} />
              </TouchableOpacity>

              <View style={{width: 50}} /> 
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  message: { textAlign: 'center', paddingBottom: 10, color: 'white', marginTop: 100 },
  permissionBtn: { backgroundColor: '#C1121F', padding: 10, borderRadius: 5, alignSelf: 'center' },
  permissionText: { color: 'white', fontWeight: 'bold' },
  
  // Overlay Layer (Full Screen)
  overlayLayer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  controlsLayer: { ...StyleSheet.absoluteFillObject, zIndex: 2, justifyContent: 'space-between', padding: 30, paddingBottom: 50 },

  // Scanner UI
  scannerContainer: { flex: 1 },
  maskRow: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  maskCenter: { flexDirection: 'row', height: 300 },
  maskSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  scanArea: { width: 300, height: 300, position: 'relative' },
  scanLine: { width: '100%', height: 2, backgroundColor: '#00CEC9', shadowColor: '#00CEC9', shadowOpacity: 1, shadowRadius: 10, elevation: 5 },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: '#fff', borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  // Controls
  backBtn: { alignSelf: 'flex-start', marginTop: 40, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flipBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#C1121F' },
});