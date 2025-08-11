import express from 'express';
import {
  sendMessage,
  getMessagesByConversationId,
  getMessageById,
  updateMessageStatus,
  markMessageAsRead,
  deleteMessage
} from '../controllers/message.controllers';

const router = express.Router();

// Gửi tin nhắn mới
router.post('/send-message', sendMessage);

// Lấy tin nhắn theo conversation ID (có phân trang)
router.get('/messages/:conversationId', getMessagesByConversationId);

// Lấy tin nhắn theo ID
router.get('/message/:id', getMessageById);

// Cập nhật trạng thái tin nhắn
router.put('/message/:id/status', updateMessageStatus);

// Đánh dấu tin nhắn đã đọc
router.put('/conversation/:conversationId/read/:userId', markMessageAsRead);

// Xóa tin nhắn
router.delete('/message/:id', deleteMessage);

export default router;
