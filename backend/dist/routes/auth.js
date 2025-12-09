"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        const { email, password, nom, prenom, statut } = req.body;
        // Vérification des champs requis
        if (!email || !password || !nom || !prenom || !statut) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }
        // Vérification si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email déjà utilisé' });
        }
        // Hashage du mot de passe
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Création de l'utilisateur
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                nom,
                prenom,
                statut,
            },
        });
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ token, user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom } });
    }
    catch (error) {
        console.error('Erreur Register', error);
        return res.status(500).json({ error: 'Erreur du serveur' });
    }
});
// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et password sont requis.' });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        // Vérification
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        // Vérification du mot de passe
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        //Retourner le token et les infos utilisateur
        return res.json({ token, user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom } });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});
//Route pour obterir les infos de l'utilisateur connecté
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, nom: true, prenom: true, statut: true, createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        return res.json({ user });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});
//Route de logout (client-side, mais on peut valider le token)
router.post('/logout', async (req, res) => {
    try {
        // Le logout vrai se fait client-side (supprimer le token du localStorage)
        // Cette route peut être utilisée pour invalider des sessions côté serveur si nécessaire
        return res.json({ message: 'Déconnexion réussie' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});
exports.default = router;
