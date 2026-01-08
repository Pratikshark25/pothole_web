const exp = require('express');
const cors = require('cors');
const path = require('path')
require('dotenv').config();
const connect = require('./config/db');

const app = exp();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN; 

// If cookies are used cross-site (Vercel -> Render/Server), trust proxy
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o => o === origin) || origin.endsWith('.vercel.app');
    if (ok) {
      return cb(null, true);
    } else {
      console.error(`❌ CORS blocked request from: ${origin}`);
      console.log('✅ Allowed origins:', allowedOrigins);
      return cb(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(exp.json({ limit: "10mb" }));
app.use(exp.urlencoded({ limit: "10mb", extended: true }));

app.use('/api/uploads', exp.static(path.join(__dirname, 'uploads')));
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Report routes
app.use('/api/report', require('./routes/reportroute'));

// Connect DB, then start server
connect().then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});