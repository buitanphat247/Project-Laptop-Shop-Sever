"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Lấy thời gian sống access token từ biến môi trường (giây)
const ACCESS_TOKEN_EXPIRES_IN = 604800;
// Lấy thời gian sống refresh token từ biến môi trường (giây)
const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 2592000; // mặc định 7 ngày
const generateAccessToken = (user) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ACCESS_TOKEN_EXPIRES_IN;
    return jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        iat: now,
        exp: exp,
    }, process.env.JWT_SECRET, { noTimestamp: true });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + REFRESH_TOKEN_EXPIRES_IN;
    return jsonwebtoken_1.default.sign({
        userId,
        iat: now,
        exp: exp,
    }, process.env.REFRESH_SECRET, { noTimestamp: true });
};
exports.generateRefreshToken = generateRefreshToken;
