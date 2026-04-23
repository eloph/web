import { Router } from 'itty-router';
import { createHash, randomBytes } from 'crypto';
import { sign, verify } from 'jwt';

// 初始化路由器
const router = Router();

// 数据库初始化
async function initDatabase(db: D1Database) {
  try {
    await db.exec(`
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

      CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        color TEXT NOT NULL
      );

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
        FOREIGN KEY (mood_id) REFERENCES moods(id)
      );

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
        FOREIGN KEY (diary_id) REFERENCES diary_entries(id)
      );

      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

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

      INSERT OR IGNORE INTO moods (name, emoji, color) VALUES
      ('开心', '😊', '#f59e0b'),
      ('难过', '😢', '#3b82f6'),
      ('平静', '😌', '#10b981'),
      ('兴奋', '🤩', '#8b5cf6'),
      ('疲惫', '😴', '#6b7280'),
      ('感恩', '🙏', '#ec4899');
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// 密码哈希函数
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// JWT 工具函数
function generateToken(userId: number): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 认证中间件
async function authMiddleware(request: Request, env: any, ctx: any) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  ctx.user = decoded;
  return router.handle(request, env, ctx);
}

// 认证 API
router.post('/api/auth/register', async (request: Request, env: any, ctx: any) => {
  const { email, password, nickname, bio } = await request.json();

  if (!email || !password || !nickname) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const existingUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordHash = hashPassword(password);
    const result = await env.DB.prepare(
      'INSERT INTO users (email, password_hash, nickname, bio) VALUES (?, ?, ?, ?)'
    ).bind(email, passwordHash, nickname, bio || '').run();

    const token = generateToken(result.meta.last_insert_rowid);
    return new Response(JSON.stringify({ token, userId: result.meta.last_insert_rowid }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

router.post('/api/auth/login', async (request: Request, env: any, ctx: any) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Missing email or password' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = generateToken(user.id);
    return new Response(JSON.stringify({ token, userId: user.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// 日记 API
router.get('/api/diary', authMiddleware, async (request: Request, env: any, ctx: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;

    const diaries = await env.DB.prepare(
      `SELECT d.*, u.nickname, u.avatar_url, m.name as mood_name, m.emoji as mood_emoji, m.color as mood_color
       FROM diary_entries d
       JOIN users u ON d.user_id = u.id
       JOIN moods m ON d.mood_id = m.id
       WHERE d.is_public = 1
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    return new Response(JSON.stringify(diaries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get diaries error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

router.post('/api/diary', authMiddleware, async (request: Request, env: any, ctx: any) => {
  const { content, mood_id, is_public, location_id, photos } = await request.json();

  if (!content || !mood_id) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO diary_entries (user_id, content, mood_id, is_public, location_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(ctx.user.userId, content, mood_id, is_public ?? true, location_id).run();

    const diaryId = result.meta.last_insert_rowid;

    // 关联照片
    if (photos && photos.length > 0) {
      for (const photoId of photos) {
        await env.DB.prepare('UPDATE photos SET diary_id = ? WHERE id = ?').bind(diaryId, photoId).run();
      }
    }

    return new Response(JSON.stringify({ id: diaryId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create diary error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// 照片上传 API
router.post('/api/upload/init', authMiddleware, async (request: Request, env: any, ctx: any) => {
  const { filename, size } = await request.json();

  if (!filename || !size) {
    return new Response(JSON.stringify({ error: 'Missing filename or size' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const uploadId = randomBytes(16).toString('hex');
    const partSize = 5 * 1024 * 1024; // 5MB per part
    const parts = Math.ceil(size / partSize);

    const presignedUrls = [];
    for (let i = 1; i <= parts; i++) {
      const url = await env.BUCKET.createPresignedUrl('PUT', `${uploadId}/${i}`, {
        expires: 3600, // 1 hour
        conditions: [
          ['content-length-range', 1, partSize]
        ]
      });
      presignedUrls.push(url);
    }

    return new Response(JSON.stringify({ uploadId, presignedUrls, partSize }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Init upload error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

router.post('/api/upload/complete', authMiddleware, async (request: Request, env: any, ctx: any) => {
  const { uploadId, filename } = await request.json();

  if (!uploadId || !filename) {
    return new Response(JSON.stringify({ error: 'Missing uploadId or filename' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 列出所有上传的分片
    const objects = await env.BUCKET.list({ prefix: `${uploadId}/` });
    const parts = objects.objects.map((obj, index) => ({
      partNumber: index + 1,
      etag: obj.httpEtag
    }));

    // 合并分片
    await env.BUCKET.completeMultipartUpload(`${Date.now()}_${filename}`, uploadId, parts);

    // 清理分片
    for (const obj of objects.objects) {
      await env.BUCKET.delete(obj.key);
    }

    const originalUrl = `${env.R2_PUBLIC_URL}/${Date.now()}_${filename}`;
    const thumbnailUrl = `${originalUrl}?width=300&height=300&fit=cover`;

    // 保存照片记录
    const result = await env.DB.prepare(
      'INSERT INTO photos (user_id, filename, original_url, thumbnail_url, size) VALUES (?, ?, ?, ?, ?)'
    ).bind(ctx.user.userId, filename, originalUrl, thumbnailUrl, 0).run();

    return new Response(JSON.stringify({ photoId: result.meta.last_insert_rowid, originalUrl, thumbnailUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Complete upload error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// 地图 API
router.get('/api/locations', authMiddleware, async (request: Request, env: any, ctx: any) => {
  try {
    const locations = await env.DB.prepare(
      'SELECT * FROM locations WHERE user_id = ?'
    ).bind(ctx.user.userId).all();

    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get locations error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

router.post('/api/locations', authMiddleware, async (request: Request, env: any, ctx: any) => {
  const { name, latitude, longitude } = await request.json();

  if (!name || !latitude || !longitude) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO locations (user_id, name, latitude, longitude) VALUES (?, ?, ?, ?)'
    ).bind(ctx.user.userId, name, latitude, longitude).run();

    return new Response(JSON.stringify({ id: result.meta.last_insert_rowid }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create location error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// 留言 API
router.get('/api/comments/:diaryId', authMiddleware, async (request: Request, env: any, ctx: any) => {
  const { diaryId } = request.params;

  try {
    const comments = await env.DB.prepare(
      `SELECT c.*, u.nickname, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.diary_id = ?
       ORDER BY c.created_at ASC`
    ).bind(diaryId).all();

    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

router.post('/api/comments', authMiddleware, async (request: Request, env: any, ctx: any) => {
  const { diary_id, content, parent_id } = await request.json();

  if (!diary_id || !content) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO comments (user_id, diary_id, content, parent_id) VALUES (?, ?, ?, ?)'
    ).bind(ctx.user.userId, diary_id, content, parent_id).run();

    const comment = await env.DB.prepare(
      `SELECT c.*, u.nickname, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`
    ).bind(result.meta.last_insert_rowid).first();

    return new Response(JSON.stringify(comment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// 404 处理
router.all('*', () => {
  return new Response('Not Found', { status: 404 });
});

// 主 Worker 入口
export default {
  async fetch(request: Request, env: any, ctx: any) {
    // 初始化数据库
    await initDatabase(env.DB);

    // 处理 API 请求
    if (request.url.startsWith(`${new URL(request.url).origin}/api`)) {
      return router.handle(request, env, ctx);
    }

    // 处理静态文件请求
    return env.ASSETS.fetch(request);
  },
};
