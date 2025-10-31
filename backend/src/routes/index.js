import authRoutes from './auth.js';
import userRoutes from './users.js';
import calendarRoutes from './calendar.js';
import swapRoutes from './swaps.js';
import websocketRoutes from './websocket.js';

export async function registerRoutes(fastify) {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(calendarRoutes, { prefix: '/api/calendar' });
  await fastify.register(swapRoutes, { prefix: '/api/swaps' });
  await fastify.register(websocketRoutes, { prefix: '/api' });
}