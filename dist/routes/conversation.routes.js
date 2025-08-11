"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conversation_controllers_1 = require("../controllers/conversation.controllers");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Lưu tin nhắn chat
router.post('/save-message', conversation_controllers_1.saveChatMessage);
// Lấy tin nhắn của một conversation
router.get('/messages/:user1Id/:user2Id', conversation_controllers_1.getConversationMessages);
// Lấy danh sách conversations của một user
router.get('/user/:userId', conversation_controllers_1.getUserConversations);
// Xóa tin nhắn với user cụ thể
router.delete('/delete-messages/:userId/:targetUserId', conversation_controllers_1.deleteMessagesForUser);
// Xóa tất cả tin nhắn của user
router.delete('/delete-all-messages/:userId', conversation_controllers_1.deleteAllMessagesForUser);
// Load tin nhắn cho chat support (admin và user)
router.get('/load-messages/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query; // 'admin' hoặc 'user'
        if (role === 'admin') {
            // Admin: lấy tất cả conversations với users
            const conversations = await prisma.conversation.findMany({
                where: {
                    OR: [
                        { user1Id: parseInt(userId) },
                        { user2Id: parseInt(userId) }
                    ]
                },
                include: {
                    user1: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                    user2: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                    messages: {
                        where: {
                            OR: [
                                {
                                    senderId: parseInt(userId),
                                    deletedForSender: false,
                                },
                                {
                                    receiverId: parseInt(userId),
                                    deletedForReceiver: false,
                                },
                            ],
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
            // Lọc bỏ conversations không có tin nhắn nào (đã bị xóa hết)
            const filteredConversations = conversations.filter(conversation => conversation.messages && conversation.messages.length > 0);
            console.log(`📊 load-messages admin: ${conversations.length} conversations, ${filteredConversations.length} visible`);
            res.status(200).json({
                success: true,
                data: filteredConversations,
            });
        }
        else {
            // User: lấy conversation với admin (user1Id = 1 hoặc user2Id = 1)
            const conversation = await prisma.conversation.findFirst({
                where: {
                    OR: [
                        { user1Id: parseInt(userId), user2Id: 1 },
                        { user1Id: 1, user2Id: parseInt(userId) }
                    ]
                },
                include: {
                    messages: {
                        where: {
                            OR: [
                                {
                                    senderId: parseInt(userId),
                                    deletedForSender: false,
                                },
                                {
                                    receiverId: parseInt(userId),
                                    deletedForReceiver: false,
                                },
                            ],
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            });
            res.status(200).json({
                success: true,
                data: conversation ? [conversation] : [],
            });
        }
    }
    catch (error) {
        console.error("Lỗi load tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi load tin nhắn",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.default = router;
