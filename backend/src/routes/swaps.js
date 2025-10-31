import Joi from 'joi';

const createSwapSchema = Joi.object({
  requesterSlotId: Joi.number().integer().positive().required(),
  targetSlotId: Joi.number().integer().positive().required(),
  message: Joi.string().max(500).allow('')
});

const updateSwapSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'cancelled').required()
});

export default async function swapRoutes(fastify, options) {
  // create swap requst
  fastify.post('/requests', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { error, value } = createSwapSchema.validate(request.body);
      if (error) {
        return reply.status(400).send({
          error: true,
          message: error.details[0].message
        });
      }

      const { userId } = request.user;
      const { requesterSlotId, targetSlotId, message } = value;

      const [requesterSlots] = await fastify.mysql.execute(
        'SELECT * FROM time_slots WHERE id = ? AND user_id = ? AND is_available_for_swap = true',
        [requesterSlotId, userId]
      );

      if (requesterSlots.length === 0) {
        return reply.status(400).send({
          error: true,
          message: 'Your slot is not available for swapping or does not exist'
        });
      }

      const [targetSlots] = await fastify.mysql.execute(
        'SELECT * FROM time_slots WHERE id = ? AND is_available_for_swap = true',
        [targetSlotId]
      );

      if (targetSlots.length === 0) {
        return reply.status(400).send({
          error: true,
          message: 'Target slot not found or not available for swap'
        });
      }

      const targetSlot = targetSlots[0];

      if (targetSlot.user_id === userId) {
        return reply.status(400).send({
          error: true,
          message: 'Cannot swap with your own slots'
        });
      }

      const [existingRequests] = await fastify.mysql.execute(
        'SELECT id FROM swap_requests WHERE requester_slot_id = ? AND target_slot_id = ? AND status = "pending"',
        [requesterSlotId, targetSlotId]
      );

      if (existingRequests.length > 0) {
        return reply.status(409).send({
          error: true,
          message: 'Swap request already exists for these slots'
        });
      }

      const [result] = await fastify.mysql.execute(
        'INSERT INTO swap_requests (requester_id, requester_slot_id, target_user_id, target_slot_id, message) VALUES (?, ?, ?, ?, ?)',
        [userId, requesterSlotId, targetSlot.user_id, targetSlotId, message || '']
      );

      await fastify.mysql.execute(
        'INSERT INTO notifications (user_id, type, title, message, related_swap_id) VALUES (?, ?, ?, ?, ?)',
        [
          targetSlot.user_id,
          'swap_request',
          'New Swap Request',
          `You have a new swap request for your "${targetSlot.title}" slot`,
          result.insertId
        ]
      );

      const notification = {
        id: result.insertId,
        type: 'swap_request',
        title: 'New Swap Request',
        message: `You have a new swap request for your "${targetSlot.title}" slot`,
        isRead: false,
        relatedSwapId: result.insertId,
        createdAt: new Date()
      };
      
      if (fastify.wsService) {
        fastify.wsService.sendNotificationToUser(targetSlot.user_id, notification);
      } else {
        fastify.log.warn('WebSocket service not available');
      }

      reply.status(201).send({
        success: true,
        message: 'Swap request created successfully',
        swapRequest: {
          id: result.insertId,
          status: 'pending'
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

  fastify.get('/requests', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { type = 'all' } = request.query; // 'incoming', 'outgoing', or 'all'

      let query = `
        SELECT 
          sr.*,
          requester.first_name as requester_first_name,
          requester.last_name as requester_last_name,
          requester.email as requester_email,
          target_user.first_name as target_first_name,
          target_user.last_name as target_last_name,
          target_user.email as target_email,
          req_slot.title as requester_slot_title,
          req_slot.start_time as requester_slot_start,
          req_slot.end_time as requester_slot_end,
          target_slot.title as target_slot_title,
          target_slot.start_time as target_slot_start,
          target_slot.end_time as target_slot_end
        FROM swap_requests sr
        JOIN users requester ON sr.requester_id = requester.id
        JOIN users target_user ON sr.target_user_id = target_user.id
        JOIN time_slots req_slot ON sr.requester_slot_id = req_slot.id
        JOIN time_slots target_slot ON sr.target_slot_id = target_slot.id
        WHERE 
      `;

      let params = [];

      if (type === 'incoming') {
        query += 'sr.target_user_id = ?';
        params = [userId];
      } else if (type === 'outgoing') {
        query += 'sr.requester_id = ?';
        params = [userId];
      } else {
        query += '(sr.requester_id = ? OR sr.target_user_id = ?)';
        params = [userId, userId];
      }

      query += ' ORDER BY sr.created_at DESC';

      const [swapRequests] = await fastify.mysql.execute(query, params);

      reply.send({
        success: true,
        swapRequests: swapRequests.map(sr => ({
          id: sr.id,
          status: sr.status,
          message: sr.message,
          createdAt: sr.created_at,
          updatedAt: sr.updated_at,
          requester: {
            id: sr.requester_id,
            firstName: sr.requester_first_name,
            lastName: sr.requester_last_name,
            email: sr.requester_email
          },
          targetUser: {
            id: sr.target_user_id,
            firstName: sr.target_first_name,
            lastName: sr.target_last_name,
            email: sr.target_email
          },
          requesterSlot: {
            id: sr.requester_slot_id,
            title: sr.requester_slot_title,
            startTime: sr.requester_slot_start,
            endTime: sr.requester_slot_end
          },
          targetSlot: {
            id: sr.target_slot_id,
            title: sr.target_slot_title,
            startTime: sr.target_slot_start,
            endTime: sr.target_slot_end
          },
          isIncoming: sr.target_user_id === userId,
          isOutgoing: sr.requester_id === userId
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

  // update swap request status approve/reject/cancel
  fastify.put('/requests/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { error, value } = updateSwapSchema.validate(request.body);
      if (error) {
        return reply.status(400).send({
          error: true,
          message: error.details[0].message
        });
      }

      const { userId } = request.user;
      const swapId = request.params.id;
      const { status } = value;

      const [swapRequests] = await fastify.mysql.execute(
        'SELECT * FROM swap_requests WHERE id = ?',
        [swapId]
      );

      if (swapRequests.length === 0) {
        return reply.status(404).send({
          error: true,
          message: 'Swap request not found'
        });
      }

      const swapRequest = swapRequests[0];

      if (status === 'cancelled' && swapRequest.requester_id !== userId) {
        return reply.status(403).send({
          error: true,
          message: 'Only the requester can cancel a swap request'
        });
      }

      if ((status === 'approved' || status === 'rejected') && swapRequest.target_user_id !== userId) {
        return reply.status(403).send({
          error: true,
          message: 'Only the target user can approve or reject a swap request'
        });
      }

      if (swapRequest.status !== 'pending') {
        return reply.status(400).send({
          error: true,
          message: 'Can only update pending swap requests'
        });
      }

      if (status === 'approved') {
        const connection = await fastify.mysql.getConnection();
        
        try {
          await connection.beginTransaction();
          
          // get time details of both slots and verify theyre still available
          const [requesterSlotData] = await connection.execute(
            'SELECT start_time, end_time, is_available_for_swap FROM time_slots WHERE id = ?',
            [swapRequest.requester_slot_id]
          );
          
          const [targetSlotData] = await connection.execute(
            'SELECT start_time, end_time, is_available_for_swap FROM time_slots WHERE id = ?',
            [swapRequest.target_slot_id]
          );
          
          if (requesterSlotData.length === 0 || targetSlotData.length === 0) {
            throw new Error('One or both slots not found');
          }
          
          const requesterSlot = requesterSlotData[0];
          const targetSlot = targetSlotData[0];
          
          if (!requesterSlot.is_available_for_swap || !targetSlot.is_available_for_swap) {
            await connection.rollback();
            connection.release();
            return reply.status(400).send({
              error: true,
              message: 'One or both slots are no longer available for swapping'
            });
          }
          
          await connection.execute(
            'UPDATE time_slots SET start_time = ?, end_time = ? WHERE id = ?',
            [targetSlot.start_time, targetSlot.end_time, swapRequest.requester_slot_id]
          );
          
          await connection.execute(
            'UPDATE time_slots SET start_time = ?, end_time = ? WHERE id = ?',
            [requesterSlot.start_time, requesterSlot.end_time, swapRequest.target_slot_id]
          );

          await connection.execute(
            'UPDATE swap_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, swapId]
          );

          await connection.execute(
            'UPDATE time_slots SET is_available_for_swap = false WHERE id IN (?, ?)',
            [swapRequest.requester_slot_id, swapRequest.target_slot_id]
          );

          await connection.execute(
            'UPDATE swap_requests SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE (requester_slot_id IN (?, ?) OR target_slot_id IN (?, ?)) AND status = "pending" AND id != ?',
            [swapRequest.requester_slot_id, swapRequest.target_slot_id, swapRequest.requester_slot_id, swapRequest.target_slot_id, swapId]
          );

          await connection.commit();
          connection.release();
        } catch (swapError) {
          await connection.rollback();
          connection.release();
          throw swapError;
        }
      } else {
        await fastify.mysql.execute(
          'UPDATE swap_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, swapId]
        );
      }

      const notificationType = status === 'approved' ? 'swap_approved' : 
                              status === 'rejected' ? 'swap_rejected' : 'swap_cancelled';
      const notificationUserId = status === 'cancelled' ? swapRequest.target_user_id : swapRequest.requester_id;
      const notificationTitle = status === 'approved' ? 'Swap Request Approved' :
                               status === 'rejected' ? 'Swap Request Rejected' : 'Swap Request Cancelled';
      const notificationMessage = `Your swap request has been ${status}`;

      const [notificationResult] = await fastify.mysql.execute(
        'INSERT INTO notifications (user_id, type, title, message, related_swap_id) VALUES (?, ?, ?, ?, ?)',
        [notificationUserId, notificationType, notificationTitle, notificationMessage, swapId]
      );

      const notification = {
        id: notificationResult.insertId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        isRead: false,
        relatedSwapId: swapId,
        createdAt: new Date()
      };
      
      if (fastify.wsService) {
        fastify.wsService.sendNotificationToUser(notificationUserId, notification);
      } else {
        fastify.log.warn('WebSocket service not available');
      }

      reply.send({
        success: true,
        message: `Swap request ${status} successfully`
      });
    } catch (error) {
      fastify.log.error('Error updating swap request:', error);
      console.error('Detailed error:', error);
      reply.status(500).send({
        error: true,
        message: 'Internal server error',
        details: error.message
      });
    }
  });

  fastify.get('/notifications', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;

      const [notifications] = await fastify.mysql.execute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [userId]
      );

      reply.send({
        success: true,
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.is_read,
          relatedSwapId: n.related_swap_id,
          createdAt: n.created_at
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

  fastify.put('/notifications/:id/read', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const notificationId = request.params.id;

      const [result] = await fastify.mysql.execute(
        'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );

      if (result.affectedRows === 0) {
        return reply.status(404).send({
          error: true,
          message: 'Notification not found'
        });
      }

      reply.send({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        error: true,
        message: 'Internal server error'
      });
    }
  });

  fastify.put('/notifications/read-all', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;

      await fastify.mysql.execute(
        'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false',
        [userId]
      );

      reply.send({
        success: true,
        message: 'All notifications marked as read'
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