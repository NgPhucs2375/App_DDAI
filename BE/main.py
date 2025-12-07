from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Date, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import datetime
import base64
import json
import google.generativeai as genai
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field, validator

# ==========================================
# 1. CẤU HÌNH AI & DATABASE
# ==========================================
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Cấu hình trả về JSON
generation_config = {
    "temperature": 0.7, # Tăng sáng tạo lên một chút để AI chém gió hay hơn
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

# Dùng model Flash cho nhanh
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", # Hoặc gemini-1.5-flash tùy key của bạn
    generation_config=generation_config,
)

# Chat model riêng (text thường)
chat_model = genai.GenerativeModel('gemini-2.5-flash')

# Cấu hình Database =========================================== 

DATABASE_URL = os.getenv("DATABASE_URL") 

if not DATABASE_URL:
    # Cấu hình cho Local (Máy tính của bạn)
    DATABASE_URL = "sqlite:///./dulieu.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Cấu hình cho Cloud (Render - PostgreSQL)
    # Fix lỗi "postgres://" cũ của Render thành "postgresql://" mới
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# 2. ĐỊNH NGHĨA BẢNG (TABLES)
# ==========================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    height = Column(Float, default=0)
    weight = Column(Float, default=0)
    age = Column(Integer, default=0)
    gender = Column(String, default="Nam")
    activity_level = Column(String, default="Vừa")
    is_admin = Column(Boolean, default=False)
    target_weight = Column(Float, default=0)
    target_calories = Column(Integer, default=2000)
    target_date = Column(String, default="")
    allergies = Column(String, default="")

class ThucPham(Base):
    __tablename__ = "ThucPham"
    MaThucPham = Column(String, primary_key=True, index=True) 
    TenThucPham = Column(String)
    DonVi = Column(String)
    Calories = Column(Float)
    Protein = Column(Float)
    Carbs = Column(Float)
    ChatBeo = Column(Float)
    ChatXo = Column(Float)
    Vitamin = Column(String)
    is_verified = Column(Boolean, default=False)

class Meal(Base):
    __tablename__ = "meals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mealType = Column(String)
    items = Column(String)
    calories = Column(Float)
    protein = Column(Float, default=0)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)
    date = Column(Date, default=datetime.date.today)
    createdAt = Column(String, default=str(datetime.datetime.now()))

class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    user_name = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.now)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String)
    avatar = Column(String)
    content = Column(String)
    image_url = Column(String)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.now)

Base.metadata.create_all(bind=engine)

# ==========================================
# 3. SCHEMAS
# ==========================================
class UserRegister(BaseModel):
    email: str; password: str; full_name: str
class UserLogin(BaseModel):
    email: str; password: str
class UserUpdate(BaseModel):
    height: Optional[float] = Field(None, gt=50, lt=300, description="Chiều cao cm (50-300)")
    weight: Optional[float] = Field(None, gt=20, lt=500, description="Cân nặng kg (20-500)")
    age: Optional[int] = Field(None, gt=5, lt=120, description="Tuổi (5-120)")
    gender: Optional[str] = None
    target_weight: Optional[float] = Field(None, gt=20)
    activity_level: Optional[str] = None
    target_calories: Optional[int] = Field(None, gt=500, lt=10000) # Không cho phép mục tiêu đói lả hoặc ăn quá nhiều
    target_date: Optional[str] = None
    allergies: Optional[str] = None
    
class ImagePayload(BaseModel): 
    image_base64: str
    user_id: int
class MealCreate(BaseModel):
    user_id: int
    mealType: str
    items: str
    calories: float = Field(..., ge=0, description="Calo không được âm") # ge=0: greater or equal 0
    protein: float = Field(0, ge=0)
    carbs: float = Field(0, ge=0)
    fat: float = Field(0, ge=0)
    
    @validator('items')
    def name_must_be_valid(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Tên món ăn quá ngắn')
        return v
    
class PasswordChange(BaseModel): old_password: str; new_password: str
class ReportData(BaseModel): user_name: str; target_cal: int; data_summary: List[Dict]
class FeedbackCreate(BaseModel): user_id: int; user_name: str; content: str
class PostCreate(BaseModel): user_name: str; content: str; avatar: str = "https://i.pravatar.cc/150?img=12"
class ChatRequest(BaseModel): message: str; context: str = ""

# ==========================================
# 4. API HANDLING
# ==========================================
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- AUTH ---
@app.post("/auth/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first(): raise HTTPException(400, "Email tồn tại")
    new_user = User(email=user.email, password=user.password, full_name=user.full_name)
    db.add(new_user); db.commit(); db.refresh(new_user)
    return {"message": "Đăng ký thành công", "user_id": new_user.id}

@app.post("/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email, User.password == user.password).first()
    if not db_user: raise HTTPException(400, "Sai thông tin")
    return {"message": "Đăng nhập thành công", "user_id": db_user.id, "full_name": db_user.full_name, "target_calories": db_user.target_calories,"is_admin": db_user.is_admin}

@app.post("/auth/change-password/{user_id}")
def change_password(user_id: int, pw: PasswordChange, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.password != pw.old_password: raise HTTPException(400, "Mật khẩu cũ sai")
    user.password = pw.new_password; db.commit()
    return {"message": "Đổi mật khẩu thành công"}

# --- USER PROFILE ---
@app.get("/user/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    return db.query(User).filter(User.id == user_id).first() or HTTPException(404)

@app.post("/user/{user_id}/update")
def update_profile(user_id: int, p: UserUpdate, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404)
    data = p.dict(exclude_unset=True)
    for k, v in data.items(): setattr(u, k, v)
    
    # Tính TDEE tự động (Pillar 3: Logic)
    if u.weight > 0 and u.height > 0 and u.age > 0:
        bmr = (10 * u.weight + 6.25 * u.height - 5 * u.age + (5 if u.gender == "Nam" else -161))
        tdee = bmr * (1.55 if u.activity_level == "Vừa" else 1.2)
        if u.target_weight < u.weight: tdee -= 500
        elif u.target_weight > u.weight: tdee += 500
        u.target_calories = int(tdee)
    
    db.commit()
    return {"new_target_calories": u.target_calories}

# --- FOOD SEARCH ---
@app.get("/food/search")
def search_food(query: str, db: Session = Depends(get_db)):
    return db.query(ThucPham).filter(ThucPham.TenThucPham.like(f"%{query}%")).limit(20).all()

# --- AI RECOGNITION (NÂNG CẤP PERSONA & TỰ HỌC) ---
@app.post("/analyze/")
def analyze_image(payload: ImagePayload, db: Session = Depends(get_db)):
    print(f"🚀 Đang phân tích ảnh cho User ID: {payload.user_id}...")
    try:
        # Lấy thông tin dị ứng của User
        user = db.query(User).filter(User.id == payload.user_id).first()
        allergies = user.allergies if user and user.allergies else "Không có"

        clean_base64 = payload.image_base64.split(",")[1] if "," in payload.image_base64 else payload.image_base64
        image_data = base64.b64decode(clean_base64)
        
        # PROMPT NÂNG CẤP: Yêu cầu check dị ứng cực gắt
        prompt = f"""
        Bạn là chuyên gia dinh dưỡng và an toàn thực phẩm.
        Người dùng này bị DỊ ỨNG: {allergies}.
        
        Hãy nhìn kỹ món ăn trong ảnh và trả về JSON:
        {{
            "ten_mon": "Tên món tiếng Việt",
            "don_vi": "dĩa/tô/cái",
            "calo": số_calo_ước_tính (int),
            "dam": số_protein (float),
            "duong_bot": số_carb (float),
            "beo": số_fat (float),
            "xo": số_xơ (float),
            "vitamin": "tên các vitamin",
            "message": "Lời nhận xét.",
            "warning": "CẢNH BÁO NGUY HIỂM nếu món này chứa thành phần dị ứng ({allergies}). Nếu an toàn, để trống."
        }}
        
        LƯU Ý: Nếu thấy thành phần dị ứng (ví dụ: đậu phộng, tôm...), hãy viết cảnh báo in hoa vào trường 'warning'.
        """
        
        response = model.generate_content([{'mime_type': 'image/jpeg', 'data': image_data}, prompt])
        ai_data = json.loads(response.text)
        
        # Log để kiểm tra
        if ai_data.get("warning"):
            print(f"⚠️ CẢNH BÁO DỊ ỨNG: {ai_data['warning']}")

        return {
            "success": True, 
            "food_name": ai_data['ten_mon'], 
            "unit": ai_data['don_vi'],
            "calories": ai_data['calo'], 
            "macros": {"protein": ai_data['dam'], "carbs": ai_data['duong_bot'], "fat": ai_data['beo']},
            "micros": {"fiber": ai_data['xo'], "vitamin": ai_data['vitamin']},
            "message": ai_data['message'],
            "warning": ai_data.get("warning", "") # Trả về cảnh báo cho Frontend
        }
    except Exception as e:
        print("Lỗi:", e)
        return {"success": False, "food_name": "Không rõ", "message": "Lỗi phân tích", "warning": ""}
    
    
    
# --- MEALS & REPORT ---
@app.post("/meals/")
def add_meal(m: MealCreate, db: Session = Depends(get_db)):
    # Lưu bữa ăn vào lịch sử
    db.add(Meal(**m.dict(), date=datetime.date.today())); db.commit()
    return {"message": "Saved"}

@app.get("/meals/history/{user_id}")
def get_history(user_id: int, date: str = None, db: Session = Depends(get_db)):
    d = datetime.datetime.strptime(date, "%Y-%m-%d").date() if date else datetime.date.today()
    return db.query(Meal).filter(Meal.user_id == user_id, Meal.date == d).order_by(Meal.id.desc()).all()

@app.get("/meals/") # Fallback
def get_all_meals_fallback(db: Session = Depends(get_db)):
    return db.query(Meal).order_by(Meal.id.desc()).all()

@app.get("/report/daily/{user_id}")
def get_daily_report(user_id: int, db: Session = Depends(get_db)):
    meals = db.query(Meal).filter(Meal.user_id == user_id, Meal.date == datetime.date.today()).all()
    user = db.query(User).filter(User.id == user_id).first()
    total = sum(m.calories for m in meals)
    return {
        "total_calories": total, 
        "target_calories": user.target_calories if user else 2000, 
        "macros": {
            "protein": sum(m.protein for m in meals), 
            "carbs": sum(m.carbs for m in meals), 
            "fat": sum(m.fat for m in meals)
        }, 
        "status": "Vượt" if total > (user.target_calories if user else 2000) else "An toàn"
    }

@app.get("/report/history/{user_id}")
def get_historical_report(user_id: int, start_date: str, end_date: str, db: Session = Depends(get_db)):
    s, e = datetime.datetime.strptime(start_date, "%Y-%m-%d").date(), datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
    meals = db.query(Meal).filter(Meal.user_id == user_id, Meal.date >= s, Meal.date <= e).all()
    report = {}
    curr = s
    while curr <= e:
        report[curr.strftime("%Y-%m-%d")] = {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0}
        curr += datetime.timedelta(days=1)
    for m in meals:
        d = m.date.strftime("%Y-%m-%d")
        report[d]["calories"] += m.calories
        report[d]["protein"] += m.protein
        report[d]["carbs"] += m.carbs
        report[d]["fat"] += m.fat
    u = db.query(User).filter(User.id == user_id).first()
    return [{"date": k, "totals": v, "target": u.target_calories if u else 2000} for k, v in report.items()]

@app.post("/analyze/report/{user_id}")
def ai_analyze_report(rd: ReportData):
    prompt = f"Phân tích dinh dưỡng cho {rd.user_name}:\n{rd.data_summary}\nCho 3 đoạn ngắn gọn: Đánh giá, Gợi ý, Nhắc nhở."
    try: return {"analysis": chat_model.generate_content(prompt).text}
    except: return {"analysis": "AI đang bận."}

# --- CHATBOT ---
@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    try:
        # Prompt hệ thống cho Chatbot
        system_instruction = "Bạn là trợ lý dinh dưỡng tên là FitBot. Hãy trả lời ngắn gọn, vui vẻ và tập trung vào sức khỏe."
        full_prompt = f"{system_instruction}\nContext: {req.context}\nUser: {req.message}\nFitBot:"
        response = chat_model.generate_content(full_prompt)
        return {"reply": response.text}
    except Exception as e:
        return {"reply": "Xin lỗi, mình đang mất kết nối."}

# --- COMMUNITY ---
@app.post("/community/posts/")
def create_post(p: PostCreate, db: Session = Depends(get_db)):
    new_post = Post(user_name=p.user_name, content=p.content, avatar=p.avatar, likes=0, image_url="")
    db.add(new_post); db.commit(); db.refresh(new_post)
    return {"message": "Đăng bài thành công", "post": new_post}

@app.get("/community/posts")
def get_posts(db: Session = Depends(get_db)):
    if db.query(Post).count() == 0: 
        db.add_all([Post(user_name="Admin", content="Chào mừng!", likes=10)])
        db.commit()
    return db.query(Post).order_by(Post.created_at.desc()).all()

@app.post("/community/posts/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db)):
    p = db.query(Post).filter(Post.id == post_id).first()
    if p: p.likes += 1; db.commit()
    return {"likes": p.likes if p else 0}

@app.post("/feedback/")
def send_feedback(fb: FeedbackCreate, db: Session = Depends(get_db)):
    db.add(Feedback(user_id=fb.user_id, user_name=fb.user_name, content=fb.content)); db.commit()
    return {"message": "Sent"}

@app.get("/admin/feedbacks")
def get_feedbacks(db: Session = Depends(get_db)):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()

@app.get("/admin/pending-foods")
def get_pending_foods(db: Session = Depends(get_db)):
    return db.query(ThucPham).filter(ThucPham.is_verified == False).all()

@app.post("/admin/approve-food/{food_id}")
def approve_food(food_id: str, db: Session = Depends(get_db)):
    food = db.query(ThucPham).filter(ThucPham.MaThucPham == food_id).first()
    if food:
        food.is_verified = True
        db.commit()
        return {"message": "Đã duyệt món ăn!"}
    raise HTTPException(404, "Không tìm thấy món")

@app.delete("/admin/delete-food/{food_id}")
def delete_food(food_id: str, db: Session = Depends(get_db)):
    food = db.query(ThucPham).filter(ThucPham.MaThucPham == food_id).first()
    if food:
        db.delete(food)
        db.commit()
        return {"message": "Đã xóa món rác!"}
    raise HTTPException(404, "Không tìm thấy món")