import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyMysql from '@fastify/mysql';
import fastifyWebsocket from '@fastify/websocket';
import { config } from '../config/index.js';
import { wsService } from '../services/websocket.js';

export async function registerPlugins(fastify) {

  await fastify.register(fastifyCors, {
    origin: config.CORS_ORIGIN,
    credentials: true
  });

  await fastify.register(fastifyJwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_EXPIRES_IN
    }
  });

  await fastify.register(fastifyMysql, {
    connectionString: `mysql://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`,
    promise: true
  });

  await fastify.register(fastifyWebsocket, {
    options: {
      maxPayload: 1048576, // 1 mb
      verifyClient: (info, next) => {
        // Allow all connections, authentication happens after connection
        next(true);
      }
    }
  });

  fastify.decorate('authenticate', async function(request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.decorate('wsService', wsService);
}