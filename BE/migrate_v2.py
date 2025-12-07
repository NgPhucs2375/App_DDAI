import sqlite3

DB_NAME = "dulieu.db"

def add_column_is_verified():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        print("🛠️ Đang kiểm tra và cập nhật Database...")

        # Kiểm tra xem cột đã tồn tại chưa bằng cách thử truy vấn nó
        try:
            cursor.execute("SELECT is_verified FROM ThucPham LIMIT 1")
            print("✅ Cột 'is_verified' đã tồn tại. Không cần làm gì thêm.")
        except sqlite3.OperationalError:
            # Nếu lỗi (chưa có cột), thì thêm vào
            print("⚠️ Chưa có cột 'is_verified'. Đang thêm mới...")
            
            # Lệnh thêm cột vào bảng (Mặc định là True để các món cũ được coi là đã duyệt)
            cursor.execute("ALTER TABLE ThucPham ADD COLUMN is_verified BOOLEAN DEFAULT 1")
            
            conn.commit()
            print("🎉 Thành công! Đã thêm cột 'is_verified' vào bảng ThucPham.")
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_column_is_verified()