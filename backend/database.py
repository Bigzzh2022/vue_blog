from sqlalchemy import create_engine, Column, String, Integer, Text, ForeignKey, DateTime, Enum, Table, JSON, Boolean, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv
from uuid import uuid4
from datetime import datetime

# 加载环境变量
load_dotenv()

# 数据库配置
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'vue_blog')

# 创建数据库连接
DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

# 创建会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()

# 创建UUID函数
def generate_uuid():
    return str(uuid4())

# 用户表
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    avatar = Column(String(255))
    created_at = Column(DateTime, nullable=False, default=func.now())
    
    # 关系
    posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")

# 分类表
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    
    # 关系
    posts = relationship("Post", back_populates="category")

# 标签表
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    
    # 关系
    posts = relationship("Post", secondary="post_tags", back_populates="tags")

# 文章表
class Post(Base):
    __tablename__ = "posts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    description = Column(Text)
    author = Column(String(36), ForeignKey("users.id"), nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)
    status = Column(Enum("draft", "published", "private"), nullable=False, default="draft")
    views = Column(Integer, nullable=False, default=0)
    cover_image = Column(String(255))
    publish_date = Column(DateTime)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    tags = relationship("Tag", secondary="post_tags", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    likes = relationship("PostLike", back_populates="post")

# 文章标签关联表
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", String(36), ForeignKey("posts.id"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("tags.id"), primary_key=True)
)

# 文章点赞表
class PostLike(Base):
    __tablename__ = "post_likes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    post_id = Column(String(36), ForeignKey("posts.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    
    # 关系
    post = relationship("Post", back_populates="likes")
    user = relationship("User", backref="post_likes")
    
    # 唯一约束，确保用户只能点赞一次
    __table_args__ = (UniqueConstraint('post_id', 'user_id', name='uix_post_user_like'),)

# 评论表
class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=False)
    post_id = Column(String(36), ForeignKey("posts.id"), nullable=False)
    author = Column(String(36), ForeignKey("users.id"), nullable=False)
    parent_id = Column(String(36), ForeignKey("comments.id"))
    created_at = Column(DateTime, nullable=False, default=func.now())
    
    # 关系
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    replies = relationship("Comment", backref="parent", remote_side=[id])

# 友情链接表
class FriendLink(Base):
    __tablename__ = "friend_links"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    url = Column(String(255), nullable=False)
    icon = Column(String(255))
    description = Column(Text)
    status = Column(Enum("approved", "pending", "rejected"), nullable=False, default="pending")
    created_at = Column(DateTime, nullable=False, default=func.now())

# 设置表
class Setting(Base):
    __tablename__ = "settings"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    key = Column(String(100), nullable=False, unique=True)
    value = Column(JSON, nullable=False)
    category = Column(String(50), nullable=False, default="basic")  # basic/profile/advanced
    description = Column(String(255))
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

# 回收站表
class RecycleBin(Base):
    __tablename__ = "recycle_bin"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    original_id = Column(String(36), nullable=False)
    type = Column(Enum("post", "tag", "category"), nullable=False)
    content = Column(JSON, nullable=False)
    deleted_at = Column(DateTime, nullable=False, default=func.now())

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 创建所有表
def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()