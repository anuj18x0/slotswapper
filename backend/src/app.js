import Fastify from 'fastify';
import { config } from './config/index.js';
import { registerPlugins } from './plugins/index.js';
import { registerRoutes } from './routes/index.js';

const fastify = Fastify({
  logger: {
    level: config.NODE_ENV === 'development' ? 'info' : 'warn'
  }
});

await registerPlugins(fastify);

await registerRoutes(fastify);

fastify.setErrorHandler((error, request, reply) => {
  const { statusCode = 500, message } = error;
  
  fastify.log.error({
    error,
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers
    }
  });

  reply.status(statusCode).send({
    error: true,
    message: statusCode === 500 ? 'Internal Server Error' : message,
    statusCode
  });
});

const start = async () => {
  try {
    await fastify.listen({ 
      port: config.PORT, 
      host: '0.0.0.0' 
    });
    console.log(`🚀 Server is running on http://localhost:${config.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();