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
from dotenv import load_dotenv # 1. Import thư viện đọc file .env
# ==========================================
# 1. CẤU HÌNH AI & DATABASE
# ==========================================
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Cấu hình trả về JSON để xử lý tự động
generation_config = {
    "temperature": 0.4,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

# Dùng model 2.5 Flash mới nhất
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
)

DATABASE_URL = "sqlite:///./dulieu.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
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
# 3. SCHEMAS (Input Models)
# ==========================================
class UserRegister(BaseModel):
    email: str; password: str; full_name: str
class UserLogin(BaseModel):
    email: str; password: str
class UserUpdate(BaseModel):
    height: Optional[float] = None; weight: Optional[float] = None; age: Optional[int] = None
    gender: Optional[str] = None; target_weight: Optional[float] = None; activity_level: Optional[str] = None
    target_calories: Optional[int] = None; target_date: Optional[str] = None; allergies: Optional[str] = None
class ImagePayload(BaseModel): image_base64: str
class MealCreate(BaseModel):
    user_id: int; mealType: str; items: str; calories: float
    protein: float = 0; carbs: float = 0; fat: float = 0
class PasswordChange(BaseModel): old_password: str; new_password: str
class ReportData(BaseModel): user_name: str; target_cal: int; data_summary: List[Dict]
class FeedbackCreate(BaseModel): user_id: int; user_name: str; content: str
class PostCreate(BaseModel): user_name: str; content: str; avatar: str = "https://i.pravatar.cc/150?img=12"

class ChatRequest(BaseModel):
    message: str
    context: str = ""

# ==========================================
# 4. API HANDLING
# ==========================================
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
    return {"message": "Đăng nhập thành công", "user_id": db_user.id, "full_name": db_user.full_name, "target_calories": db_user.target_calories}

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
    
    # Tính TDEE nếu cần
    if not p.target_calories or p.target_calories == 0:
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

# --- AI RECOGNITION (TỰ HỌC) ---
@app.post("/analyze/")
def analyze_image(payload: ImagePayload, db: Session = Depends(get_db)):
    print("🚀 Đang phân tích ảnh với Gemini 2.5 Flash...")
    try:
        clean_base64 = payload.image_base64.split(",")[1] if "," in payload.image_base64 else payload.image_base64
        image_data = base64.b64decode(clean_base64)
        
        prompt = """
        Bạn là chuyên gia dinh dưỡng. Nhìn ảnh và trả về JSON:
        {
            "ten_mon": "Tên món ăn tiếng Việt",
            "don_vi": "đơn vị (bát/dĩa/cái)",
            "calo": số_calo_ước_tính (float),
            "dam": số_protein (float),
            "duong_bot": số_carb (float),
            "beo": số_fat (float),
            "xo": số_xơ (float),
            "vitamin": "các loại vitamin"
        }
        Chỉ trả về JSON, không giải thích.
        """
        response = model.generate_content([{'mime_type': 'image/jpeg', 'data': image_data}, prompt])
        ai_data = json.loads(response.text)
        print(f"🤖 AI thấy: {ai_data['ten_mon']}")

        # Kiểm tra DB
        existing = db.query(ThucPham).filter(ThucPham.TenThucPham.like(f"%{ai_data['ten_mon']}%")).first()
        if existing:
            return {
                "success": True, "food_name": existing.TenThucPham, "unit": existing.DonVi,
                "calories": existing.Calories, "macros": {"protein": existing.Protein, "carbs": existing.Carbs, "fat": existing.ChatBeo},
                "micros": {"fiber": existing.ChatXo, "vitamin": existing.Vitamin},
                "message": "Tìm thấy trong DB."
            }
        else:
            # Tự học (Lưu món mới)
            print("🆕 Món mới -> Đang học vào DB...")
            new_id = f"AI_{int(datetime.datetime.now().timestamp())}"
            new_food = ThucPham(
                MaThucPham=new_id, TenThucPham=ai_data['ten_mon'], DonVi=ai_data['don_vi'],
                Calories=ai_data['calo'], Protein=ai_data['dam'], Carbs=ai_data['duong_bot'],
                ChatBeo=ai_data['beo'], ChatXo=ai_data['xo'], Vitamin=ai_data['vitamin']
            )
            db.add(new_food); db.commit()
            return {
                "success": True, "food_name": ai_data['ten_mon'], "unit": ai_data['don_vi'],
                "calories": ai_data['calo'], "macros": {"protein": ai_data['dam'], "carbs": ai_data['duong_bot'], "fat": ai_data['beo']},
                "micros": {"fiber": ai_data['xo'], "vitamin": ai_data['vitamin']},
                "message": "AI đã học món mới!"
            }
    except Exception as e:
        print("Lỗi:", e)
        return {"success": False, "food_name": "Không rõ", "message": "Ảnh mờ hoặc lỗi kết nối"}

# --- MEALS & REPORT ---
@app.post("/meals/")
def add_meal(m: MealCreate, db: Session = Depends(get_db)):
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
    return {"total_calories": total, "target_calories": user.target_calories if user else 2000, 
            "macros": {"protein": sum(m.protein for m in meals), "carbs": sum(m.carbs for m in meals), "fat": sum(m.fat for m in meals)}, 
            "status": "Vượt" if total > (user.target_calories if user else 2000) else "An toàn"}

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
    # Dùng model text thường (không json) để nó chém gió tự nhiên
    text_model = genai.GenerativeModel('gemini-2.0-flash-lite') 
    data_str = "\n".join([f"{i['date']}: {int(i['totals']['calories'])}/{i['target']} kcal" for i in rd.data_summary])
    prompt = f"Phân tích dinh dưỡng cho {rd.user_name}:\n{data_str}\nCho 3 đoạn: Đánh giá, Gợi ý, Nhắc nhở."
    try: return {"analysis": text_model.generate_content(prompt).text}
    except: return {"analysis": "Lỗi AI phân tích."}

# --- COMMUNITY & ADMIN ---
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

@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    try:
        # Dùng model text nhẹ và nhanh cho chat
        chat_model = genai.GenerativeModel('gemini-2.0-flash-lite') 
        
        # Gửi context (thông tin user) + tin nhắn mới
        full_prompt = f"{req.context}\n\nUser: {req.message}\nAI:"
        
        response = chat_model.generate_content(full_prompt)
        return {"reply": response.text}
    except Exception as e:
        print("Lỗi Chat:", e)
        return {"reply": "Xin lỗi, server đang bận. Bạn thử lại sau nhé!"}