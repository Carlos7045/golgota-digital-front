import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { configureAsaasCheckout } from "./asaas";

const app = express();

// CORS middleware for cross-origin requests
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://golgota-digital-front.vercel.app',
    'http://localhost:5173',
    'http://localhost:5000',
    'https://comando-golgota-frontend.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'golgota-secret-key-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Logging middleware
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

(async () => {
  const server = await registerRoutes(app);

  // Initialize Asaas checkout customization
  try {
    await configureAsaasCheckout();
  } catch (error) {
    console.log('Asaas checkout configuration skipped (API key not configured)');
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.log(`Error: ${message}`);
    res.status(status).json({ message });
    
    // Don't throw in production to prevent server crash
    if (process.env.NODE_ENV !== 'production') {
      console.error(err);
    }
  });

  // Serve avatar files
  app.use('/avatars', express.static('public/avatars'));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get PORT from environment or default to 5000
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`🚀 Backend serving on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();