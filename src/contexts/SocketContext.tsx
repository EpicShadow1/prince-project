import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  getSocket, 
  authenticateSocket, 
  joinCaseRoom,
  leaveCaseRoom,
  sendChatMessage,
  markChatAsRead,
  sendNotification,
  broadcastCaseUpdate
} from '../services/socket';
import { useAuth } from './AuthContext';

// Type definitions for socket events
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'maintenance' | 'success' | 'chat';
  title: string;
  message: string;
  timestamp: string;
  createdAt: string;
  read: boolean;
  createdBy?: string;
  senderId?: string;
  senderName?: string;
  recipientId?: string;
  data?: Record<string, unknown>;
}


export interface CaseUpdate {
  caseId: string;
  updateType: string;
  changes: Record<string, unknown>;
  timestamp: string;
  updatedBy?: string;
}

interface SocketContextType {
  isConnected: boolean;
  joinCase: (caseId: string) => void;
  leaveCase: (caseId: string) => void;
  sendChat: (receiverId: string, senderId: string, senderName: string, message: string) => void;
  markRead: (senderId: string, receiverId: string) => void;
  notify: (recipientId: string, notification: Notification) => void;
  updateCase: (caseId: string, update: CaseUpdate, assignedUserId?: string) => void;
  onChatMessage: (callback: (message: ChatMessage) => void) => (() => void);
  onNotification: (callback: (notification: Notification) => void) => (() => void);
  onCaseUpdate: (callback: (update: CaseUpdate) => void) => (() => void);
}



const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    // Listen for connection status
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Check initial connection status
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Authenticate when user logs in
  useEffect(() => {
    if (user?.staffId) {
      authenticateSocket(user.staffId);
    }
  }, [user?.staffId]);

  // Clean up on logout
  useEffect(() => {
    return () => {
      // Don't disconnect on unmount, as the socket might be needed elsewhere
    };
  }, []);

  const joinCase = (caseId: string) => {
    joinCaseRoom(caseId);
  };

  const leaveCase = (caseId: string) => {
    leaveCaseRoom(caseId);
  };

  const sendChat = (receiverId: string, senderId: string, senderName: string, message: string) => {
    sendChatMessage(receiverId, senderId, senderName, message);
  };

  const markRead = (senderId: string, receiverId: string) => {
    markChatAsRead(senderId, receiverId);
  };

  const notify = (recipientId: string, notification: Notification) => {
    sendNotification(recipientId, notification);
  };

  const updateCase = (caseId: string, update: CaseUpdate, assignedUserId?: string) => {
    broadcastCaseUpdate(caseId, update, assignedUserId);
  };

  const onChatMessage = (callback: (message: ChatMessage) => void): (() => void) => {

    const socket = getSocket();
    socket.on('chat:receive', callback);
    
    return () => {
      socket.off('chat:receive', callback);
    };
  };

  const onNotification = (callback: (notification: Notification) => void): (() => void) => {
    const socket = getSocket();
    socket.on('notification:receive', callback);
    
    return () => {
      socket.off('notification:receive', callback);
    };
  };

  const onCaseUpdate = (callback: (update: CaseUpdate) => void): (() => void) => {

    const socket = getSocket();
    socket.on('case:updated', callback);
    
    return () => {
      socket.off('case:updated', callback);
    };
  };


  return (
    <SocketContext.Provider
      value={{
        isConnected,
        joinCase,
        leaveCase,
        sendChat,
        markRead,
        notify,
        updateCase,
        onChatMessage,
        onNotification,
        onCaseUpdate
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
