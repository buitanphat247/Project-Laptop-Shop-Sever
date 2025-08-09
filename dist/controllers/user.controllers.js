"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserById = exports.deleteUserById = exports.getUserById = exports.createUser = exports.getUser = void 0;
const client_1 = __importDefault(require("../client"));
const hashPassword_1 = require("../utils/hashPassword");
// ✅ Lấy danh sách tất cả user
const getUser = async (req, res) => {
    try {
        // Hỗ trợ phân trang nếu có query page, limit
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await client_1.default.user.count();
        const users = await client_1.default.user.findMany({
            skip,
            take: limit,
            orderBy: { id: "asc" },
            include: { role: true },
        });
        res.json({
            message: "Lấy danh sách user thành công",
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            message: "Lỗi server khi lấy danh sách user.",
            data: null,
            error,
        });
    }
};
exports.getUser = getUser;
// ✅ Tạo user mới
const createUser = async (req, res) => {
    try {
        const { email, password, fullName, phone, address } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Missing email or password." });
            return;
        }
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        const user = await client_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: fullName || null,
                phone: phone || null,
                address: address || null,
                roleId: 2,
            },
        });
        res.json({ message: "User created successfully.", data: user });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Server error while creating user." });
    }
};
exports.createUser = createUser;
// ✅ Lấy user theo ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await client_1.default.user.findUnique({
            where: { id: Number(id) },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.json({ message: "User fetched successfully.", data: user });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error while fetching user." });
    }
};
exports.getUserById = getUserById;
// ✅ Xóa user theo ID
const deleteUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await client_1.default.user.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "User deleted successfully.", data: user });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "User not found." });
            return;
        }
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error while deleting user." });
    }
};
exports.deleteUserById = deleteUserById;
// ✅ Cập nhật user theo ID
const updateUserById = async (req, res) => {
    const { id } = req.params;
    const { email, fullName, phone, address, roleId } = req.body;
    try {
        if (!email) {
            res.status(400).json({ message: "Missing email." });
            return;
        }
        const updatedUser = await client_1.default.user.update({
            where: { id: Number(id) },
            data: {
                email,
                fullName: fullName || null,
                phone: phone || null,
                address: address || null,
                roleId,
            },
        });
        res.json({ message: "User updated successfully.", data: updatedUser });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "User not found." });
            return;
        }
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error while updating user." });
    }
};
exports.updateUserById = updateUserById;
