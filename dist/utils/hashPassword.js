"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
/**
 * Hàm mã hóa mật khẩu người dùng
 * @param password Mật khẩu thô người dùng nhập
 * @returns Mật khẩu đã được mã hóa (hash)
 */
const hashPassword = async (password) => {
    if (!password || password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    }
    const hashed = await bcrypt_1.default.hash(password, SALT_ROUNDS);
    return hashed;
};
exports.hashPassword = hashPassword;
