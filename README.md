# App_DDAI

Ứng dụng App_DDAI là một dự án di động (React Native/Expo) kèm backend Python, hỗ trợ ghi nhật ký bữa ăn, theo dõi mục tiêu dinh dưỡng, công thức nấu ăn, báo cáo và hồ sơ người dùng. Dự án gồm giao diện di động (Expo), Android native (Gradle) và BE Python.

**Mục lục**
- 1. Giới thiệu
- 1.2 Yêu cầu cấu hình cài đặt ứng dụng
   - 1.2.1 Phần cứng (đề xuất)
   - 1.2.2 Phần mềm
   - 1.2.3 Biến môi trường & file cấu hình mẫu
   - 1.2.4 Hướng dẫn cài đặt nhanh (local)
- 1.3 Giới thiệu giao diện chương trình
- 2. Cấu trúc dự án (tóm tắt)
- 3. Cài đặt & Build Android (tuỳ chọn)
- 4. Kiểm thử (hướng dẫn cụ thể)
- 5. Lỗi thường gặp & Gợi ý
- 6. Kết luận

---

**1. Giới thiệu**
- Mục tiêu: Theo dõi chế độ ăn, lịch sử bữa ăn, gợi ý công thức, báo cáo và chatbot hỗ trợ.
- Thành phần chính:
   - Frontend: Expo (React Native, TypeScript) trong `app/`, `components/`, `src/`.
   - Android: cấu hình Gradle trong `android/` để build APK.
   - Backend: Python trong `BE/` (`main.py`, script khởi tạo/seed dữ liệu).

---

**1.2 Yêu cầu cấu hình cài đặt ứng dụng**

**1.2.1 Phần cứng (đề xuất)**
- CPU: 4+ cores; RAM: 8 GB (khuyến nghị 16 GB cho build Android)
- Lưu trữ: 10+ GB trống; Thiết bị test: Android 10+ hoặc Emulator

**1.2.2 Phần mềm**
- Windows 10/11, PowerShell 5.1
- Node.js LTS (>= 18), npm hoặc yarn, Expo CLI
- JDK 11+ (build Android), Android Studio + Android SDK/Emulator
- Python 3.10+, pip, venv
- SQLite/PostgreSQL/MySQL (tuỳ chọn theo cấu hình DB)

**1.2.3 Biến môi trường & file cấu hình mẫu**
- Frontend (Expo) `.env` (thư mục gốc):
   ```env
   EXPO_PUBLIC_API_BASE_URL="http://localhost:8000" # URL backend
   EXPO_PUBLIC_ENV="development"                     # môi trường chạy
   # EXPO_PUBLIC_SENTRY_DSN=...                       # tuỳ chọn
   ```
- Backend (Python) `BE/.env`:
   ```env
   APP_ENV=development
   PORT=8000
   DB_URL=sqlite:///./data.db
   # Ví dụ PostgreSQL: postgresql://user:pass@host:5432/dbname
   # OPENAI_API_KEY=... # tuỳ chọn nếu dùng chatbot dịch vụ ngoài
   ```
- Android signing (build release): cấu hình trong `android/app/gradle.properties`:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=******
   MYAPP_UPLOAD_KEY_PASSWORD=******
   ```

**1.2.4 Hướng dẫn cài đặt nhanh (local)**
- Frontend (Expo):
   ```powershell
   # Tại thư mục gốc dự án
   npm install
   npx expo start
   # Nhấn a để mở Android emulator (nếu đã cấu hình)
   ```
- Backend (Python):
   ```powershell
   Push-Location "d:\DA_APP_CNPM\BE";
   python -m venv .venv; .\.venv\Scripts\Activate.ps1;
   # Nếu chưa có requirements.txt, cài gói phổ biến
   pip install fastapi uvicorn sqlalchemy python-dotenv
   python setup_db.py; python seed_1000.py; python seed_posts.py;
   uvicorn main:app --host 0.0.0.0 --port 8000;
   Pop-Location
   ```
- Kết nối Frontend với Backend:
   - Đặt `EXPO_PUBLIC_API_BASE_URL` khớp URL backend (mặc định `http://localhost:8000`).
   - Kiểm tra `src/constants/ApiConfig.ts` hoặc `src/services/api.ts` để đảm bảo URL được dùng đúng.

---

**1.3 Giới thiệu giao diện chương trình**
- Tổng quan các giao diện (Mục tiêu, Chức năng, Hình ảnh):
   - Đăng nhập/Đăng ký (`app/login.tsx`, `app/register.tsx`)
      - Mục tiêu: xác thực người dùng.
      - Chức năng: đăng nhập, quên mật khẩu (`app/forgot-password.tsx`), đổi mật khẩu (`app/change-password.tsx`).
      - Hình ảnh: tham khảo `assets/images/`.
   - Trang chủ Tabs (`app/(drawer)/(tabs)/index.tsx`, `explore.tsx`, `details.tsx`)
      - Mục tiêu: khám phá nội dung và điều hướng nhanh.
      - Chức năng: xem chi tiết, danh sách, thẻ tour (`components/TourCard.tsx`).
      - Hình ảnh: tham khảo `assets/images/` và thư mục `Ảnh test/`.
   - Nhật ký bữa ăn (`app/(drawer)/(tabs)/MealLog.tsx`, `(add)/index.tsx`)
      - Mục tiêu: ghi lại bữa ăn theo ngày/giờ.
      - Chức năng: thêm, sửa, xem chi tiết món/bữa.
   - Lịch sử bữa ăn (`app/(drawer)/(tabs)/MealHistory.tsx`, `app/(drawer)/meal-history.tsx`)
      - Mục tiêu: theo dõi lịch sử dinh dưỡng.
      - Chức năng: lọc, xem biểu đồ/báo cáo (`app/(drawer)/reports.tsx`).
   - Công thức (`app/(drawer)/(tabs)/Recipes.tsx`, `app/(drawer)/recipes.tsx`)
      - Mục tiêu: gợi ý công thức theo mục tiêu.
      - Chức năng: xem, lưu yêu thích.
   - Hồ sơ (`app/(drawer)/(tabs)/profile.tsx`, `app/profile/*`)
      - Mục tiêu: quản lý thông tin cá nhân và mục tiêu.
      - Chức năng: chỉnh sửa (`profile/edit.tsx`), dị ứng (`profile/allergies.tsx`), mục tiêu (`profile/goals.tsx`).
   - Báo cáo (`app/(drawer)/reports.tsx`)
      - Mục tiêu: tổng hợp dữ liệu ăn uống.
      - Chức năng: biểu đồ, thống kê.
   - Chatbot (`app/chatbot.tsx`)
      - Mục tiêu: trợ giúp bằng hội thoại.
      - Chức năng: hỏi đáp, gợi ý.
   - Camera (`app/camera.tsx`)
      - Mục tiêu: chụp ảnh/scan phục vụ nhập liệu.
      - Chức năng: truy cập camera, lưu ảnh.
   - Admin (`admin/dashboard.tsx`)
      - Mục tiêu: giám sát dữ liệu.
      - Chức năng: xem tổng quan, điều hướng quản trị.

---

**2. Cấu trúc dự án (tóm tắt)**
- `app/`: các màn hình Expo.
- `components/`: component UI chung.
- `src/`: logic dữ liệu (`store/`, `services/api.ts`, `constants/ApiConfig.ts`).
- `android/`: cấu hình Gradle để build native.
- `BE/`: backend Python, script DB (`setup_db.py`, `seed_1000.py`, `seed_posts.py`).
- `assets/images/`: hình ảnh UI.

---

**3. Cài đặt & Build Android (tuỳ chọn)**
```powershell
npx expo run:android
Push-Location "d:\DA_APP_CNPM\android"; ./gradlew.bat assembleDebug; Pop-Location
```

---

**4. Kiểm thử (hướng dẫn cụ thể)**
- Đăng ký/đăng nhập:
   1. Chạy backend ở `http://localhost:8000`.
   2. Mở app, vào `Đăng ký`, tạo tài khoản mới.
   3. Đăng nhập với tài khoản vừa tạo, kiểm tra điều hướng tới trang chủ.
- Nhật ký bữa ăn:
   1. Vào `Meal Log`, thêm bữa ăn mới (tên món, thời gian, kcal).
   2. Kiểm tra hiển thị trong `Meal History`.
- Công thức:
   1. Vào `Recipes`, mở chi tiết một công thức.
   2. Lưu yêu thích và xác nhận hiển thị lại trong danh sách.
- Báo cáo:
   1. Vào `Reports`, chọn khoảng thời gian.
   2. Xác nhận biểu đồ và số liệu thống kê hiển thị.
- Hồ sơ:
   1. Vào `Profile`, chỉnh sửa mục tiêu và dị ứng.
   2. Lưu và kiểm tra cập nhật trên các màn hình liên quan.

---

**5. Lỗi thường gặp & Gợi ý**
- Expo không kết nối backend: kiểm tra `EXPO_PUBLIC_API_BASE_URL` và CORS.
- Android emulator không mở: cài HAXM/Hyper-V và tạo AVD.
- Python import lỗi: kích hoạt đúng venv, kiểm tra phiên bản.
- DB không khởi tạo: chạy `setup_db.py` và script seed.

---

**6. Kết luận**
- App_DDAI cung cấp bộ công cụ theo dõi chế độ ăn và sức khỏe. Tài liệu này hướng dẫn cài đặt, cấu hình, kiểm thử và hiểu các màn hình chức năng. Vui lòng mở issue nếu cần hỗ trợ thêm.
