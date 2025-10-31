import Joi from 'joi';

const createSlotSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow(''),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().min(Joi.ref('startTime')).required(),
  isAvailableForSwap: Joi.boolean().default(true)
});

const updateSlotSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  description: Joi.string().max(1000).allow(''),
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso(),
  isAvailableForSwap: Joi.boolean()
}).min(1);

export default async function calendarRoutes(fastify, options) {
  // get users time slots
  fastify.get('/slots', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { startDate, endDate } = request.query;

      let query = 'SELECT * FROM time_slots WHERE user_id = ?';
      let params = [userId];

      if (startDate && endDate) {
        query += ' AND start_time >= ? AND end_time <= ?';
        params.push(startDate, endDate);
      }

      query += ' ORDER BY start_time ASC';

      const [slots] = await fastify.mysql.execute(query, params);

      reply.send({
        success: true,
        slots: slots.map(slot => ({
          id: slot.id,
          title: slot.title,
          description: slot.description,
          startTime: slot.start_time,
          endTime: slot.end_time,
          isAvailableForSwap: slot.is_available_for_swap,
          createdAt: slot.created_at,
          updatedAt: slot.updated_at
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

  // get all available slots
  fastify.get('/available-slots', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { startDate, endDate } = request.query;

      let query = `
        SELECT ts.*, u.first_name, u.last_name, u.email 
        FROM time_slots ts 
        JOIN users u ON ts.user_id = u.id 
        WHERE ts.user_id != ? AND ts.is_available_for_swap = true AND ts.start_time > NOW()
      `;
      let params = [userId];

      if (startDate && endDate) {
        query += ' AND ts.start_time >= ? AND ts.end_time <= ?';
        params.push(startDate, endDate);
      }

      query += ' ORDER BY ts.start_time ASC';

      const [slots] = await fastify.mysql.execute(query, params);

      reply.send({
        success: true,
        slots: slots.map(slot => ({
          id: slot.id,
          title: slot.title,
          description: slot.description,
          startTime: slot.start_time,
          endTime: slot.end_time,
          owner: {
            id: slot.user_id,
            firstName: slot.first_name,
            lastName: slot.last_name,
            email: slot.email
          },
          createdAt: slot.created_at
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

  // new time slot
  fastify.post('/slots', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { error, value } = createSlotSchema.validate(request.body);
      if (error) {
        return reply.status(400).send({
          error: true,
          message: error.details[0].message
        });
      }

      const { userId } = request.user;
      const { title, description, startTime, endTime, isAvailableForSwap } = value;

      // chheck time conflicts
      const [conflicts] = await fastify.mysql.execute(
        'SELECT id FROM time_slots WHERE user_id = ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))',
        [userId, startTime, startTime, endTime, endTime]
      );

      if (conflicts.length > 0) {
        return reply.status(409).send({
          error: true,
          message: 'Time slot conflicts with existing slot'
        });
      }

      const [result] = await fastify.mysql.execute(
        'INSERT INTO time_slots (user_id, title, description, start_time, end_time, is_available_for_swap) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, title, description || '', startTime, endTime, isAvailableForSwap]
      );

      reply.status(201).send({
        success: true,
        message: 'Time slot created successfully',
        slot: {
          id: result.insertId,
          title,
          description: description || '',
          startTime,
          endTime,
          isAvailableForSwap
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

  fastify.put('/slots/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      console.log('Update request body:', request.body);
      const { error, value } = updateSlotSchema.validate(request.body);
      if (error) {
        console.log('Validation error:', error.details[0].message);
        return reply.status(400).send({
          error: true,
          message: error.details[0].message
        });
      }

      const { userId } = request.user;
      const slotId = request.params.id;

      const [slots] = await fastify.mysql.execute(
        'SELECT * FROM time_slots WHERE id = ? AND user_id = ?',
        [slotId, userId]
      );

      if (slots.length === 0) {
        return reply.status(404).send({
          error: true,
          message: 'Time slot not found'
        });
      }

      const updates = [];
      const params = [];
      
      Object.entries(value).forEach(([key, val]) => {
        const dbKey = key === 'startTime' ? 'start_time' : 
                     key === 'endTime' ? 'end_time' : 
                     key === 'isAvailableForSwap' ? 'is_available_for_swap' : key;
        updates.push(`${dbKey} = ?`);
        params.push(val);
      });

      if (updates.length === 0) {
        return reply.status(400).send({
          error: true,
          message: 'No valid fields to update'
        });
      }

      params.push(slotId, userId);

      await fastify.mysql.execute(
        `UPDATE time_slots SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
        params
      );

      reply.send({
        success: true,
        message: 'Time slot updated successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        error: true,
        message: 'Internal server error'
      });
    }
  });

  fastify.delete('/slots/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const slotId = request.params.id;

      const [result] = await fastify.mysql.execute(
        'DELETE FROM time_slots WHERE id = ? AND user_id = ?',
        [slotId, userId]
      );

      if (result.affectedRows === 0) {
        return reply.status(404).send({
          error: true,
          message: 'Time slot not found'
        });
      }

      reply.send({
        success: true,
        message: 'Time slot deleted successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        error: true,
        message: 'Internal server error'
      });
    }
  });

  // get specific time slot
  fastify.get('/slots/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const slotId = request.params.id;

      const [slots] = await fastify.mysql.execute(
        `SELECT ts.*, u.first_name, u.last_name, u.email 
         FROM time_slots ts 
         JOIN users u ON ts.user_id = u.id 
         WHERE ts.id = ? AND (ts.user_id = ? OR ts.is_available_for_swap = true)`,
        [slotId, userId]
      );

      if (slots.length === 0) {
        return reply.status(404).send({
          error: true,
          message: 'Time slot not found'
        });
      }

      const slot = slots[0];

      reply.send({
        success: true,
        slot: {
          id: slot.id,
          title: slot.title,
          description: slot.description,
          startTime: slot.start_time,
          endTime: slot.end_time,
          isAvailableForSwap: slot.is_available_for_swap,
          owner: {
            id: slot.user_id,
            firstName: slot.first_name,
            lastName: slot.last_name,
            email: slot.email
          },
          createdAt: slot.created_at,
          updatedAt: slot.updated_at
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
}