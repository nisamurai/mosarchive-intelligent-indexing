"""
Backend API для авторизации пользователей
Использует FastAPI с JWT токенами для аутентификации
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
import json
import os

# Конфигурация
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Инициализация FastAPI
app = FastAPI(title="Auth API", version="1.0.0")

# CORS middleware для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174",  
        "http://localhost:5175",  # Vite может использовать разные порты
        "http://localhost:3000", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

# Модели данных
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class TokenResponse(BaseModel):
    token: str
    token_type: str = "bearer"

class UserInfo(BaseModel):
    username: str
    email: Optional[str] = None

# Простое хранилище пользователей (TODO: использовать базу данных)
USERS_DB: Dict[str, Dict[str, Any]] = {
    "admin": {
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "email": "admin@example.com",
        "created_at": datetime.now().isoformat()
    },
    "user": {
        "password_hash": hashlib.sha256("user123".encode()).hexdigest(),
        "email": "user@example.com",
        "created_at": datetime.now().isoformat()
    }
}

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля"""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создание JWT токена"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Проверка JWT токена"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный токен",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Регистрация нового пользователя"""
    print(f"Запрос регистрации: {user_data.username}")
    username = user_data.username.lower()
    
    # Проверка существования пользователя
    if username in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем уже существует"
        )
    
    # Валидация данных
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароль должен содержать минимум 6 символов"
        )
    
    if len(user_data.username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Имя пользователя должно содержать минимум 3 символа"
        )
    
    # Создание пользователя
    password_hash = hash_password(user_data.password)
    USERS_DB[username] = {
        "password_hash": password_hash,
        "email": user_data.email,
        "created_at": datetime.now().isoformat()
    }
    
    # Создание токена
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username}, expires_delta=access_token_expires
    )
    
    return TokenResponse(token=access_token)

@app.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """Авторизация пользователя"""
    print(f"Запрос входа: {user_data.username}")
    username = user_data.username.lower()
    
    # Проверка существования пользователя
    if username not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль"
        )
    
    # Проверка пароля
    user = USERS_DB[username]
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль"
        )
    
    # Создание токена
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username}, expires_delta=access_token_expires
    )
    
    return TokenResponse(token=access_token)

@app.get("/me", response_model=UserInfo)
async def get_current_user(current_user: str = Depends(verify_token)):
    """Получение информации о текущем пользователе"""
    if current_user not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    user = USERS_DB[current_user]
    return UserInfo(
        username=current_user,
        email=user.get("email")
    )

@app.post("/logout")
async def logout():
    """Выход из системы (в реальном проекте можно добавить blacklist токенов)"""
    return {"message": "Успешный выход из системы"}

@app.get("/health")
async def health_check():
    """Проверка состояния API"""
    return {"status": "ok", "message": "Auth API работает"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
