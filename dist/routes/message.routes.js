"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_controllers_1 = require("../controllers/message.controllers");
const router = express_1.default.Router();
// Gửi tin nhắn mới
router.post('/send-message', message_controllers_1.sendMessage);
// Lấy tin nhắn theo conversation ID (có phân trang)
router.get('/messages/:conversationId', message_controllers_1.getMessagesByConversationId);
// Lấy tin nhắn theo ID
router.get('/message/:id', message_controllers_1.getMessageById);
// Cập nhật trạng thái tin nhắn
router.put('/message/:id/status', message_controllers_1.updateMessageStatus);
// Đánh dấu tin nhắn đã đọc
router.put('/conversation/:conversationId/read/:userId', message_controllers_1.markMessageAsRead);
// Xóa tin nhắn
router.delete('/message/:id', message_controllers_1.deleteMessage);
exports.default = router;
