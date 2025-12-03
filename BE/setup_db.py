import sqlite3
import re
import os

DB_NAME = "dulieu.db"
SQL_FILE = "QL DỮ LIỆU.sql"

def migrate_database():
    # 1. Xóa sạch DB cũ để làm mới hoàn toàn
    if os.path.exists(DB_NAME):
        try:
            os.remove(DB_NAME)
            print(f"🗑️  Đã xóa database cũ '{DB_NAME}'")
        except PermissionError:
            print("❌ LỖI: File đang bị khóa! Hãy tắt Server Python (Ctrl+C) trước khi chạy.")
            return

    # 2. Kết nối và tạo cấu trúc bảng chuẩn
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print("🛠️  Đang tạo cấu trúc bảng...")

    # Bảng ThucPham (Menu)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ThucPham (
        MaThucPham TEXT PRIMARY KEY,
        TenThucPham TEXT,
        DonVi TEXT,
        Calories REAL,
        Protein REAL,
        Carbs REAL,
        ChatBeo REAL,
        ChatXo REAL,
        Vitamin TEXT,
        MaLoai TEXT
    );
    """)
    
    # Bảng users (Người dùng) - Có cột is_admin
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        full_name TEXT,
        height REAL DEFAULT 0,
        weight REAL DEFAULT 0,
        age INTEGER DEFAULT 0,
        gender TEXT DEFAULT 'Nam',
        activity_level TEXT DEFAULT 'Vừa',
        target_weight REAL DEFAULT 0,
        target_calories INTEGER DEFAULT 2000,
        target_date TEXT DEFAULT '',
        allergies TEXT DEFAULT '',
        is_admin BOOLEAN DEFAULT 0
    );
    """)

    # Bảng meals (Nhật ký)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        mealType TEXT,
        items TEXT,
        calories REAL,
        protein REAL DEFAULT 0,
        carbs REAL DEFAULT 0,
        fat REAL DEFAULT 0,
        date DATE DEFAULT (date('now')),
        createdAt TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    """)

    # --- MỚI: Bảng Feedbacks (Góp ý cho Admin) ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_name TEXT,
        content TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)

    # --- MỚI: Bảng Posts (Cộng đồng) ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT,
        avatar TEXT,
        content TEXT,
        image_url TEXT,
        likes INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)

    print("✅ Đã tạo đủ 5 bảng (ThucPham, Users, Meals, Posts, Feedbacks).")

    # 3. Nạp dữ liệu Thực Phẩm từ file SQL
    food_count = 0
    if os.path.exists(SQL_FILE):
        print("⏳ Đang nạp dữ liệu thực phẩm từ SQL...")
        with open(SQL_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        inserts = re.findall(r"INSERT INTO ThucPham.*?;", content, re.DOTALL)
        for statement in inserts:
            # Làm sạch cú pháp SQL Server (N' -> ')
            clean_stmt = re.sub(r"N'([^']*)'", r"'\1'", statement)
            try:
                cursor.execute(clean_stmt)
                food_count += 1
            except Exception:
                pass
    else:
        print(f"⚠️ Cảnh báo: Không tìm thấy file '{SQL_FILE}', bảng ThucPham sẽ trống.")

    # 4. Nạp dữ liệu mẫu cho Cộng Đồng (Posts)
    print("🌱 Đang tạo bài viết mẫu cho Cộng đồng...")
    posts_data = [
        ("Admin", "https://i.pravatar.cc/150?u=admin", "Chào mừng các bạn đến với cộng đồng Eat Clean! 🥗", "https://picsum.photos/500/300?random=1", 999),
        ("Thảo Nhi", "https://i.pravatar.cc/150?u=nhi", "Hôm nay mình làm món salad ức gà, ngon tuyệt! 😋", "https://picsum.photos/500/300?random=2", 25),
        ("Minh Tuấn", "https://i.pravatar.cc/150?u=tuan", "Mục tiêu giảm 5kg trong tháng này. Cố lên! 💪", "https://picsum.photos/500/300?random=3", 14),
    ]
    cursor.executemany("""
        INSERT INTO posts (user_name, avatar, content, image_url, likes)
        VALUES (?, ?, ?, ?, ?)
    """, posts_data)

    # 5. Tạo tài khoản Admin mặc định
    print("👤 Đang tạo tài khoản Admin...")
    try:
        cursor.execute("""
            INSERT INTO users (email, password, full_name, target_calories, is_admin) 
            VALUES ('admin@gmail.com', '123456', 'Administrator', 2000, 1)
        """)
    except:
        pass # Nếu đã có thì bỏ qua

    conn.commit()
    conn.close()
    
    print("="*40)
    print(f"🎉 HOÀN TẤT QUÁ TRÌNH SETUP!")
    print(f"📊 Thực phẩm: {food_count} món")
    print(f"📝 Bài viết mẫu: {len(posts_data)} bài")
    print(f"🔑 Tài khoản Admin: admin@gmail.com / 123456")
    print("="*40)
    print("👉 Bây giờ hãy chạy: python -m uvicorn main:app --reload --host 0.0.0.0")

if __name__ == "__main__":
    migrate_database()