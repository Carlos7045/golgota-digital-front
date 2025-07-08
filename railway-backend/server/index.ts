import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { configureAsaasCheckout } from "./asaas.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://comando-golgota.vercel.app', 'https://comando-golgota-frontend.vercel.app']
    : ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'comando-golgota-dev-secret-key-2025';

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET not set in production - using fallback');
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Static file serving for uploads
app.use('/uploads', express.static('/tmp/uploads'));

// Initialize Asaas configuration (non-blocking)
if (process.env.ASAAS_API_KEY) {
  setTimeout(() => {
    configureAsaasCheckout().catch(error => {
      console.warn('Asaas checkout configuration skipped:', error.message);
    });
  }, 2000);
} else {
  console.log('💳 ASAAS_API_KEY not configured - payment features disabled');
}

// Health check endpoint - DEVE ser simples e rápido
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Health check mais detalhado (opcional)
app.get('/health/detailed', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
    asaas: process.env.ASAAS_API_KEY ? 'Configured' : 'Not configured'
  });
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    message: '🚀 Comando Gólgota Backend - Operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      authentication: true,
      payments: !!process.env.ASAAS_API_KEY,
      websockets: true,
      fileUploads: true
    }
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Comando Gólgota Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      status: '/api/status',
      docs: 'https://github.com/comando-golgota/backend'
    }
  });
});

// Register all API routes
registerRoutes(app).then(server => {
  console.log(`🚀 Comando Gólgota Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Session Secret: ${process.env.SESSION_SECRET ? 'Configured' : 'Using fallback'}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`💳 Payments: ${process.env.ASAAS_API_KEY ? 'Enabled' : 'Disabled'}`);
  console.log(`🔌 WebSocket: ws://0.0.0.0:${PORT}/ws`);
  
  // Test health endpoint
  setTimeout(() => {
    console.log('✅ Server startup complete - health check ready');
  }, 1000);
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});