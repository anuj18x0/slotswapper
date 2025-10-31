export default async function websocketRoutes(fastify, options) {

  fastify.get('/ws', { websocket: true }, (connection, request) => {
    const { socket } = connection;

    socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        //authentication
        if (data.type === 'authenticate') {
          const token = data.token;

          if (!token) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'No token provided'
            }));
            socket.close();
            return;
          }

          try {
            const decoded = fastify.jwt.verify(token);
            const userId = decoded.userId;

            fastify.wsService.addConnection(userId, socket);

            socket.send(JSON.stringify({
              type: 'authenticated',
              message: 'Successfully authenticated',
              userId: userId
            }));

            console.log(`User ${userId} authenticated via WebSocket`);

            const [notifications] = await fastify.mysql.execute(
              'SELECT * FROM notifications WHERE user_id = ? AND is_read = false ORDER BY created_at DESC',
              [userId]
            );

            if (notifications.length > 0) {
              socket.send(JSON.stringify({
                type: 'unread_notifications',
                data: notifications.map(n => ({
                  id: n.id,
                  type: n.type,
                  title: n.title,
                  message: n.message,
                  isRead: n.is_read,
                  relatedSwapId: n.related_swap_id,
                  createdAt: n.created_at
                }))
              }));
            }
          } catch (error) {
            console.error('WebSocket authentication error:', error);
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Invalid token'
            }));
            socket.close();
          }
        }

        if (data.type === 'ping') {
          socket.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  fastify.get('/ws/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const stats = {
      totalConnections: fastify.wsService.getTotalConnections(),
      connectedUsers: fastify.wsService.getConnectedUsers().length,
      userConnectionCount: fastify.wsService.getUserConnectionCount(request.user.userId)
    };

    reply.send({
      success: true,
      stats
    });
  });
}
