"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        // Récupérer le token depuis le header Authorization
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        // Vérifier et décoder le token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Ajouter userId à la requête
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Token invalide' });
    }
};
exports.authMiddleware = authMiddleware;
