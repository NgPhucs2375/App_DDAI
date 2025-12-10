import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- BẢNG MÀU "HEALTHY RICE" ---
const THEME = {
  background: '#FDFCF8', // Màu gạo sáng
  primary: '#8D6E63',    // Nâu đất nhẹ
  secondary: '#EFEBE9',  // Màu be nhạt (nền icon)
  textMain: '#3E2723',   // Nâu đậm (chữ chính)
  textSub: '#795548',    // Nâu nhạt (chữ phụ)
  accent: '#A1887F',     // Màu nhấn
  white: '#FFFFFF',
};

const SLIDES = [
  {
    id: '1',
    title: 'Quét Calo AI 📸',
    description: 'Chụp ảnh món ăn, AI sẽ nhận diện và tính toán dinh dưỡng trong tích tắc.',
    icon: 'scan-outline',
  },
  {
    id: '2',
    title: 'Sống Khỏe Mỗi Ngày 🌿',
    description: 'Theo dõi chỉ số cơ thể với biểu đồ trực quan. Cân bằng lối sống lành mạnh.',
    icon: 'leaf-outline', 
  },
  {
    id: '3',
    title: 'Trợ Lý Dinh Dưỡng 🤖',
    description: 'Chat với chuyên gia ảo để nhận thực đơn và lời khuyên chuẩn xác nhất.',
    icon: 'chatbubbles-outline',
  }
];

// Component từng Slide (Tách ra để xử lý Animation dễ hơn)
const SlideItem = ({ item, index, scrollX }: { item: any, index: number, scrollX: Animated.Value }) => {
  // Hiệu ứng Parallax cho Hình ảnh
  const imageTranslateY = scrollX.interpolate({
    inputRange: [(index - 1) * width, index * width, (index + 1) * width],
    outputRange: [100, 0, 100], // Ảnh đi lên xuống nhẹ khi lướt
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollX.interpolate({
    inputRange: [(index - 1) * width, index * width, (index + 1) * width],
    outputRange: [0, 1, 0], // Mờ dần khi ra khỏi màn hình
    extrapolate: 'clamp',
  });

  // Hiệu ứng cho Chữ (Text)
  const textTranslateY = scrollX.interpolate({
    inputRange: [(index - 1) * width, index * width, (index + 1) * width],
    outputRange: [50, 0, 50],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      {/* Vòng tròn nền (Background Circle) */}
      <Animated.View 
        style={[
          styles.imageContainer, 
          { 
            opacity: imageOpacity,
            transform: [{ translateY: imageTranslateY }, { scale: imageOpacity }] 
          }
        ]}
      >
        <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
                <Ionicons name={item.icon as any} size={80} color={THEME.primary} />
            </View>
        </View>
      </Animated.View>

      {/* Nội dung chữ */}
      <Animated.View 
        style={[
          styles.textContainer, 
          { 
            opacity: imageOpacity,
            transform: [{ translateY: textTranslateY }] 
          }
        ]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    } catch (err) {
      router.replace('/login');
    }
  };

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleDone();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      {/* Background Decor (Vòng tròn trang trí mờ phía sau) */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      {/* Nút Bỏ qua */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleDone}>
         <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={slidesRef}
        data={SLIDES}
        renderItem={({ item, index }) => <SlideItem item={item} index={index} scrollX={scrollX} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
      onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }], 
    { useNativeDriver: false } // <--- Chuyển thành false
)}
        onViewableItemsChanged={viewableItemsChanged}
        scrollEventThrottle={32}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Paginator (Dấu chấm) */}
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const color = scrollX.interpolate({
                inputRange,
                outputRange: [THEME.accent, THEME.primary, THEME.accent],
                extrapolate: 'clamp',
            });

            return (
                <Animated.View 
                    style={[styles.dot, { width: dotWidth, opacity, backgroundColor: color }]} 
                    key={i.toString()} 
                />
            );
          })}
        </View>

        {/* Nút Next / Start */}
        <TouchableOpacity 
            style={[
                styles.nextBtn, 
                currentIndex === SLIDES.length - 1 ? { width: 160 } : { width: 60 }
            ]} 
            onPress={nextSlide}
            activeOpacity={0.8}
        >
            {currentIndex === SLIDES.length - 1 ? (
                <Text style={styles.btnText}>Bắt đầu</Text>
            ) : (
                <Ionicons name="arrow-forward" size={24} color="#fff" />
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: THEME.background,
    position: 'relative',
  },
  
  // Nền trang trí (Background Decor)
  bgCircleTop: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    backgroundColor: THEME.secondary,
    opacity: 0.5,
  },
  bgCircleBottom: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.2,
    width: width,
    height: width,
    borderRadius: width,
    backgroundColor: '#F5EFE6', // Màu be ấm hơn chút
    opacity: 0.5,
  },

  skipBtn: { 
    position: 'absolute', 
    top: 60, 
    right: 30, 
    zIndex: 10,
    padding: 10
  },
  skipText: { 
    fontSize: 16, 
    color: THEME.textSub, 
    fontWeight: '600',
    letterSpacing: 0.5
  },
  
  slide: { 
    width, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingBottom: 80 // Để chừa chỗ cho footer
  },

  // Style cho hình tròn chứa Icon (Double Circle)
  imageContainer: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleOuter: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width,
    backgroundColor: THEME.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#8D6E63",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  circleInner: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width,
    backgroundColor: THEME.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },

  textContainer: { 
    paddingHorizontal: 40, 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 15,
    color: THEME.textMain,
    letterSpacing: 0.5
  },
  description: { 
    fontSize: 16, 
    color: THEME.textSub, 
    textAlign: 'center', 
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light'
  },

  footer: { 
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 80, 
    justifyContent: 'space-between', 
    paddingHorizontal: 30, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  paginator: { 
    flexDirection: 'row', 
    height: 64, 
    alignItems: 'center' 
  },
  dot: { 
    height: 8, 
    borderRadius: 4, 
    marginHorizontal: 6,
  },
  
  nextBtn: { 
    backgroundColor: THEME.primary, 
    height: 60,
    borderRadius: 30, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  btnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
});