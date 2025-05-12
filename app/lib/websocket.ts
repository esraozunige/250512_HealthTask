import { Platform } from 'react-native';

interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 1000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    try {
      // Use React Native's WebSocket implementation directly
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      // Send initial connection message for Supabase
      this.send({
        type: 'phx_join',
        payload: {},
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
        // Handle Supabase realtime events
        if (message.type === 'broadcast') {
          const handler = this.messageHandlers.get(message.payload.topic);
          if (handler) {
            handler(message.payload);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.handleReconnect();
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  send(data: WebSocketMessage | string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  subscribe(topic: string, handler: (data: any) => void) {
    this.messageHandlers.set(topic, handler);
    this.send({
      type: 'phx_join',
      payload: { topic },
    });
  }

  unsubscribe(topic: string) {
    this.messageHandlers.delete(topic);
    this.send({
      type: 'phx_leave',
      payload: { topic },
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const createWebSocketClient = (url: string) => {
  return new WebSocketClient(url);
}; 