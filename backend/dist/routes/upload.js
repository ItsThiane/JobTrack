import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth";
const router = Router();
// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.body.type || 'cv'; // 'cv' ou 'lettre'
        const folder = type === 'cv' ? 'uploads/cv' : 'uploads/lettres';
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique du format : userId_timestamp_originalname
        const uniqueName = `${req.user.id}_${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    },
});
// Filtres pour accepter uniquement certains types de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Type de fichier non autorisé. Seuls les PDF et Word sont acceptés.'));
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    } // Limite de 5MB)
});
// Route protégée pour uploader un fichier (CV ou lettre de motivation)
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }
        //Construire l'URL d'accès au fichier
        const fileUrl = `/uploads/${req.body.type || 'cv'}/${req.file.filename}`;
        return res.status(200).json({
            message: 'Fichier uploadé avec succès',
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size,
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'upload du fichier:', error);
        return res.status(500).json({ error: 'Erreur du serveur lors de l\'upload du fichier' });
    }
});
export default router;
