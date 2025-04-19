import os
import mysql.connector
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 数据库配置
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', '3306')),
}

# 数据库名称
DB_NAME = os.getenv('DB_NAME', 'vue_blog')

def init_database():
    """初始化数据库"""
    try:
        # 连接MySQL服务器
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port']
        )
        cursor = conn.cursor()
        
        # 创建数据库
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.execute(f"USE {DB_NAME}")
        
        # 读取SQL脚本文件
        sql_file_path = Path(__file__).parent / 'database.sql'
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # 执行SQL脚本
        # 分割SQL语句并执行
        for statement in sql_script.split(';'):
            if statement.strip():
                cursor.execute(statement)
        
        # 提交更改
        conn.commit()
        print(f"数据库 {DB_NAME} 初始化成功！")
    except mysql.connector.Error as err:
        print(f"发生错误: {err}")
    finally:
        # 关闭连接
        if 'cursor' in locals() and cursor is not None:
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    init_database()