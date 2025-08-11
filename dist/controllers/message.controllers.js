"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.markMessageAsRead = exports.updateMessageStatus = exports.getMessageById = exports.getMessagesByConversationId = exports.sendMessage = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Gửi tin nhắn mới
const sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, receiverId, content } = req.body;
        // Tạo tin nhắn mới
        const message = await prisma.message.create({
            data: {
                conversationId: parseInt(conversationId),
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                content,
                status: "sent",
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        // Cập nhật conversation với tin nhắn mới nhất
        await prisma.conversation.update({
            where: {
                id: parseInt(conversationId),
            },
            data: {
                lastMessage: content,
                lastMessageAt: new Date(),
                updatedAt: new Date(),
            },
        });
        // Tăng số tin nhắn chưa đọc cho người nhận
        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(conversationId) },
        });
        if (conversation) {
            if (conversation.user1Id === parseInt(receiverId)) {
                await prisma.conversation.update({
                    where: { id: parseInt(conversationId) },
                    data: { unreadCountUser1: { increment: 1 } },
                });
            }
            else if (conversation.user2Id === parseInt(receiverId)) {
                await prisma.conversation.update({
                    where: { id: parseInt(conversationId) },
                    data: { unreadCountUser2: { increment: 1 } },
                });
            }
        }
        res.status(201).json({
            success: true,
            message: "Gửi tin nhắn thành công",
            data: message,
        });
    }
    catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.sendMessage = sendMessage;
// Lấy tin nhắn theo conversation ID
const getMessagesByConversationId = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page, limit, all } = req.query;
        // Nếu có tham số 'all' hoặc không có page/limit, lấy tất cả tin nhắn
        if (all === "true" || (!page && !limit)) {
            const messages = await prisma.message.findMany({
                where: {
                    conversationId: parseInt(conversationId),
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc", // Sắp xếp theo thứ tự thời gian tăng dần (cũ nhất trước)
                },
            });
            res.status(200).json({
                success: true,
                message: "Lấy tất cả tin nhắn thành công",
                data: {
                    messages,
                },
            });
            return;
        }
        // Nếu có phân trang
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const skip = (pageNum - 1) * limitNum;
        const messages = await prisma.message.findMany({
            where: {
                conversationId: parseInt(conversationId),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limitNum,
        });
        // Đếm tổng số tin nhắn
        const totalMessages = await prisma.message.count({
            where: {
                conversationId: parseInt(conversationId),
            },
        });
        res.status(200).json({
            success: true,
            message: "Lấy tin nhắn thành công",
            data: {
                messages: messages.reverse(), // Đảo ngược để hiển thị theo thứ tự thời gian
            },
        });
        return;
    }
    catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return;
    }
};
exports.getMessagesByConversationId = getMessagesByConversationId;
// Lấy tin nhắn theo ID
const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await prisma.message.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (!message) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy tin nhắn",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Lấy tin nhắn thành công",
            data: message,
        });
    }
    catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getMessageById = getMessageById;
// Cập nhật trạng thái tin nhắn (delivered, read)
const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const message = await prisma.message.update({
            where: {
                id: parseInt(id),
            },
            data: {
                status,
            },
        });
        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái tin nhắn thành công",
            data: message,
        });
    }
    catch (error) {
        console.error("Lỗi cập nhật trạng thái tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateMessageStatus = updateMessageStatus;
// Đánh dấu tin nhắn đã đọc
const markMessageAsRead = async (req, res) => {
    try {
        const { conversationId, userId } = req.params;
        // Cập nhật trạng thái tất cả tin nhắn trong conversation thành 'read'
        await prisma.message.updateMany({
            where: {
                conversationId: parseInt(conversationId),
                receiverId: parseInt(userId),
                status: { not: "read" },
            },
            data: {
                status: "read",
            },
        });
        // Reset số tin nhắn chưa đọc
        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(conversationId) },
        });
        if (conversation) {
            if (conversation.user1Id === parseInt(userId)) {
                await prisma.conversation.update({
                    where: { id: parseInt(conversationId) },
                    data: { unreadCountUser1: 0 },
                });
            }
            else if (conversation.user2Id === parseInt(userId)) {
                await prisma.conversation.update({
                    where: { id: parseInt(conversationId) },
                    data: { unreadCountUser2: 0 },
                });
            }
        }
        res.status(200).json({
            success: true,
            message: "Đánh dấu tin nhắn đã đọc thành công",
        });
    }
    catch (error) {
        console.error("Lỗi đánh dấu tin nhắn đã đọc:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.markMessageAsRead = markMessageAsRead;
// Xóa tin nhắn
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.message.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.status(200).json({
            success: true,
            message: "Xóa tin nhắn thành công",
        });
    }
    catch (error) {
        console.error("Lỗi xóa tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteMessage = deleteMessage;
