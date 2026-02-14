import { useEffect, useMemo, useState, createContext, useContext, type ReactNode } from 'react';

import { useAuth } from './AuthContext';
import { useStaff } from './StaffContext';
import { useSocket } from './SocketContext';
import { chatApi } from '../services/api';


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
export interface ChatConversation {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
interface ChatContextType {
  conversations: ChatConversation[];
  messages: ChatMessage[];
  sendMessage: (receiverId: string, receiverName: string, message: string) => void;
  markAsRead: (userId: string) => void;
  getConversationMessages: (userId: string) => Promise<ChatMessage[]>;
  getUnreadCount: () => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);
export function ChatProvider({
  children
}: {
  children: ReactNode;
}) {
  const {
    user
  } = useAuth();
  const {
    staff
  } = useStaff();
  const {
    sendChat,
    markRead,
    onChatMessage
  } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load conversations and unread count from API
  useEffect(() => {
    if (!user) return;

    const loadChatData = async () => {
      try {
        const [conversationsRes, unreadRes] = await Promise.all([
          chatApi.getConversations(),
          chatApi.getUnreadCount()
        ]);

        if (conversationsRes.success && conversationsRes.data) {
          setConversations(conversationsRes.data as ChatConversation[]);
        }

        if (unreadRes.success && unreadRes.data) {
          setUnreadCount((unreadRes.data as { count: number }).count);
        }
      } catch (error) {
        console.error('Failed to load chat data:', error);
      }
    };

    loadChatData();
  }, [user]);

  // Listen for real-time chat messages via WebSocket
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onChatMessage((message) => {
      console.log('[CHAT] Received real-time message:', message);
      
      // Add message to local state
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // Update conversations
      setConversations(prev => {
        const senderId = message.senderId;
        const existingConv = prev.find(c => c.userId === senderId);
        
        if (existingConv) {
          return prev.map(c => c.userId === senderId ? {
            ...c,
            lastMessage: message.message,
            lastMessageTime: message.timestamp,
            unreadCount: message.read ? c.unreadCount : c.unreadCount + 1
          } : c).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
        } else {
          // Find sender details from staff
          const sender = staff.find(s => s.id === senderId);
          const newConv: ChatConversation = {
            userId: senderId,
            userName: message.senderName || sender?.name || 'Unknown',
            userRole: sender?.role || 'Unknown',
            lastMessage: message.message,
            lastMessageTime: message.timestamp,
            unreadCount: 1
          };
          return [newConv, ...prev];
        }
      });

      // Update unread count
      if (!message.read && message.receiverId === user.staffId) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, onChatMessage, staff]);


  const sendMessage = async (receiverId: string, receiverName: string, message: string) => {
    if (!user) return;
    
    try {
      // Send via WebSocket for real-time delivery
      sendChat(receiverId, user.staffId, user.name, message);
      
      // Also send via API for persistence
      const response = await chatApi.sendMessage(receiverId, message);
      
      if (response.success) {
        // Optimistically add message to local state
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: user.staffId,
          senderName: user.name,
          receiverId,
          receiverName,
          message,
          timestamp: new Date().toISOString(),
          read: false
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Update conversations optimistically
        setConversations(prev => {
          const existingConv = prev.find(c => c.userId === receiverId);
          if (existingConv) {
            return prev.map(c => c.userId === receiverId ? {
              ...c,
              lastMessage: message,
              lastMessageTime: newMessage.timestamp
            } : c).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };


  const markAsRead = async (userId: string) => {
    if (!user) return;
    
    try {
      // Send via WebSocket
      markRead(userId, user.staffId);
      
      // Also send via API
      await chatApi.markAsRead(userId);
      
      // Update local state optimistically
      setMessages(prev => prev.map(msg => msg.senderId === userId && msg.receiverId === user.staffId && !msg.read ? {
        ...msg,
        read: true
      } : msg));
      
      // Update conversations optimistically
      setConversations(prev => prev.map(c => c.userId === userId ? {
        ...c,
        unreadCount: 0
      } : c));
      
      // Recalculate unread count
      setUnreadCount(prev => Math.max(0, prev - (conversations.find(c => c.userId === userId)?.unreadCount || 0)));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };


  const getConversationMessages = async (userId: string): Promise<ChatMessage[]> => {
    if (!user) return [];
    
    try {
      const response = await chatApi.getMessages(userId);
      if (response.success && response.data) {
        const apiMessages = response.data as ChatMessage[];
        setMessages(prev => {
          // Merge API messages with local state, avoiding duplicates
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = apiMessages.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMessages];
        });
        return apiMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
    
    // Fallback to local messages
    return messages.filter(msg => msg.senderId === user.staffId && msg.receiverId === userId || msg.senderId === userId && msg.receiverId === user.staffId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Use API-loaded conversations, fallback to computed from messages
  const computedConversations: ChatConversation[] = useMemo(() => {
    if (!user) return [];
    
    // If we have API-loaded conversations, use those
    if (conversations.length > 0) {
      return conversations;
    }
    
    // Fallback: compute from local messages
    const conversationMap = new Map<string, ChatConversation>();
    messages.forEach(msg => {
      const isOutgoing = msg.senderId === user.staffId;
      const otherUserId = isOutgoing ? msg.receiverId : msg.senderId;
      const otherUserName = isOutgoing ? msg.receiverName : msg.senderName;
      // Find user role from staff list
      const staffMember = staff.find(s => s.id === otherUserId);

      const userRole = staffMember?.role || 'Unknown';
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUserName,
          userRole,
          lastMessage: msg.message,
          lastMessageTime: msg.timestamp,
          unreadCount: 0
        });
      }
      const conv = conversationMap.get(otherUserId);
      if (conv) {
        if (new Date(msg.timestamp) > new Date(conv.lastMessageTime)) {
          conv.lastMessage = msg.message;
          conv.lastMessageTime = msg.timestamp;
        }
        if (msg.receiverId === user.staffId && !msg.read) {
          conv.unreadCount++;
        }
      }
    });
    return Array.from(conversationMap.values()).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }, [messages, user, staff, conversations]);

  const getUnreadCount = (): number => {
    if (!user) return 0;
    return unreadCount;
  };

  return <ChatContext.Provider value={{
    conversations: computedConversations,
    messages,
    sendMessage,
    markAsRead,
    getConversationMessages,
    getUnreadCount
  }}>

      {children}
    </ChatContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {

  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
