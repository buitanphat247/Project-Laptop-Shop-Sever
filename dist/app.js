"use strict";
// src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Load biến môi trường
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Tạo HTTP Server từ Express App
const server = http_1.default.createServer(app);
// Cấu hình Socket.IO và liên kết với HTTP server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000", // chỉnh đúng frontend
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});
// Middlewares
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api/v1/image/static", express_1.default.static(path_1.default.join(__dirname, "..", "public")));
// Routes
app.use("/api/v1/", user_routes_1.default);
app.use("/api/v1/auth", auth_routes_1.default);
// Start server (HTTP + WebSocket)
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
const users = new Map();
const messages = [];
io.on("connection", (socket) => {
    socket.on("join", (user) => {
        users.set(socket.id, {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name || user.email,
        });
        // Gửi danh sách users đã gửi tin nhắn cho admin
        const adminSockets = [...users].filter(([, userData]) => userData.role === "admin");
        const uniqueUsers = [...new Set(messages.map((msg) => msg.from))];
        const usersWithMessages = uniqueUsers.map((userId) => {
            const userMsg = messages.find((msg) => msg.from === userId);
            return {
                userId: userId,
                email: userMsg.email,
                role: userMsg.role,
                name: userMsg.email,
                socket_id: socket.id,
            };
        }).filter(user => user.role !== 'admin'); // Loại bỏ admin khỏi danh sách
        adminSockets.forEach(([adminSocketId]) => {
            io.to(adminSocketId).emit("users_list", usersWithMessages);
        });
        console.log("Danh sách người dùng có trong sever: ", users);
    });
    socket.on("send_message", (data) => {
        // console.log('💬 Received message:', data);
        console.log("Danh sách người dùng có trong sever: ", users);
        // Lưu tin nhắn vào mảng
        messages.push(data);
        // Gửi tin nhắn cho admin
        const adminSocketId = [...users].find(([, user]) => user.role === "admin")?.[0];
        console.log("SocketId của admin là: ", adminSocketId);
        io.to(adminSocketId).emit("receive_message", {
            ...data,
            socket_id: socket.id,
        });
        // Gửi tin nhắn lại cho user để họ thấy tin nhắn của mình
        socket.emit("receive_message", {
            ...data,
            socket_id: socket.id,
        });
        // Cập nhật danh sách users cho admin
        const adminSockets = [...users].filter(([, userData]) => userData.role === "admin");
        const uniqueUsers = [...new Set(messages.map((msg) => msg.from))];
        const usersWithMessages = uniqueUsers.map((userId) => {
            const userMsg = messages.find((msg) => msg.from === userId);
            return {
                userId: userId,
                email: userMsg.email,
                role: userMsg.role,
                name: userMsg.email,
                socket_id: socket.id,
            };
        }).filter(user => user.role !== 'admin'); // Loại bỏ admin khỏi danh sách
        adminSockets.forEach(([adminSocketId]) => {
            io.to(adminSocketId).emit("users_list", usersWithMessages);
        });
    });
    // Xử lý tin nhắn từ admin gửi cho user cụ thể
    socket.on("admin_send_message", (data) => {
        console.log("💬 Admin sending message to user:", data);
        // Lưu tin nhắn vào mảng
        messages.push(data);
        // Gửi tin nhắn cho user cụ thể
        const targetSocketId = data.to;
        io.to(targetSocketId).emit("receive_message", {
            ...data,
            socket_id: socket.id,
        });
        // Gửi tin nhắn lại cho admin để họ thấy tin nhắn của mình
        socket.emit("receive_message", {
            ...data,
            socket_id: socket.id,
        });
    });
    // Xử lý typing indicator - bắt đầu nhập
    socket.on("typing_start", (data) => {
        console.log("⌨️ User started typing:", data);
        if (data.role === 'admin' && data.targetUserId) {
            // Admin đang nhập tin nhắn cho user cụ thể
            const targetSocketId = [...users].find(([, userData]) => userData.userId === data.targetUserId)?.[0];
            if (targetSocketId) {
                io.to(targetSocketId).emit("typing_start", { userId: data.userId });
            }
        }
        else if (data.role !== 'admin') {
            // User đang nhập tin nhắn - gửi cho tất cả admin
            const adminSockets = [...users].filter(([, userData]) => userData.role === "admin");
            adminSockets.forEach(([adminSocketId]) => {
                io.to(adminSocketId).emit("typing_start", { userId: data.userId });
            });
        }
    });
    // Xử lý typing indicator - dừng nhập
    socket.on("typing_stop", (data) => {
        console.log("⏹️ User stopped typing:", data);
        console.log("📋 All users:", Array.from(users.entries()));
        if (data.role === 'admin' && data.targetUserId) {
            // Admin dừng nhập tin nhắn cho user cụ thể
            const targetSocketId = [...users].find(([, userData]) => userData.userId === data.targetUserId)?.[0];
            console.log("🎯 Admin typing_stop - targetUserId:", data.targetUserId, "targetSocketId:", targetSocketId);
            if (targetSocketId) {
                io.to(targetSocketId).emit("typing_stop", { userId: data.userId });
                console.log("✅ Sent typing_stop to user:", targetSocketId);
            }
            else {
                console.log("❌ Could not find targetSocketId for user:", data.targetUserId);
            }
        }
        else if (data.role !== 'admin') {
            // User dừng nhập tin nhắn - gửi cho tất cả admin
            const adminSockets = [...users].filter(([, userData]) => userData.role === "admin");
            adminSockets.forEach(([adminSocketId]) => {
                io.to(adminSocketId).emit("typing_stop", { userId: data.userId });
            });
        }
    });
    socket.on("disconnect", () => {
        const user = users.get(socket.id);
        if (user) {
            console.log(`👋 User disconnected: ${user.name} (${user.role})`);
            users.delete(socket.id);
        }
    });
});
