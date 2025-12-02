import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    try {
        // Récupérer le token depuis le header Authorization
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Ajouter userId à la requête
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Token invalide' });
    }
};
