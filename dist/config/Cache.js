"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
exports.tempCache = new node_cache_1.default({
    stdTTL: 1200,
});
