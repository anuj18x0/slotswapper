import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping WebSocket connection');
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//localhost:3001/api/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        ws.send(JSON.stringify({
          type: 'authenticate',
          token: token
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          switch (message.type) {
            case 'authenticated':
              console.log('WebSocket authenticated successfully');
              break;

            case 'notification':
              handleNotification(message.data);
              break;

            case 'unread_notifications':
              setNotifications(message.data);
              if (message.data.length > 0) {
                toast.info(`You have ${message.data.length} unread notification(s)`);
              }
              break;

            case 'swap_update':
              toast.info('Swap request updated');
              break;

            case 'pong':
              break;

            case 'error':
              console.error('WebSocket error:', message.message);
              toast.error(message.message);
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.log('Max reconnection attempts reached');
          toast.error('Lost connection to notification server');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, []);

  const handleNotification = (notification) => {
    setNotifications(prev => {
      const exists = prev.some(n => n.id === notification.id);
      if (exists) {
        console.log('Duplicate notification prevented:', notification.id);
        return prev;
      }
      return [notification, ...prev];
    });

    const notificationTypeMap = {
      swap_request: '🔄 New Swap Request',
      swap_approved: '✅ Swap Approved',
      swap_rejected: '❌ Swap Rejected',
      swap_cancelled: '🚫 Swap Cancelled'
    };

    const toastTitle = notificationTypeMap[notification.type] || notification.title;
    
    toast.info(
      <div>
        <strong>{toastTitle}</strong>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>{notification.message}</p>
      </div>,
      {
        autoClose: 5000,
        position: 'top-right',
        toastId: `notification-${notification.id}`
      }
    );

    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Could not play notification sound:', err));
    } catch (error) {
      // Ignore audio errors
    }
  };

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        sendMessage({ type: 'ping' });
      }, 30000);

      return () => clearInterval(pingInterval);
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    notifications,
    connect,
    disconnect,
    sendMessage
  };
};
