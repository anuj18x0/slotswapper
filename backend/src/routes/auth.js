import bcrypt from 'bcryptjs';
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export default async function authRoutes(fastify, options) {

  fastify.post('/register', async (request, reply) => {
    try {
      const { error, value } = registerSchema.validate(request.body);
      if (error) {
        return reply.status(400).send({
          error: true,
          message: error.details[0].message
        });
      }

      const { email, password, firstName, lastName } = value;

      const [existingUsers] = await fastify.mysql.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return reply.status(409).send({
          error: true,
          message: 'User with this email already exists'
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const [result] = await fastify.mysql.execute(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
        [email, passwordHash, firstName, lastName]
      );

      const token = fastify.jwt.sign({
        userId: result.insertId,
        email,
        role: 'user'
      });

      reply.send({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: result.insertId,
          email,
          firstName,
          lastName,
          role: 'user'
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

  fastify.post('/login', async (request, reply) => {
    try {
      const { error, value } = loginSchema.validate(request.body);
      if (error) {
        return reply.status(400).send({
          error: true,
          message: error.details[0].message
        });
      }

      const { email, password } = value;

      // Find user
      const [users] = await fastify.mysql.execute(
        'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return reply.status(401).send({
          error: true,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return reply.status(401).send({
          error: true,
          message: 'Invalid credentials'
        });
      }

      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      reply.send({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
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

  // verify token
  fastify.get('/verify', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;

      const [users] = await fastify.mysql.execute(
        'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return reply.status(401).send({
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
          role: user.role
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

  fastify.post('/logout', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    reply.send({
      success: true,
      message: 'Logout successful'
    });
  });
}