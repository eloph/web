-- 数据库初始化脚本

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建心情表
CREATE TABLE IF NOT EXISTS moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    color TEXT NOT NULL
);

-- 初始化心情数据
INSERT OR IGNORE INTO moods (name, emoji, color) VALUES
('开心', '😊', '#f59e0b'),
('难过', '😢', '#3b82f6'),
('平静', '😌', '#10b981'),
('兴奋', '🤩', '#8b5cf6'),
('疲惫', '😴', '#6b7280'),
('感恩', '🙏', '#ec4899');

-- 创建日记表
CREATE TABLE IF NOT EXISTS diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    mood_id INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    location_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (mood_id) REFERENCES moods(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- 创建照片表
CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    diary_id INTEGER,
    location_id INTEGER,
    filename TEXT NOT NULL,
    original_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (diary_id) REFERENCES diary_entries(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- 创建位置表
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建留言表
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    diary_id INTEGER NOT NULL,
    parent_id INTEGER,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (diary_id) REFERENCES diary_entries(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_diary_id ON photos(diary_id);
CREATE INDEX IF NOT EXISTS idx_photos_location_id ON photos(location_id);
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_diary_id ON comments(diary_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
