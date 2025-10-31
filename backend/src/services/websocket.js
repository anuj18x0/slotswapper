// WebSocket service for real-time notifications
class WebSocketService {
  constructor() {
    // Store active connections: userId -> Set of WebSocket connections
    this.connections = new Map();
  }

  // Register a new WebSocket connection for a user
  addConnection(userId, ws) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId).add(ws);

    // Remove connection when it closes
    ws.on('close', () => {
      this.removeConnection(userId, ws);
    });

    console.log(`WebSocket connected for user ${userId}. Total connections: ${this.connections.get(userId).size}`);
  }

  // Remove a WebSocket connection for a user
  removeConnection(userId, ws) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
      console.log(`WebSocket disconnected for user ${userId}`);
    }
  }

  // Send notification to a specific user
  sendNotificationToUser(userId, notification) {
    const userConnections = this.connections.get(userId);
    if (userConnections && userConnections.size > 0) {
      const message = JSON.stringify({
        type: 'notification',
        data: notification
      });

      userConnections.forEach(ws => {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(message);
        }
      });

      console.log(`Sent notification to user ${userId} on ${userConnections.size} connection(s)`);
      return true;
    }
    return false;
  }

  // Send swap update to a specific user
  sendSwapUpdate(userId, swapData) {
    const userConnections = this.connections.get(userId);
    if (userConnections && userConnections.size > 0) {
      const message = JSON.stringify({
        type: 'swap_update',
        data: swapData
      });

      userConnections.forEach(ws => {
        if (ws.readyState === 1) {
          ws.send(message);
        }
      });

      console.log(`Sent swap update to user ${userId}`);
      return true;
    }
    return false;
  }

  // Get count of active connections for a user
  getUserConnectionCount(userId) {
    const userConnections = this.connections.get(userId);
    return userConnections ? userConnections.size : 0;
  }

  // Get total number of active connections
  getTotalConnections() {
    let total = 0;
    this.connections.forEach(connections => {
      total += connections.size;
    });
    return total;
  }

  // Get all connected user IDs
  getConnectedUsers() {
    return Array.from(this.connections.keys());
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
