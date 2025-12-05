import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import candidatureRoutes from './routes/candidatures';
import uploadRoutes from './routes/upload';
import exportRoutes from './routes/export';
import dotenv from 'dotenv';

dotenv.config();

//Pour gerer __dirname avec ES modules

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

//Middlewares
app.use(cors());
app.use(express.json());

//Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


//Route de test
app.get('/api/health', (req, res) => {
    res.json({ message: 'API fonctionne !' });
});

//Routes d'authentification
app.use('/api/auth', authRoutes);

//Routes des candidatures
app.use('/api/candidatures', candidatureRoutes);

//Routes d'upload et export de fichiers
app.use('/api/upload', uploadRoutes);
app.use('/api/export', exportRoutes);

//Demarrage serveur
app.listen(PORT, () => {
    console.log(`Serveur demarré sur http://localhost:${PORT}`);
});