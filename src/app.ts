// src/index.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mainRouter from "./routes/index.routes";
import path from "path";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Load biến môi trường
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Tạo HTTP Server từ Express App
const server = http.createServer(app);

// Cấu hình Socket.IO và liên kết với HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // chỉnh đúng frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  "/api/v1/image/static",
  express.static(path.join(__dirname, "..", "public"))
);

// Routes
app.use("/api/v1", mainRouter);

// Start server (HTTP + WebSocket)
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const users = new Map();
const messages: any[] = [];

io.on("connection", (socket) => {
  socket.on("join", (user) => {
    users.set(socket.id, {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || user.email,
    });

    // Gửi danh sách users đã gửi tin nhắn cho admin
    const adminSockets = [...users].filter(
      ([, userData]) => userData.role === "admin"
    );
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
    const adminSocketId = [...users].find(
      ([, user]) => user.role === "admin"
    )?.[0];
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
    const adminSockets = [...users].filter(
      ([, userData]) => userData.role === "admin"
    );
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
    } else if (data.role !== 'admin') {
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
      } else {
        console.log("❌ Could not find targetSocketId for user:", data.targetUserId);
      }
    } else if (data.role !== 'admin') {
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
