from typing import Union, List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from jose import JWTError, jwt
from passlib.context import CryptContext
from uuid import uuid4
import os
import shutil
from pathlib import Path
from sqlalchemy.orm import Session
from database import get_db, User, Category, Tag, Post as DBPost, Comment as DBComment, post_tags, FriendLink


# 配置JWT
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY', "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = os.getenv('ALGORITHM', "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', "30"))

# 密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(
    title="Vue Blog API",
    description="Vue博客系统后端API接口",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "认证", "description": "用户认证相关接口"},
        {"name": "用户", "description": "用户管理相关接口"},
        {"name": "文章", "description": "博客文章相关接口"},
        {"name": "分类", "description": "文章分类相关接口"},
        {"name": "标签", "description": "文章标签相关接口"},
        {"name": "评论", "description": "文章评论相关接口"},
        {"name": "上传", "description": "文件上传相关接口"}
    ],
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,  # 默认不展开模型
        "docExpansion": "list",  # 默认展开列表
        "persistAuthorization": True,  # 保持授权信息
        "displayRequestDuration": True,  # 显示请求持续时间
        "filter": True,  # 启用过滤功能
        "syntaxHighlight.theme": "agate",  # 语法高亮主题
        "lang": "zh-cn"  # 设置Swagger UI界面为中文
    }
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制为前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建上传目录
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 静态文件服务
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 获取上传文件列表接口
from fastapi.responses import JSONResponse
from fastapi import Body, Query

@app.get("/api/upload/list", tags=["上传"], summary="获取上传文件列表")
async def list_upload_files():
    files = []
    for file in UPLOAD_DIR.iterdir():
        if file.is_file():
            stat = file.stat()
            files.append({
                "filename": file.name,
                "filepath": f"/uploads/{file.name}",
                "size": stat.st_size,
                "uploadTime": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                "mimetype": "image" if file.suffix.lower() in [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"] else "document" if file.suffix.lower() in [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"] else "other"
            })
    return JSONResponse(content=files)

# 删除上传文件
@app.delete("/api/upload/delete", tags=["上传"], summary="删除上传文件")
async def delete_upload_file(filename: str = Query(..., description="要删除的文件名")):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        return JSONResponse(content={"success": False, "msg": "文件不存在"}, status_code=404)
    file_path.unlink()
    return {"success": True, "msg": "文件已删除"}

# 重命名上传文件
@app.post("/api/upload/rename", tags=["上传"], summary="重命名上传文件")
async def rename_upload_file(data: dict = Body(...)):
    oldname = data.get("oldname")
    newname = data.get("newname")
    if not oldname or not newname:
        return JSONResponse(content={"success": False, "msg": "参数缺失"}, status_code=400)
    old_path = UPLOAD_DIR / oldname
    new_path = UPLOAD_DIR / newname
    if not old_path.exists() or not old_path.is_file():
        return JSONResponse(content={"success": False, "msg": "原文件不存在"}, status_code=404)
    if new_path.exists():
        return JSONResponse(content={"success": False, "msg": "目标文件已存在"}, status_code=400)
    old_path.rename(new_path)
    return {"success": True, "msg": "文件已重命名"}

# 数据模型
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserInfo(UserBase):
    id: str
    role: str
    avatar: Optional[str] = None
    createdAt: str

class LoginResponse(BaseModel):
    token: str
    user: UserInfo

class TagBase(BaseModel):
    name: str

class CategoryBase(BaseModel):
    name: str

class PostBase(BaseModel):
    title: str
    content: str
    description: Optional[str] = None
    category: str
    tags: List[str] = []
    status: str = "draft"  # draft, published, private

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    pass

class Post(PostBase):
    id: str
    author: str
    views: int = 0
    publishDate: Optional[str] = None
    updateTime: str
    coverImage: Optional[str] = None
    commentCount: int = 0

class CommentBase(BaseModel):
    content: str
    postId: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: str
    author: str
    createdAt: str
    parentId: Optional[str] = None

class FileResponse(BaseModel):
    filename: str
    filepath: str

# 用户权限映射
role_permissions = {
    "admin": ["create_post", "edit_post", "delete_post", "manage_users", "manage_categories", "manage_tags", "like_post", "comment_post", "update_profile"],
    "editor": ["create_post", "edit_post", "like_post", "comment_post", "update_profile"],
    "user": ["like_post", "comment_post", "update_profile"]
}

# 辅助函数
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_user_permissions(role: str):
    return role_permissions.get(role, [])

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    
    # 添加权限信息
    user_dict = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "avatar": user.avatar,
        "createdAt": user.created_at.isoformat(),
        "permissions": get_user_permissions(user.role)
    }
    return user_dict

# Settings API

class BasicSettingsModel(BaseModel):
    siteTitle: str
    siteDescription: str
    siteLogo: str = ""
    postsPerPage: int = 10
    theme: str = "light"
    carouselEnabled: bool = False
    carouselApiUrl: str = ""
    carouselImageCount: int = 5
    carouselInterval: int = 5
    icp: str = ""
    startYear: int = 2023
    footerText: str = ""
    footerLinks: list = []

class ProfileSettingsModel(BaseModel):
    avatar: str = ""
    nickname: str = ""
    bio: str = ""
    email: str = ""
    socialLinks: list = []

class AdvancedSettingsModel(BaseModel):
    analytics: dict = {}
    customHead: str = ""
    customFooter: str = ""
    seo: dict = {}
    cdn: dict = {}

@app.get("/api/settings/basic", tags=["设置"], response_model=BasicSettingsModel)
def get_basic_settings(db: Session = Depends(get_db)):
    setting = db.query(Setting).filter_by(key="basic", category="basic").first()
    if setting:
        return setting.value
    # 返回默认
    return BasicSettingsModel().dict()

@app.put("/api/settings/basic", tags=["设置"], response_model=BasicSettingsModel)
def update_basic_settings(data: BasicSettingsModel, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter_by(key="basic", category="basic").first()
    if not setting:
        setting = Setting(key="basic", category="basic", value=data.dict())
        db.add(setting)
    else:
        setting.value = data.dict()
    db.commit()
    return setting.value

@app.get("/api/settings/profile", tags=["设置"], response_model=ProfileSettingsModel)
def get_profile_settings(db: Session = Depends(get_db)):
    setting = db.query(Setting).filter_by(key="profile", category="profile").first()
    if setting:
        return setting.value
    return ProfileSettingsModel().dict()

@app.put("/api/settings/profile", tags=["设置"], response_model=ProfileSettingsModel)
def update_profile_settings(data: ProfileSettingsModel, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter_by(key="profile", category="profile").first()
    if not setting:
        setting = Setting(key="profile", category="profile", value=data.dict())
        db.add(setting)
    else:
        setting.value = data.dict()
    db.commit()
    return setting.value

@app.get("/api/settings/advanced", tags=["设置"], response_model=AdvancedSettingsModel)
def get_advanced_settings(db: Session = Depends(get_db)):
    setting = db.query(Setting).filter_by(key="advanced", category="advanced").first()
    if setting:
        return setting.value
    return AdvancedSettingsModel().dict()

@app.put("/api/settings/advanced", tags=["设置"], response_model=AdvancedSettingsModel)
def update_advanced_settings(data: AdvancedSettingsModel, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter_by(key="advanced", category="advanced").first()
    if not setting:
        setting = Setting(key="advanced", category="advanced", value=data.dict())
        db.add(setting)
    else:
        setting.value = data.dict()
    db.commit()
    return setting.value

# 路由

from pydantic import BaseModel

class FriendLinkBase(BaseModel):
    name: str
    url: str
    icon: str = ""
    description: str = ""

class FriendLinkCreate(FriendLinkBase):
    pass

class FriendLinkUpdate(FriendLinkBase):
    status: str = "pending"

class FriendLinkOut(FriendLinkBase):
    id: str
    status: str
    created_at: str

from fastapi import Depends
from sqlalchemy.orm import Session
from database import Setting
from pydantic import BaseModel
from typing import Any

def admin_required(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以操作")
    return current_user

@app.get("/api/friend-links", tags=["友情链接"], summary="获取所有友情链接", response_model=List[FriendLinkOut])
async def get_friend_links(db: Session = Depends(get_db)):
    links = db.query(FriendLink).order_by(FriendLink.created_at.desc()).all()
    return [
        FriendLinkOut(
            id=link.id,
            name=link.name,
            url=link.url,
            icon=link.icon or "",
            description=link.description or "",
            status=link.status,
            created_at=link.created_at.isoformat()
        ) for link in links
    ]

@app.post("/api/friend-links", tags=["友情链接"], summary="新增友情链接", response_model=FriendLinkOut)
async def create_friend_link(link: FriendLinkCreate, db: Session = Depends(get_db), current_user: dict = Depends(admin_required)):
    new_link = FriendLink(
        name=link.name,
        url=link.url,
        icon=link.icon,
        description=link.description,
        status="approved"
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    return FriendLinkOut(
        id=new_link.id,
        name=new_link.name,
        url=new_link.url,
        icon=new_link.icon or "",
        description=new_link.description or "",
        status=new_link.status,
        created_at=new_link.created_at.isoformat()
    )

@app.delete("/api/friend-links/{link_id}", tags=["友情链接"], summary="删除友情链接")
async def delete_friend_link(link_id: str, db: Session = Depends(get_db), current_user: dict = Depends(admin_required)):
    link = db.query(FriendLink).filter(FriendLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="友链不存在")
    db.delete(link)
    db.commit()
    return {"message": "删除成功"}

@app.put("/api/friend-links/{link_id}", tags=["友情链接"], summary="更新友情链接", response_model=FriendLinkOut)
async def update_friend_link(link_id: str, link: FriendLinkUpdate, db: Session = Depends(get_db), current_user: dict = Depends(admin_required)):
    db_link = db.query(FriendLink).filter(FriendLink.id == link_id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="友链不存在")
    db_link.name = link.name
    db_link.url = link.url
    db_link.icon = link.icon
    db_link.description = link.description
    db_link.status = link.status
    db.commit()
    db.refresh(db_link)
    return FriendLinkOut(
        id=db_link.id,
        name=db_link.name,
        url=db_link.url,
        icon=db_link.icon or "",
        description=db_link.description or "",
        status=db_link.status,
        created_at=db_link.created_at.isoformat()
    )

@app.get("/", tags=["系统"], summary="API根路径", description="返回API欢迎信息")
def read_root():
    return {"message": "欢迎使用Vue博客API系统"}

# 用户认证路由
@app.post("/token", response_model=Token, tags=["认证"], summary="获取访问令牌", description="用户登录并获取JWT访问令牌")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码不正确",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login", response_model=LoginResponse, tags=["认证"], summary="用户登录", description="用户登录并获取用户信息与访问令牌")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码不正确"
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar,
            "createdAt": user.created_at.isoformat()
        }
    }

@app.post("/api/register", response_model=UserInfo, tags=["认证"], summary="用户注册", description="创建新用户账号")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已被注册"
        )
    
    # 检查邮箱是否已存在
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )
    
    hashed_password = get_password_hash(user_data.password)
    avatar_url = f"https://api.dicebear.com/7.x/adventurer/svg?seed={user_data.username}"
    
    # 创建新用户
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role="user",
        avatar=avatar_url
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role,
        "avatar": new_user.avatar,
        "createdAt": new_user.created_at.isoformat()
    }

@app.get("/api/users/me", response_model=UserInfo, tags=["用户"], summary="获取当前用户信息", description="获取当前登录用户的详细信息")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "avatar": current_user["avatar"],
        "createdAt": current_user["createdAt"]
    }

class UserProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None

@app.put("/api/users/profile", response_model=UserInfo, tags=["用户"], summary="更新个人资料", description="更新当前登录用户的个人资料")
async def update_profile(profile_data: UserProfileUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查用户权限
    if "update_profile" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有权限更新个人资料")
    
    # 查找用户
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户未找到")
    
    # 更新用户信息
    if profile_data.email is not None:
        # 检查邮箱是否已被其他用户使用
        existing_email = db.query(User).filter(User.email == profile_data.email, User.id != user.id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="邮箱已被其他用户注册")
        user.email = profile_data.email
    
    if profile_data.avatar is not None:
        user.avatar = profile_data.avatar
    
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "avatar": user.avatar,
        "createdAt": user.created_at.isoformat()
    }

# 文章相关路由
@app.get("/api/posts", response_model=List[Post], tags=["文章"], summary="获取文章列表", description="获取所有文章或按状态、分类筛选文章")
async def get_posts(status: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(DBPost)
    
    if status:
        query = query.filter(DBPost.status == status)
    
    if category:
        query = query.join(Category).filter(Category.name == category)
    
    db_posts = query.all()
    
    # 转换为API模型
    result = []
    for post in db_posts:
        # 获取标签列表
        tags = [tag.name for tag in post.tags]
        
        # 计算评论数
        comment_count = db.query(DBComment).filter(DBComment.post_id == post.id).count()
        
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "description": post.description,
            "category": post.category.name,
            "tags": tags,
            "status": post.status,
            "author": post.user.username,
            "views": post.views,
            "publishDate": post.publish_date.isoformat() if post.publish_date else None,
            "updateTime": post.updated_at.isoformat(),
            "coverImage": post.cover_image,
            "commentCount": comment_count
        })
    
    return result

@app.get("/api/posts/{post_id}", response_model=Post, tags=["文章"], summary="获取单篇文章", description="根据文章ID获取文章详情")
async def get_post(post_id: str, db: Session = Depends(get_db)):
    post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 增加阅读量
    post.views += 1
    db.commit()
    
    # 获取标签列表
    tags = [tag.name for tag in post.tags]
    
    # 计算评论数
    comment_count = db.query(DBComment).filter(DBComment.post_id == post.id).count()
    
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "description": post.description,
        "category": post.category.name,
        "tags": tags,
        "status": post.status,
        "author": post.user.username,
        "views": post.views,
        "publishDate": post.publish_date.isoformat() if post.publish_date else None,
        "updateTime": post.updated_at.isoformat(),
        "coverImage": post.cover_image,
        "commentCount": comment_count
    }

@app.post("/api/posts", response_model=Post, tags=["文章"], summary="创建文章", description="创建新的博客文章")
async def create_post(post: PostCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查用户权限
    if "create_post" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有创建文章的权限")
    
    # 获取分类
    category = db.query(Category).filter(Category.name == post.category).first()
    if not category:
        # 如果分类不存在，创建新分类
        category = Category(name=post.category)
        db.add(category)
        db.commit()
        db.refresh(category)
    
    # 创建新文章
    description = post.description or post.content[:100] + "..."
    new_post = DBPost(
        title=post.title,
        content=post.content,
        description=description,
        author=current_user["id"],
        category_id=category.id,
        status=post.status
    )
    
    if post.status == "published":
        new_post.publish_date = datetime.now()
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # 处理标签
    for tag_name in post.tags:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            # 如果标签不存在，创建新标签
            tag = Tag(name=tag_name)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        
        # 添加文章-标签关联
        new_post.tags.append(tag)
    
    db.commit()
    
    # 返回API格式的文章
    return {
        "id": new_post.id,
        "title": new_post.title,
        "content": new_post.content,
        "description": new_post.description,
        "category": category.name,
        "tags": post.tags,
        "status": new_post.status,
        "author": current_user["username"],
        "views": new_post.views,
        "publishDate": new_post.publish_date.isoformat() if new_post.publish_date else None,
        "updateTime": new_post.updated_at.isoformat(),
        "coverImage": new_post.cover_image,
        "commentCount": 0
    }

@app.put("/api/posts/{post_id}", response_model=Post, tags=["文章"], summary="更新文章", description="修改现有博客文章的内容")
async def update_post(post_id: str, post: PostUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 查找文章
    db_post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 检查用户权限
    is_author = db_post.user.username == current_user["username"]
    can_edit = "edit_post" in current_user.get("permissions", [])
    
    if not (is_author and can_edit) and "manage_users" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有权限更新此文章")
    
    # 获取分类
    category = db.query(Category).filter(Category.name == post.category).first()
    if not category:
        # 如果分类不存在，创建新分类
        category = Category(name=post.category)
        db.add(category)
        db.commit()
        db.refresh(category)
    
    # 更新文章
    db_post.title = post.title
    db_post.content = post.content
    db_post.description = post.description or post.content[:100] + "..."
    db_post.category_id = category.id
    
    # 如果状态从草稿变为已发布，设置发布日期
    if db_post.status != "published" and post.status == "published":
        db_post.publish_date = datetime.now()
    
    db_post.status = post.status
    
    # 更新标签
    # 清除现有标签关联
    db_post.tags.clear()
    
    # 添加新标签
    for tag_name in post.tags:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            # 如果标签不存在，创建新标签
            tag = Tag(name=tag_name)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        
        # 添加文章-标签关联
        db_post.tags.append(tag)
    
    db.commit()
    db.refresh(db_post)
    
    # 计算评论数
    comment_count = db.query(DBComment).filter(DBComment.post_id == db_post.id).count()
    
    # 返回API格式的文章
    return {
        "id": db_post.id,
        "title": db_post.title,
        "content": db_post.content,
        "description": db_post.description,
        "category": category.name,
        "tags": [tag.name for tag in db_post.tags],
        "status": db_post.status,
        "author": db_post.user.username,
        "views": db_post.views,
        "publishDate": db_post.publish_date.isoformat() if db_post.publish_date else None,
        "updateTime": db_post.updated_at.isoformat(),
        "coverImage": db_post.cover_image,
        "commentCount": comment_count
    }

@app.delete("/api/posts/{post_id}", tags=["文章"], summary="删除文章", description="删除指定的博客文章")
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 查找文章
    post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 检查用户权限
    is_author = post.user.username == current_user["username"]
    can_delete = "delete_post" in current_user.get("permissions", [])
    
    if not (is_author and can_delete) and "manage_users" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有权限删除此文章")
    
    # 删除相关评论
    db.query(DBComment).filter(DBComment.post_id == post_id).delete()
    
    # 删除文章
    db.delete(post)
    db.commit()
    
    return {"message": "文章删除成功"}

# 点赞相关路由
@app.post("/api/posts/{post_id}/like", tags=["文章"], summary="点赞文章", description="为指定文章添加点赞")
async def like_post(post_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查用户权限
    if "like_post" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有点赞权限")
    
    # 检查文章是否存在
    post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 检查用户是否已经点赞过
    from database import PostLike
    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user["id"]
    ).first()
    
    if existing_like:
        raise HTTPException(status_code=400, detail="已经点赞过该文章")
    
    # 创建新点赞
    new_like = PostLike(
        post_id=post_id,
        user_id=current_user["id"]
    )
    
    db.add(new_like)
    db.commit()
    
    return {"message": "点赞成功"}

@app.delete("/api/posts/{post_id}/like", tags=["文章"], summary="取消点赞", description="取消对指定文章的点赞")
async def unlike_post(post_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查用户权限
    if "like_post" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有点赞权限")
    
    # 检查文章是否存在
    post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 查找用户的点赞记录
    from database import PostLike
    like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user["id"]
    ).first()
    
    if not like:
        raise HTTPException(status_code=404, detail="未找到点赞记录")
    
    # 删除点赞
    db.delete(like)
    db.commit()
    
    return {"message": "取消点赞成功"}

@app.get("/api/posts/{post_id}/likes", tags=["文章"], summary="获取文章点赞数", description="获取指定文章的点赞数量")
async def get_post_likes(post_id: str, db: Session = Depends(get_db)):
    # 检查文章是否存在
    post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 获取点赞数
    from database import PostLike
    likes_count = db.query(PostLike).filter(PostLike.post_id == post_id).count()
    
    return {"likes": likes_count}

# 分类相关路由
@app.get("/api/categories", response_model=List[CategoryBase], tags=["分类"], summary="获取所有分类", description="获取博客系统中的所有文章分类")
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return [{"name": category.name} for category in categories]

@app.post("/api/categories", response_model=CategoryBase, tags=["分类"], summary="创建分类", description="创建新的文章分类")
async def create_category(category: CategoryBase, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以创建分类")
    
    # 检查分类是否已存在
    existing = db.query(Category).filter(Category.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="分类已存在")
    
    # 创建新分类
    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    
    return {"name": category.name}

@app.delete("/api/categories/{category_name}", tags=["分类"], summary="删除分类", description="删除指定的文章分类")
async def delete_category(category_name: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以删除分类")
    
    # 查找分类
    category = db.query(Category).filter(Category.name == category_name).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类未找到")
    
    # 检查是否有文章使用此分类
    posts_count = db.query(DBPost).filter(DBPost.category_id == category.id).count()
    if posts_count > 0:
        raise HTTPException(status_code=400, detail="无法删除被文章使用的分类")
    
    # 删除分类
    db.delete(category)
    db.commit()
    
    return {"message": "分类删除成功"}

# 标签相关路由
@app.get("/api/tags", response_model=List[TagBase], tags=["标签"], summary="获取所有标签", description="获取博客系统中的所有文章标签")
async def get_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    return [{"name": tag.name} for tag in tags]

@app.post("/api/tags", response_model=TagBase, tags=["标签"], summary="创建标签", description="创建新的文章标签")
async def create_tag(tag: TagBase, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查标签是否已存在
    existing = db.query(Tag).filter(Tag.name == tag.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="标签已存在")
    
    # 创建新标签
    new_tag = Tag(name=tag.name)
    db.add(new_tag)
    db.commit()
    
    return {"name": tag.name}

@app.delete("/api/tags/{tag_name}", tags=["标签"], summary="删除标签", description="删除指定的文章标签")
async def delete_tag(tag_name: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以删除标签")
    
    # 查找标签
    tag = db.query(Tag).filter(Tag.name == tag_name).first()
    if not tag:
        raise HTTPException(status_code=404, detail="标签未找到")
    
    # 从所有文章中移除此标签关联
    tag.posts.clear()
    
    # 删除标签
    db.delete(tag)
    db.commit()
    
    return {"message": "标签删除成功"}

# 文件上传相关路由
@app.post("/api/upload", response_model=FileResponse, tags=["上传"], summary="上传文件", description="上传文件并返回文件路径")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # 生成唯一文件名
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4()}{file_extension}"
    file_location = UPLOAD_DIR / unique_filename
    
    # 保存文件
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 返回文件路径
    return {
        "filename": unique_filename,
        "filepath": f"/uploads/{unique_filename}"
    }

# 文章封面图片上传
@app.post("/api/posts/{post_id}/cover", response_model=Post, tags=["文章"], summary="上传文章封面", description="为指定文章上传封面图片")
async def upload_post_cover(post_id: str, file: UploadFile = File(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 查找文章
    post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 检查权限
    is_author = post.user.username == current_user["username"]
    can_edit = "edit_post" in current_user.get("permissions", [])
    
    if not (is_author and can_edit) and "manage_users" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有权限更新此文章")
    
    # 上传文件
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4()}{file_extension}"
    file_location = UPLOAD_DIR / unique_filename
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 更新文章封面
    post.cover_image = f"/uploads/{unique_filename}"
    db.commit()
    
    # 获取标签列表
    tags = [tag.name for tag in post.tags]
    
    # 计算评论数
    comment_count = db.query(DBComment).filter(DBComment.post_id == post.id).count()
    
    # 返回API格式的文章
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "description": post.description,
        "category": post.category.name,
        "tags": tags,
        "status": post.status,
        "author": post.user.username,
        "views": post.views,
        "publishDate": post.publish_date.isoformat() if post.publish_date else None,
        "updateTime": post.updated_at.isoformat(),
        "coverImage": post.cover_image,
        "commentCount": comment_count
    }

# 评论相关路由
@app.get("/api/posts/{post_id}/comments", response_model=List[Comment], tags=["评论"], summary="获取文章评论", description="获取指定文章的所有评论")
async def get_post_comments(post_id: str, db: Session = Depends(get_db)):
    # 检查文章是否存在
    post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 获取评论
    comments = db.query(DBComment).filter(DBComment.post_id == post_id).all()
    
    # 转换为API格式
    result = []
    for comment in comments:
        result.append({
            "id": comment.id,
            "content": comment.content,
            "postId": comment.post_id,
            "author": comment.user.username,
            "createdAt": comment.created_at.isoformat(),
            "parentId": comment.parent_id
        })
    
    return result

@app.post("/api/comments", response_model=Comment, tags=["评论"], summary="创建评论", description="为指定文章创建新评论")
async def create_comment(comment: CommentCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查用户权限
    if "comment_post" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有评论权限")
        
    # 检查文章是否存在
    post = db.query(DBPost).filter(DBPost.id == comment.postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 创建新评论
    new_comment = DBComment(
        content=comment.content,
        post_id=comment.postId,
        author=current_user["id"]
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    # 返回API格式的评论
    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "postId": new_comment.post_id,
        "author": current_user["username"],
        "createdAt": new_comment.created_at.isoformat(),
        "parentId": None
    }

@app.post("/api/comments/{comment_id}/reply", response_model=Comment, tags=["评论"], summary="回复评论", description="回复指定的评论")
async def reply_to_comment(comment_id: str, comment: CommentCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查父评论是否存在
    parent_comment = db.query(DBComment).filter(DBComment.id == comment_id).first()
    if not parent_comment:
        raise HTTPException(status_code=404, detail="评论未找到")
    
    # 检查文章是否存在
    post = db.query(DBPost).filter(DBPost.id == comment.postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章未找到")
    
    # 创建回复
    new_reply = DBComment(
        content=comment.content,
        post_id=comment.postId,
        author=current_user["id"],
        parent_id=comment_id
    )
    
    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    
    # 返回API格式的评论
    return {
        "id": new_reply.id,
        "content": new_reply.content,
        "postId": new_reply.post_id,
        "author": current_user["username"],
        "createdAt": new_reply.created_at.isoformat(),
        "parentId": new_reply.parent_id
    }

@app.delete("/api/comments/{comment_id}", tags=["评论"], summary="删除评论", description="删除指定的评论")
async def delete_comment(comment_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 查找评论
    comment = db.query(DBComment).filter(DBComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论未找到")
    
    # 检查权限
    is_author = comment.user.username == current_user["username"]
    is_admin = "manage_users" in current_user.get("permissions", [])
    
    if not (is_author or is_admin):
        raise HTTPException(status_code=403, detail="没有权限删除此评论")
    
    # 获取文章ID用于后续操作
    post_id = comment.post_id
    
    # 删除评论及其回复
    # 先找出所有回复
    replies = db.query(DBComment).filter(DBComment.parent_id == comment_id).all()
    
    # 删除回复
    for reply in replies:
        db.delete(reply)
    
    # 删除主评论
    db.delete(comment)
    db.commit()
    
    return {"message": "评论删除成功"}

# 搜索功能
@app.get("/api/search", response_model=List[Post], tags=["搜索"], summary="搜索文章", description="根据关键词搜索文章")
async def search_posts(q: str = Query(..., min_length=1), category: Optional[str] = None, tag: Optional[str] = None, db: Session = Depends(get_db)):
    # 基础查询：只搜索已发布的文章
    query = db.query(DBPost).filter(DBPost.status == "published")
    
    # 搜索标题和内容
    query = query.filter(
        (DBPost.title.ilike(f"%{q}%")) | 
        (DBPost.content.ilike(f"%{q}%"))
    )
    
    # 应用分类过滤器
    if category:
        query = query.join(Category).filter(Category.name == category)
    
    # 应用标签过滤器
    if tag:
        query = query.join(DBPost.tags).filter(Tag.name == tag)
    
    # 执行查询
    db_posts = query.all()
    
    # 转换为API模型
    results = []
    for post in db_posts:
        # 获取标签列表
        tags = [tag.name for tag in post.tags]
        
        # 计算评论数
        comment_count = db.query(DBComment).filter(DBComment.post_id == post.id).count()
        
        results.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "description": post.description,
            "category": post.category.name,
            "tags": tags,
            "status": post.status,
            "author": post.user.username,
            "views": post.views,
            "publishDate": post.publish_date.isoformat() if post.publish_date else None,
            "updateTime": post.updated_at.isoformat(),
            "coverImage": post.cover_image,
            "commentCount": comment_count
        })
    
    return results

# 用户权限管理
@app.put("/api/users/{username}/role", tags=["用户"], summary="更新用户角色", description="修改指定用户的角色权限")
async def update_user_role(username: str, role: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查管理员权限
    if "manage_users" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="没有权限管理用户")
    
    # 查找用户
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户未找到")
    
    if role not in role_permissions:
        raise HTTPException(status_code=400, detail="无效的角色")
    
    # 更新用户角色
    user.role = role
    db.commit()
    
    return {"message": f"用户角色已更新为 {role}"}

# 初始化数据库
@app.on_event("startup")
async def init_db():
    from database import create_tables, SessionLocal, User, Category, Tag
    import os
    
    # 创建数据库表
    create_tables()
    
    # 初始化基础数据
    db = SessionLocal()
    try:
        # 检查是否有管理员用户
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            # 创建默认管理员用户
            hashed_password = get_password_hash("password")
            admin_user = User(
                username="test",
                email="test@example.com",
                hashed_password=hashed_password,
                role="admin",
                avatar="https://via.placeholder.com/150"
            )
            db.add(admin_user)
        
        # 检查是否有基础分类
        if db.query(Category).count() == 0:
            categories = ["技术", "生活"]
            for cat_name in categories:
                db.add(Category(name=cat_name))
        
        # 检查是否有基础标签
        if db.query(Tag).count() == 0:
            tags = ["Vue", "FastAPI"]
            for tag_name in tags:
                db.add(Tag(name=tag_name))
        
        db.commit()
    except Exception as e:
        print(f"初始化数据库错误: {e}")
    finally:
        db.close()

# 启动服务器
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)