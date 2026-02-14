/* eslint-env node */
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import routes from './src/routes/index.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { apiLimiter, authLimiter, caseLimiter, readLimiter } from './src/middleware/rateLimiter.js';


// Simple in-memory cache for ultra-fast responses
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds cache

// Cache middleware for GET requests
function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();

  const key = req.originalUrl;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  // Override res.json to cache the response
  const originalJson = res.json;
  res.json = function(data) {
    cache.set(key, { data, timestamp: Date.now() });
    return originalJson.call(this, data);
  };

  next();
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3000;

// Compression middleware for performance optimization
app.use(compression());

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow eval for development (Vite HMR)
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173", "ws://localhost:3000", "wss://localhost:3000"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting - Apply different limits to different endpoints
app.use('/api/auth/', authLimiter); // Strict limits for auth (10 req/15min)
app.use('/api/cases/', caseLimiter); // Moderate limits for case operations (50 req/5min)
app.use('/api/users/lawyers', readLimiter); // Light limits for lawyer list (200 req/min)
app.use('/api/', apiLimiter); // General API limits (1000 req/15min)

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.io connection handling
const connectedUsers = new Map(); // Map of socketId -> userId

io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  // Handle user authentication/identification
  socket.on('authenticate', (userId) => {
    connectedUsers.set(socket.id, userId);
    socket.join(`user:${userId}`);
    console.log(`[SOCKET] User ${userId} authenticated on socket ${socket.id}`);
  });

  // Handle joining case-specific rooms
  socket.on('join:case', (caseId) => {
    socket.join(`case:${caseId}`);
    console.log(`[SOCKET] Socket ${socket.id} joined case room: ${caseId}`);
  });

  // Handle leaving case-specific rooms
  socket.on('leave:case', (caseId) => {
    socket.leave(`case:${caseId}`);
    console.log(`[SOCKET] Socket ${socket.id} left case room: ${caseId}`);
  });

  // Handle chat messages
  socket.on('chat:send', (data) => {
    const { receiverId, message, senderId, senderName } = data;
    
    // Emit to receiver's personal room
    io.to(`user:${receiverId}`).emit('chat:receive', {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
    
    console.log(`[SOCKET] Chat message sent from ${senderId} to ${receiverId}`);
  });

  // Handle chat message read status
  socket.on('chat:read', (data) => {
    const { senderId, receiverId } = data;
    io.to(`user:${senderId}`).emit('chat:read:confirm', {
      userId: receiverId
    });
  });

  // Handle notifications
  socket.on('notification:send', (data) => {
    const { recipientId, notification } = data;
    io.to(`user:${recipientId}`).emit('notification:receive', notification);
    console.log(`[SOCKET] Notification sent to user ${recipientId}`);
  });

  // Handle case updates
  socket.on('case:update', (data) => {
    const { caseId, update, assignedUserId } = data;
    
    // Broadcast to case room
    io.to(`case:${caseId}`).emit('case:updated', update);
    
    // Also send to specific user if assigned
    if (assignedUserId) {
      io.to(`user:${assignedUserId}`).emit('case:updated', update);
    }
    
    console.log(`[SOCKET] Case ${caseId} update broadcasted`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      console.log(`[SOCKET] User ${userId} disconnected`);
    }
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    sockets: connectedUsers.size
  });
});

// Root: clarify this is the API server (frontend runs on Vite port, e.g. 5173)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Kaduna Court API is running. Use the frontend at http://localhost:5173',
    api: 'http://localhost:3000/api',
    health: 'http://localhost:3000/health',
    websocket: 'ws://localhost:3000'
  });
});

// API Routes with caching for ultra-fast responses
app.use('/api', cacheMiddleware, routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error Handler - use the middleware
app.use(errorHandler);

// Start Server with Socket.io
httpServer.listen(PORT, () => {
  console.log(`[SERVER] Server running on http://localhost:${PORT}`);
  console.log(`[SOCKET] Socket.io server running on ws://localhost:${PORT}`);
  console.log(`[ENV] Environment: ${process.env.NODE_ENV || 'development'}`);
});
