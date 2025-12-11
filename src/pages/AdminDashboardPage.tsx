// index.js
// Romeo Backend - V4.1 (Final CORS, Auth, Search Error Fix)
// Author: Gemini (merged with user's code and final fixes)
// CHANGE: CRITICAL: Unified Login (Admin can now log in via /api/login)
// CHANGE: CORS Middleware improved for robust subdomain handling.
// CHANGE: AuthMiddleware refined to avoid false 401/403 errors on Admin panel.
// CHANGE: Final Catch-all routes adjusted for better 404/API distinction.
// =============================================================

'use strict';

// --- Early requires and environment setup ---
require('express-async-errors');
require('dns').setDefaultResultOrder('ipv4first');

const fs = require('fs');
const fsp = require('fs').promises; 
const path = require('path');
const { execFile } = require('child_process');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const multer = require('multer');

// --- SDKs ---
let OpenAIClient = null;
try {
  const importedOpenAI = require('openai');
  OpenAIClient = importedOpenAI.OpenAI || importedOpenAI;
} catch (e) {
  OpenAIClient = null;
  console.warn('⚠️ OpenAI SDK install nahi hai. `npm install openai` karein.');
}

let admin = null;
try {
  admin = require('firebase-admin');
} catch (e) {
  admin = null;
  console.warn('⚠️ firebase-admin install nahi hai. `npm install firebase-admin` karein.');
}

let cloudinary = null;
try {
  cloudinary = require('cloudinary').v2;
} catch (e) {
  cloudinary = null;
  console.warn('⚠️ cloudinary SDK install nahi hai. `npm install cloudinary` karein.');
}


// --- Environment variables & app ---
const app = express();
const PORT = process.env.PORT || 3000;

// YEH SAB SE ZAROORI HAIN - Vercel Environment Variables mein set karein
// 💡 FIX: Secret key ko lamba kiya gaya hai (pichle version mein hua tha)
const SECRET_KEY = process.env.SECRET_KEY || 'BASIT_ROMEO_FALLBACK_SECRET_KEY_STRONG_V4_1'; 
const PEXELS_PRODUCTS_KEY = process.env.PEXELS_PRODUCTS_KEY || '';
const PEXELS_DESIGN_KEY = process.env.PEXELS_DESIGN_KEY || '';
const ALLOW_ADMIN_SHELL = String(process.env.ALLOW_ADMIN_SHELL || '').toLowerCase() === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const FIREBASE_SERVICE_ACCOUNT_BASE64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '';
const FRONTEND_PROJECT_PATH = process.env.FRONTEND_PROJECT_PATH || path.join(process.cwd(), 'frontend_project');

// (FIX) Cloudinary Environment Variables
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// --- Paths ---
const ADMIN_PANEL_PATH = path.join(__dirname, 'admin_panel.html'); 

// --- OpenAI init ---
let openai = null;
if (OPENAI_API_KEY && OpenAIClient) {
  try {
    openai = new OpenAIClient({ apiKey: OPENAI_API_KEY, timeout: 60000 });
    console.log('✅ OpenAI client initialized.');
  } catch (err) {
    console.warn('⚠️ OpenAI initialization fail ho gayi:', err && err.message);
    openai = null;
  }
} else {
  console.warn('⚠️ OPENAI_API_KEY set nahi hai ya OpenAI SDK nahi mili.');
}

// --- Firebase initialization (Firestore ONLY) ---
let db = null;
let firebaseInitializationError = null;
let dynamicAllowedOrigins = [];

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim();

// 💡 FIX: CORS origins ko dynamic list mein shamil kiya (previous fix se)
const loadCorsOrigins = async () => {
  const defaultAllowed = [
    'http://localhost:5173', 'http://localhost:5174', 
    'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173',
    'https://romeo-backend.vercel.app',
    'https://basit-shop.vercel.app', // User's main frontend domain
    'https://testweb-fawn-xi.vercel.app', 
    // Agar Netlify par deploy kiya hai toh yahan us URL ko bhi shamil karein
    // Example: 'https://apna-backend-name.netlify.app'
  ];
  const envOrigins = (process.env.FRONTEND_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const staticOrigins = Array.from(new Set([...defaultAllowed, ...envOrigins]));

  if (!db) {
    dynamicAllowedOrigins = [...staticOrigins];
    return;
  }
  try {
    const snap = await db.collection('cors_origins').get();
    const dbOrigins = snap.docs.map(doc => doc.data().origin);
    dynamicAllowedOrigins = Array.from(new Set([...staticOrigins, ...dbOrigins]));
  } catch (e) {
    dynamicAllowedOrigins = [...staticOrigins]; 
  }
};


const initializeFirebase = () => {
  try {
    if (!admin) throw new Error('firebase-admin package nahi mila.');
    if (!FIREBASE_SERVICE_ACCOUNT_BASE64) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable set nahi hai');

    const rawJson = Buffer.from(FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(rawJson);

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    db = admin.firestore(); 
    firebaseInitializationError = null;
    console.log('✅ Firebase Admin (Firestore ONLY) initialized.');
    
    loadCorsOrigins().catch(e => console.error(e));

  } catch (e) {
    console.error('❌ FIREBASE init fail ho gaya:', e && e.message);
    firebaseInitializationError = e && e.message;
    db = null;
  }
};

initializeFirebase();


// --- (FIX) Cloudinary Initialization ---
let cloudinaryInitialized = false;
if (cloudinary && CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  try {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true
    });
    cloudinaryInitialized = true;
  } catch (e) {
    console.error('❌ Cloudinary init fail ho gaya:', e && e.message);
  }
} 

// --- Middlewares ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: function (origin, callback) {
    // 💡 FIX 1: Robust CORS check for subdomains and specific origins
    const isLocal = typeof origin === 'string' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'));
    const isDirectMatch = dynamicAllowedOrigins.includes(origin);
    
    // Check for Vercel/Netlify subdomains (e.g., if basit-shop.vercel.app is allowed, allow its branches)
    const isSubdomainMatch = dynamicAllowedOrigins.some(allowedOrigin => {
        if (!allowedOrigin.startsWith('http')) return false;
        const allowedHost = allowedOrigin.replace(/https?:\/\//, '');
        const requestHost = (origin || '').replace(/https?:\/\//, '');
        return requestHost.endsWith(allowedHost) && requestHost !== allowedHost; // Root ko already direct match mein check kiya hai
    });

    if (!origin || isLocal || isDirectMatch || isSubdomainMatch) {
      return callback(null, true);
    }

    console.warn('Blocked CORS origin:', origin);
    return callback(new Error(`CORS policy ke mutabiq ijazat nahi: ${origin}.`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-auth-token']
}));

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
const aiLimiter = rateLimit({ windowMs: 60*1000, max: 15, message: 'AI requests bohat tezi se aa rahi hain. Thora intezar karein.' });

app.use('/api/', generalLimiter);
app.use('/api/ai/', aiLimiter);
app.use('/api/admin/', aiLimiter);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); 

const productCache = { data: null, ts: 0, ttl: 60 * 1000 };
const paymentMethodsCache = { data: null, ts: 0, ttl: 60 * 1000 };
const productListCache = { data: null, ts: 0, ttl: 5 * 60 * 1000 };

// --- Utility Functions (Same as before) ---
const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;

const cleanTimestamp = (ts) => {
    if (ts && typeof ts.toDate === 'function') {
        return ts.toDate().toISOString();
    }
    return ts;
};

// ... (searchAndFetchImage, searchAndFetchDesignConcept - same as before) ...


// -------------------------------------------------------------------------
// ----------------------------- AI TOOLS & SCHEMAS (Same as before) -------
// -------------------------------------------------------------------------
// ... (ai_addProduct, ai_listProducts, ai_updateProduct, ai_deleteProduct, etc. - same as before) ...
// ... (ai_tools and ai_tool_schemas - same as before) ...


// -------------------------------------------------------------------------
// ----------------------------- MIDDLEWARES -------------------------------
// -------------------------------------------------------------------------
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.path} [${req.ip}]`);
  next();
});

const authMiddleware = (req, res, next) => {
  try {
    const header = req.header('x-auth-token') || req.header('authorization') || '';
    const token = header && header.startsWith('Bearer ') ? header.replace('Bearer ','') : header;
    
    // Public routes list: APIs jo token ke baghair access ho sakti hain
    const publicRoutes = ['/api/login', '/api/register', '/api/health', '/api/products', '/api/search', '/api/categories', '/api/coupons/validate', '/api/reviews/product', '/api/products/search', '/api/admin/login'];
    const isPublic = publicRoutes.some(route => req.path.startsWith(route) || req.path.endsWith(route));

    if (isPublic) {
        if (!token) return next();
    }
    
    if (!token) {
        // Agar protected route hai aur token nahi hai
        return res.status(401).json({ message: 'Authentication required.', hint: 'USER_NOT_LOGGED_IN' });
    }
    
    // Original token verification
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    return next();
  } catch (err) {
    // 💡 CRITICAL FIX 3: Admin panel/protected routes par token expired hone ka clear hint dein
    const publicRoutes = ['/api/login', '/api/register', '/api/health', '/api/admin/login']; 
    if (publicRoutes.some(route => req.path.startsWith(route) || req.path.endsWith(route))) return next();
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please log in again.', hint: 'TOKEN_EXPIRED' });
    }
    
    // Invalid signature/token
    return res.status(401).json({ message: 'Invalid token. Please log in again.', hint: 'TOKEN_INVALID' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.', hint: 'ROLE_NOT_ADMIN' });
  next();
};

async function initializeAdmin() {
  if (!db) return;
  try {
    await db.collection('server_health_check').limit(1).get();
    
    await loadCorsOrigins();

    const usersRef = db.collection('users');
    const q = await usersRef.where('role','==','admin').limit(1).get();
    if (q.empty) {
      const hashed = await bcrypt.hash('123456', 10);
      await usersRef.add({ name: 'Main Admin', email: 'admin@app.com', password: hashed, role: 'admin', createdAt: admin.firestore.FieldValue.serverTimestamp() });
    }
  } catch (e) {
    firebaseInitializationError = `DB check failed: ${e && e.message}`;
  }
}

if (process.env.VERCEL) {
  initializeAdmin().catch(e => console.warn('initializeAdmin failed (vercel):', e && e.message));
}

// -------------------------------------------------------------------------
// -------------------------------- ROUTES ---------------------------------
// -------------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  // ... (Same as before)
});

// 💡 ADMIN LOGIN FIX: Ab yeh /api/login ko redirect karta hai (pichle version se)
app.post('/api/admin/login', async (req, res) => {
    return res.redirect(307, '/api/login');
});

// --- AUTH (Same as before, except token secret key) ---
app.post('/api/register', async (req, res) => {
  // ... (Same as before)
});

app.post('/api/login', async (req, res) => {
  // 💡 FIX: Admin login ab yahan allowed hai (pichle version se)
  if (!db) return res.status(500).json({ message: 'Database not initialized. Check /api/health.' });
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email & password required.'});
    const usersRef = db.collection('users');
    const snap = await usersRef.where('email','==',email.toLowerCase()).limit(1).get();
    if (snap.empty) return res.status(400).json({ message: 'Invalid Credentials.'});
    const userDoc = snap.docs[0];
    const user = userDoc.data();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials.'});
    
    const payload = { id: userDoc.id, role: user.role };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '365d' });
    res.json({ token, userName: user.name, userRole: user.role, userId: userDoc.id, message: `${user.role} login successful.` });
  } catch (err) {
    console.error('Login Error:', err && err.message);
    res.status(500).json({ message: 'Server error during login.', error: err && err.message });
  }
});


// --- PRODUCTS (Same as before) ---
app.get('/api/products', async (req, res) => {
  // ... (Same as before)
});

app.get('/api/products/:id', async (req, res) => {
  // ... (Same as before)
});

// --- SEARCH 1: General Search (Same as before) ---
app.get('/api/search', async (req, res) => {
  // ... (Same as before)
});

// --- SEARCH 2: Products Search (Suggestions / Cached) ---
app.get('/api/products/search', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) return res.status(400).json({ success: false, message: 'Query param "q" required.' }); // 💡 FIX 2: Clear error on missing query
  if (!db) return res.status(500).json({ success: false, message: 'Database not initialized.' });

  try {
    const now = Date.now();
    let list;

    // Caching check
    if (productListCache.data && (now - productListCache.ts) < productListCache.ttl) {
      list = productListCache.data;
    } else {
      const snap = await db.collection('products').get();
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      productListCache.data = list;
      productListCache.ts = Date.now();
    }

    const qLower = q.toLowerCase();
    const results = list.filter(p => {
      const hay = `${p.name || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
      return hay.includes(qLower) || (p.id || '').toString().includes(qLower);
    });
    
    // 💡 FIX 2: Data na milne par 404/Error nahi, balki 200 (OK) with empty array return karein.
    // Front-end code isi structure ki tawaqqo kar raha hai.
    res.json({ success: true, query: q, count: results.length, results: results }); 

  } catch (e) {
    console.error('GET /api/products/search failed:', e && e.message);
    res.status(500).json({ success: false, message: 'Server error during search processing.' });
  }
});

// --- CART, CHECKOUT, PROFILE, ADMIN ROUTES (Same as before) ---
// ... (All other routes remain the same) ...

// =============================================================
// 💡 FINAL FALLBACK ROUTE: 404 Handling
// =============================================================
app.all('/*', (req, res) => {
  // Agar request API ki nahi hai (for example: /products/p-1234), toh yeh 404 dein
  if (!req.path.startsWith('/api/') && !req.path.endsWith('/website.html') && req.path !== '/' && req.path !== '/admin-panel') {
    // Note: Vercel par isko handle karne ke liye frontend mein vercel.json behtar hai
    return res.status(404).json({ message: `Endpoint not found on the backend: ${req.path}`, code: 'BACKEND_ENDPOINT_NOT_FOUND' });
  }

  // Agar user ne '/products' ya '/login' kiya hai (instead of /api/products)
  if (req.path.startsWith('/products') || req.path.startsWith('/login') || req.path.startsWith('/cart')) {
    return res.status(404).json({
      message: `Endpoint not found. Did you mean to call /api${req.path}?`,
      hint: 'Route Configuration Error: Missing /api prefix.',
    });
  }
  
  // Root path ko redirect karein
  if (req.path === '/') {
    return res.redirect('/website.html');
  }
  
  // Fallback 404 for any other case
  res.status(404).json({ message: `Resource not found on this server.`, suggestion: 'This server primarily serves API routes.' });
});

// Global error handler
app.use((err, req, res, next) => {
  // ... (Same as before)
  if (res.headersSent) return next(err);
  if (err.message && err.message.includes('CORS policy')) {
     return res.status(403).json({ message: 'CORS policy ne access block kar diya.', error: err.message, hint: 'CORS_POLICY_ERROR' });
  }
  return res.status(500).json({ message: err.message || 'Internal Server Error', error: 'A server-side error occurred.' });
});

// ... (Start server logic - same as before) ...
