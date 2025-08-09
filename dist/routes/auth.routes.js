"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controllers_1 = require("../controllers/auth.controllers");
const authRoute = (0, express_1.Router)();
authRoute.post("/login", async (req, res, next) => {
    try {
        await (0, auth_controllers_1.login)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Route logout: Xóa refreshToken phía client (nếu dùng cookie thì xóa cookie)
authRoute.post("/logout", auth_controllers_1.logout);
// Route refreshToken: Cấp lại accessToken mới từ refreshToken
authRoute.post("/refresh-token", auth_controllers_1.refreshAccessToken);
authRoute.get("/me", passport_1.default.authenticate("jwt", { session: false }), (req, res) => {
    res.json({ user: req.user });
});
exports.default = authRoute;
