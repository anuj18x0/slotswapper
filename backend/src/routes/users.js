export default async function userRoutes(fastify, options) {
  // get user
  fastify.get('/profile', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;

      const [users] = await fastify.mysql.execute(
        'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return reply.status(404).send({
          error: true,
          message: 'User not found'
        });
      }

      const user = users[0];

      reply.send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          createdAt: user.created_at
        }
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        error: true,
        message: 'Internal server error'
      });
    }
  });

  fastify.get('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;

      const [users] = await fastify.mysql.execute(
        'SELECT id, email, first_name, last_name, role FROM users WHERE id != ?',
        [userId]
      );

      reply.send({
        success: true,
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }))
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        error: true,
        message: 'Internal server error'
      });
    }
  });
}