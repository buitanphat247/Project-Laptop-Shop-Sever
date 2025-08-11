"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllMessagesForUser = exports.deleteMessagesForUser = exports.getUserConversations = exports.getConversationMessages = exports.saveChatMessage = exports.getConversationsByUser2Id = exports.getConversationsByUser1Id = exports.deleteConversation = exports.updateConversation = exports.getConversationById = exports.getConversationsByUserId = exports.createConversation = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Tạo conversation mới
const createConversation = async (req, res) => {
    try {
        const { user1Id, user2Id, message } = req.body;
        // Sử dụng transaction để xử lý conversation và message
        const result = await prisma.$transaction(async (tx) => {
            // Kiểm tra xem conversation đã tồn tại chưa
            let conversation = await tx.conversation.findFirst({
                where: {
                    OR: [
                        { user1Id: parseInt(user1Id), user2Id: parseInt(user2Id) },
                        { user1Id: parseInt(user2Id), user2Id: parseInt(user1Id) },
                    ],
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
                },
            });
            let isNewConversation = false;
            // Nếu chưa có conversation, tạo mới
            if (!conversation) {
                conversation = await tx.conversation.create({
                    data: {
                        user1Id: parseInt(user1Id),
                        user2Id: parseInt(user2Id),
                        unreadCountUser1: 0,
                        unreadCountUser2: 0,
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
                    },
                });
                isNewConversation = true;
            }
            // Tạo message mới (luôn tạo message nếu có nội dung)
            let newMessage = null;
            if (message && message.content) {
                newMessage = await tx.message.create({
                    data: {
                        conversationId: conversation.id,
                        senderId: parseInt(user1Id),
                        receiverId: parseInt(user2Id),
                        content: message.content,
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
                await tx.conversation.update({
                    where: { id: conversation.id },
                    data: {
                        lastMessage: message.content,
                        lastMessageAt: new Date(),
                        updatedAt: new Date(),
                        unreadCountUser2: conversation.unreadCountUser2 + 1,
                    },
                });
            }
            return {
                conversation,
                message: newMessage,
                isNewConversation,
            };
        });
        const responseMessage = result.isNewConversation
            ? "Tạo conversation và message thành công"
            : "Conversation đã tồn tại, đã tạo message mới";
        res.status(result.isNewConversation ? 201 : 200).json({
            success: true,
            message: responseMessage,
            data: {
                conversationId: result.conversation.id,
                conversation: result.conversation,
                message: result.message,
                isNewConversation: result.isNewConversation,
            },
        });
    }
    catch (error) {
        console.error("Lỗi tạo conversation:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createConversation = createConversation;
// Lấy danh sách conversation của user
const getConversationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [{ user1Id: parseInt(userId) }, { user2Id: parseInt(userId) }],
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
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        res.status(200).json({
            success: true,
            message: "Lấy danh sách conversation thành công",
            data: conversations,
        });
    }
    catch (error) {
        console.error("Lỗi lấy conversations:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getConversationsByUserId = getConversationsByUserId;
// Lấy conversation theo ID
const getConversationById = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: parseInt(id),
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
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy conversation",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Lấy conversation thành công",
            data: conversation,
        });
    }
    catch (error) {
        console.error("Lỗi lấy conversation:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getConversationById = getConversationById;
// Cập nhật conversation (chủ yếu là lastMessage và unreadCount)
const updateConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const { lastMessage, lastMessageAt, unreadCountUser1, unreadCountUser2 } = req.body;
        const conversation = await prisma.conversation.update({
            where: {
                id: parseInt(id),
            },
            data: {
                lastMessage,
                lastMessageAt: lastMessageAt ? new Date(lastMessageAt) : undefined,
                unreadCountUser1: unreadCountUser1 !== undefined
                    ? parseInt(unreadCountUser1)
                    : undefined,
                unreadCountUser2: unreadCountUser2 !== undefined
                    ? parseInt(unreadCountUser2)
                    : undefined,
                updatedAt: new Date(),
            },
        });
        res.status(200).json({
            success: true,
            message: "Cập nhật conversation thành công",
            data: conversation,
        });
    }
    catch (error) {
        console.error("Lỗi cập nhật conversation:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateConversation = updateConversation;
// Xóa conversation
const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;
        // Xóa tất cả messages trước
        await prisma.message.deleteMany({
            where: {
                conversationId: parseInt(id),
            },
        });
        // Sau đó xóa conversation
        await prisma.conversation.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.status(200).json({
            success: true,
            message: "Xóa conversation thành công",
        });
    }
    catch (error) {
        console.error("Lỗi xóa conversation:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteConversation = deleteConversation;
// Lấy danh sách conversation theo user1Id
const getConversationsByUser1Id = async (req, res) => {
    try {
        const { user1Id } = req.params;
        const conversation = await prisma.conversation.findFirst({
            where: {
                user1Id: parseInt(user1Id),
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
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1, // chỉ lấy tin nhắn mới nhất
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: `Không tìm thấy conversation nào với user1Id = ${user1Id}`,
            });
        }
        res.status(200).json({
            success: true,
            message: `Lấy conversation của user1 (ID: ${user1Id}) thành công`,
            data: conversation,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy conversation theo user1Id:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy conversation theo user1Id",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getConversationsByUser1Id = getConversationsByUser1Id;
// Lấy danh sách conversation theo user2Id
const getConversationsByUser2Id = async (req, res) => {
    try {
        const { user2Id } = req.params;
        const conversations = await prisma.conversation.findMany({
            where: {
                user2Id: parseInt(user2Id),
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
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1, // Chỉ lấy 1 tin nhắn mới nhất
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        res.status(200).json({
            success: true,
            message: `Lấy danh sách conversation của user2 (ID: ${user2Id}) thành công`,
            data: conversations,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy conversation theo user2Id:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy conversation theo user2Id",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getConversationsByUser2Id = getConversationsByUser2Id;
// Lưu tin nhắn chat vào database
const saveChatMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content, role } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!senderId || !receiverId || !content) {
            res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc: senderId, receiverId, content",
            });
            return;
        }
        // Kiểm tra senderId và receiverId có phải là số hợp lệ không
        const senderIdNum = parseInt(senderId);
        const receiverIdNum = parseInt(receiverId);
        if (isNaN(senderIdNum) ||
            isNaN(receiverIdNum) ||
            senderIdNum <= 0 ||
            receiverIdNum <= 0) {
            res.status(400).json({
                success: false,
                message: "senderId và receiverId phải là số nguyên dương hợp lệ",
            });
            return;
        }
        // Kiểm tra không cho phép admin nhắn tin với admin khác
        if (role === "admin" && senderIdNum === receiverIdNum) {
            res.status(400).json({
                success: false,
                message: "Admin không thể nhắn tin với chính mình",
            });
            return;
        }
        // Tìm hoặc tạo conversation giữa 2 user
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: senderIdNum, user2Id: receiverIdNum },
                    { user1Id: receiverIdNum, user2Id: senderIdNum },
                ],
            },
        });
        // Nếu chưa có conversation, tạo mới
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: senderIdNum,
                    user2Id: receiverIdNum,
                    unreadCountUser1: 0,
                    unreadCountUser2: 0,
                },
            });
        }
        // Tạo message mới
        const newMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: senderIdNum,
                receiverId: receiverIdNum,
                content: content,
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
            where: { id: conversation.id },
            data: {
                lastMessage: content,
                lastMessageAt: new Date(),
                updatedAt: new Date(),
                // Tăng unread count cho receiver
                ...(conversation.user1Id === senderIdNum
                    ? { unreadCountUser2: conversation.unreadCountUser2 + 1 }
                    : { unreadCountUser1: conversation.unreadCountUser1 + 1 }),
            },
        });
        res.status(201).json({
            success: true,
            message: "Tin nhắn đã được lưu thành công",
            data: {
                messageId: newMessage.id,
                conversationId: conversation.id,
                message: newMessage,
            },
        });
    }
    catch (error) {
        console.error("Lỗi lưu tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lưu tin nhắn",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.saveChatMessage = saveChatMessage;
// Lấy tin nhắn của một conversation
const getConversationMessages = async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;
        const conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: parseInt(user1Id), user2Id: parseInt(user2Id) },
                    { user1Id: parseInt(user2Id), user2Id: parseInt(user1Id) },
                ],
            },
            include: {
                messages: {
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
                        createdAt: "asc",
                    },
                },
            },
        });
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy conversation",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                conversation,
                messages: conversation.messages,
            },
        });
    }
    catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy tin nhắn",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getConversationMessages = getConversationMessages;
// Lấy danh sách conversations của một user
const getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdInt = parseInt(userId);
        if (isNaN(userIdInt)) {
            res.status(400).json({
                success: false,
                message: "User ID phải là số nguyên hợp lệ",
            });
            return;
        }
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [{ user1Id: userIdInt }, { user2Id: userIdInt }],
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
                                senderId: userIdInt,
                                deletedForSender: false,
                            },
                            {
                                receiverId: userIdInt,
                                deletedForReceiver: false,
                            },
                        ],
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        // Lọc bỏ conversations không có tin nhắn nào (đã bị xóa hết)
        const filteredConversations = conversations.filter(conversation => conversation.messages && conversation.messages.length > 0);
        console.log(`📊 getUserConversations: ${conversations.length} conversations, ${filteredConversations.length} visible`);
        res.status(200).json({
            success: true,
            data: filteredConversations,
        });
    }
    catch (error) {
        console.error("Lỗi lấy conversations:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy conversations",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getUserConversations = getUserConversations;
// Xóa tin nhắn cho một user cụ thể
const deleteMessagesForUser = async (req, res) => {
    try {
        const { userId, targetUserId } = req.params;
        const userIdInt = parseInt(userId);
        const targetUserIdInt = parseInt(targetUserId);
        if (isNaN(userIdInt) || isNaN(targetUserIdInt)) {
            res.status(400).json({
                success: false,
                message: "User ID và Target User ID phải là số nguyên hợp lệ",
            });
            return;
        }
        // Tìm conversation giữa 2 user
        const conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: userIdInt, user2Id: targetUserIdInt },
                    { user1Id: targetUserIdInt, user2Id: userIdInt },
                ],
            },
        });
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy conversation giữa 2 user",
            });
            return;
        }
        // Cập nhật trạng thái xóa cho tất cả tin nhắn trong conversation
        // Chỉ đánh dấu xóa cho user hiện tại (userIdInt), không ảnh hưởng đến user khác
        // Xóa tin nhắn mà user hiện tại đã gửi
        await prisma.message.updateMany({
            where: {
                conversationId: conversation.id,
                senderId: userIdInt,
            },
            data: {
                deletedForSender: true,
            },
        });
        // Xóa tin nhắn mà user hiện tại đã nhận
        await prisma.message.updateMany({
            where: {
                conversationId: conversation.id,
                receiverId: userIdInt,
            },
            data: {
                deletedForReceiver: true,
            },
        });
        res.json({
            success: true,
            message: "Đã xóa tin nhắn thành công",
        });
    }
    catch (error) {
        console.error("Lỗi khi xóa tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa tin nhắn",
        });
    }
};
exports.deleteMessagesForUser = deleteMessagesForUser;
// Xóa tất cả tin nhắn của một user
const deleteAllMessagesForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdInt = parseInt(userId);
        if (isNaN(userIdInt)) {
            res.status(400).json({
                success: false,
                message: "User ID phải là số nguyên hợp lệ",
            });
            return;
        }
        // Cập nhật trạng thái xóa cho tất cả tin nhắn của user
        await prisma.message.updateMany({
            where: {
                OR: [
                    { senderId: userIdInt },
                    { receiverId: userIdInt },
                ],
            },
            data: {
                deletedForSender: true,
                deletedForReceiver: true,
            },
        });
        res.json({
            success: true,
            message: "Đã xóa tất cả tin nhắn thành công",
        });
    }
    catch (error) {
        console.error("Lỗi khi xóa tất cả tin nhắn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa tất cả tin nhắn",
        });
    }
};
exports.deleteAllMessagesForUser = deleteAllMessagesForUser;
