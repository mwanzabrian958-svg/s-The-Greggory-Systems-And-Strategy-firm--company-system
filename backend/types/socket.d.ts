export interface ServerToClientEvents {
  'notification:new': (data: {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
  }) => void;
  'notification:read': (data: { id: string }) => void;
  'notification:delete': (data: { id: string }) => void;
  'activity:update': (data: {
    type: string;
    description: string;
    userId?: string;
    timestamp: string;
  }) => void;
  'online-status:change': (data: { userId: string; isOnline: boolean }) => void;
  'typing:start': (data: { userId: string; conversationId: string }) => void;
  'typing:stop': (data: { userId: string; conversationId: string }) => void;
  'message:new': (data: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
  }) => void;
  'message:updated': (data: { id: string; content: string; updatedAt: string }) => void;
  'message:deleted': (data: { id: string }) => void;
  'auth:refresh': (data: { token: string }) => void;
  'dashboard:stats': (data: Record<string, number>) => void;
  error: (data: { message: string; code?: string }) => void;
  connected: (data: { userId?: string; rooms: string[] }) => void;
  disconnected: (data: { reason: string }) => void;
}

export interface ClientToServerEvents {
  'auth:join': (data: { token: string }) => void;
  'auth:leave': () => void;
  'notification:markRead': (data: { id: string }) => void;
  'notification:delete': (data: { id: string }) => void;
  'typing:start': (data: { conversationId: string }) => void;
  'typing:stop': (data: { conversationId: string }) => void;
  'message:send': (data: { conversationId: string; content: string }) => void;
  'message:edit': (data: { id: string; content: string }) => void;
  'message:delete': (data: { id: string }) => void;
  'dashboard:requestStats': () => void;
}

declare global {
  namespace NodeJS {
    interface Global {
      io: import('socket.io').Server;
    }
  }
}
