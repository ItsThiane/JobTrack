import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import candidatureRoutes from './routes/candidatures';
dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;
//Middlewares
app.use(cors());
app.use(express.json());
//Route de test
app.get('/api/health', (req, res) => {
    res.json({ message: 'API fonctionne !' });
});
//Routes d'authentification
app.use('/api/auth', authRoutes);
//Routes des candidatures
app.use('/api/candidatures', candidatureRoutes);
//Demarrage serveur
app.listen(PORT, () => {
    console.log(`Serveur demarré sur http://localhost:${PORT}`);
});
