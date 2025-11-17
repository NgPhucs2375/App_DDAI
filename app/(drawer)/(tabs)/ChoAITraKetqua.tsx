import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

// Màu sắc dựa trên hình ảnh (hơi khác so với ảnh trước)
const LIGHT_BLUE = '#7DD3FC'; // Xanh dương nhạt
const DARK_BLUE = '#38BDF8'; // Xanh dương đậm cho phần dưới cùng
const BACKGROUND_GREY = '#D8D8D8'; // Xám nền

export default function ImageDetailLayout() {
  return (
    // 1. SafeAreaView: Đảm bảo nội dung không bị che bởi notch/thanh trạng thái.
    <SafeAreaView style={styles.safeArea}>
      {/* 2. Main Container: View bao ngoài cùng, chiếm toàn bộ không gian. */}
      <View style={styles.container}>

        {/* 3. UPPER SECTION (Phần trên): Chứa Header và Main Content Box */}
        <View style={styles.upperSection}>

          {/* 3.1. Header / Navbar (Thanh trên cùng) */}
          <View style={styles.header}>
            <View style={styles.headerSquare} />
            <View style={styles.headerInput} />
          </View>

          {/* 3.2. Main Content Box (Hộp nội dung chính màu xanh nhạt) */}
          <View style={styles.mainContentBox}>
            {/* Vị trí của ô ảnh (hình vuông trắng) */}
            <View style={styles.imagePlaceholder} />

            {/* Thanh hiển thị trạng thái "Đang phân tích dữ liệu" */}
            <View style={styles.analysisBar}>
              <Text style={styles.analysisText}>Đang phân tích dữ liệu</Text>
            </View>
          </View>
        </View>

        {/* 4. BOTTOM BAR / FOOTER (Thanh dưới cùng màu xanh đậm) */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomSquare} />
          <View style={styles.bottomCircle} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Style cho SafeAreaView
  safeArea: {
    flex: 1, // Chiếm toàn bộ màn hình
    backgroundColor: BACKGROUND_GREY, // Đặt màu nền xám
  },
  
  // Style cho Container chính
  container: {
    flex: 1, // Chiếm toàn bộ không gian còn lại
    padding: 10, // Tạo khoảng đệm nhỏ xung quanh như trong hình
  },

  // ----------------------------------------------------
  // 3. UPPER SECTION & MAIN CONTENT STYLES
  // ----------------------------------------------------
  upperSection: {
    flex: 1, // Cho phép phần này co giãn (chiếm hầu hết màn hình)
    marginBottom: 10, // Khoảng cách với thanh dưới
  },

  // 3.1. Header Styles
  header: {
    flexDirection: 'row', // Sắp xếp các item theo hàng ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
    marginBottom: 10, // Khoảng cách với hộp nội dung chính
  },
  headerSquare: {
    width: 30,
    height: 30,
    backgroundColor: LIGHT_BLUE, // Sử dụng màu xanh nhạt
    borderRadius: 5, // Góc bo tròn nhẹ
    marginRight: 10,
  },
  headerInput: {
    flex: 1, // Chiếm phần không gian còn lại
    height: 30,
    backgroundColor: LIGHT_BLUE, // Sử dụng màu xanh nhạt
    borderRadius: 15, // Góc bo tròn để trông giống thanh input
  },

  // 3.2. Main Content Box (Hộp xanh nhạt lớn)
  mainContentBox: {
    flex: 1, // Chiếm toàn bộ không gian còn lại trong upperSection
    backgroundColor: LIGHT_BLUE, // Màu xanh nhạt
    borderRadius: 20, // Bo góc lớn
    padding: 20, // Khoảng đệm bên trong hộp
    alignItems: 'center', // Căn giữa các item con theo chiều ngang
    justifyContent: 'space-between', // Phân bố đều các item con theo chiều dọc
    elevation: 5, // Thêm đổ bóng (Android)
    shadowColor: '#000', // Đổ bóng (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // Ô Ảnh (hình vuông trắng)
  imagePlaceholder: {
    width: '90%', // Chiếm 90% chiều rộng của hộp chứa
    height: '60%', // Chiếm 60% chiều cao của hộp chứa
    backgroundColor: 'white',
    borderRadius: 10, // Góc bo tròn cho ảnh
    marginBottom: 20, // Khoảng cách với thanh phân tích
  },

  // Thanh "Đang phân tích dữ liệu"
  analysisBar: {
    width: '90%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center', // Căn giữa chữ theo chiều dọc
    alignItems: 'center', // Căn giữa chữ theo chiều ngang
  },
  analysisText: {
    color: '#000', // Màu chữ đen
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ----------------------------------------------------
  // 4. BOTTOM BAR STYLES
  // ----------------------------------------------------
  bottomBar: {
    height: 80, // Chiều cao cố định
    backgroundColor: DARK_BLUE, // Màu xanh đậm
    borderRadius: 20, // Bo góc lớn
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // Phân bố đều các item
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bottomSquare: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  bottomCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20, // 1 nửa chiều rộng/cao để tạo hình tròn
  },
});