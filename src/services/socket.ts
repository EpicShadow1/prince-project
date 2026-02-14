import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './api';

// Socket.io server URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Singleton socket instance
let socket: Socket | null = null;

/**
 * Get or create the socket connection
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: getAuthToken()
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[SOCKET] Connected to server');
    });

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[SOCKET] Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_failed', () => {
      console.error('[SOCKET] Reconnection failed');
    });
  }

  return socket;
}

/**
 * Authenticate the socket connection with user ID
 */
export function authenticateSocket(userId: string): void {
  const socket = getSocket();
  socket.emit('authenticate', userId);
}

/**
 * Join a case room
 */
export function joinCaseRoom(caseId: string): void {
  const socket = getSocket();
  socket.emit('join:case', caseId);
}

/**
 * Leave a case room
 */
export function leaveCaseRoom(caseId: string): void {
  const socket = getSocket();
  socket.emit('leave:case', caseId);
}

/**
 * Send a chat message via socket
 */
export function sendChatMessage(receiverId: string, senderId: string, senderName: string, message: string): void {
  const socket = getSocket();
  socket.emit('chat:send', {
    receiverId,
    senderId,
    senderName,
    message
  });
}

/**
 * Mark chat messages as read
 */
export function markChatAsRead(senderId: string, receiverId: string): void {
  const socket = getSocket();
  socket.emit('chat:read', {
    senderId,
    receiverId
  });
}

/**
 * Send a notification via socket
 */
export function sendNotification(recipientId: string, notification: object): void {
  const socket = getSocket();
  socket.emit('notification:send', {
    recipientId,
    notification
  });
}

/**
 * Broadcast a case update
 */
export function broadcastCaseUpdate(caseId: string, update: object, assignedUserId?: string): void {
  const socket = getSocket();
  socket.emit('case:update', {
    caseId,
    update,
    assignedUserId
  });
}

/**
 * Disconnect the socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export type {
  Socket
};
