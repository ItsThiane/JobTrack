"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const candidatures_js_1 = __importDefault(require("./routes/candidatures.js"));
const upload_js_1 = __importDefault(require("./routes/upload.js"));
const export_js_1 = __importDefault(require("./routes/export.js"));
dotenv_1.default.config();
//Pour gerer __dirname avec ES modules
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5001;
//Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//Servir les fichiers statiques (uploads)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
//Route de base
app.get('/', (req, res) => {
    res.json({ message: 'API fonctionne !' });
});
//Route de test
app.get('/api/health', (req, res) => {
    res.json({ message: 'API fonctionne !' });
});
//Routes d'authentification
app.use('/api/auth', auth_js_1.default);
//Routes des candidatures
app.use('/api/candidatures', candidatures_js_1.default);
//Routes d'upload et export de fichiers
app.use('/api/upload', upload_js_1.default);
app.use('/api/export', export_js_1.default);
//Demarrage serveur
app.listen(PORT, () => {
    console.log(`Serveur demarré sur http://localhost:${PORT}`);
});
