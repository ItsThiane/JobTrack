import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";


const router = Router();
const prisma = new PrismaClient();

//Route pour convertir les donnees en format CSV et les exporter
function convertToCSV(data: any[]): string {
    if (data.length === 0) {
        return '';
    }

    const headers = [
        'Date d\'envoi',
        'Entreprise',
        'Secteur',
        'Poste',
        'Type',
        'Statut',
        'Site Web',
        'Notes',
        'Date de relance',
    ];

    // Construire les lignes CSV
    const rows = data.map((candidature) => [
        new Date(candidature.dateEnvoi).toLocaleDateString('fr-FR'),
        candidature.entreprise.nom,
        candidature.entreprise.secteur || '',  
        candidature.poste,
        candidature.type,
        candidature.statut,
        candidature.entreprise.siteWeb || '',  
        (candidature.notes || '').replace(/"/g, '""'), // Échapper les guillemets
        candidature.dateRelance ? new Date(candidature.dateRelance).toLocaleDateString('fr-FR') : '',
    ]);

    // Construire le contenu CSV
    const csvContent = [
        headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}


// Route pour exporter toutes les candidatures en CSV
router.get('/export/candidatures/csv', authMiddleware, async (req: Request, res: Response) => {
    try {
        const candidatures = await prisma.candidature.findMany({
            where: { 
                userId: req.user!.id, 
            },
            include: { 
                entreprise: true, 
            },
            orderBy: { 
                dateEnvoi: 'desc',
            },
        });

        const csv = convertToCSV(candidatures);
        // Envoyer le fichier CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
    'Content-Disposition',
    `attachment; filename="candidatures_${Date.now()}.csv"`
    );
    res.send('\uFEFF' + csv); // BOM UTF-8 pour Excel
} catch (error) {
    console.error('Erreur export CSV:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
}
});

// Route pour exporter avec filtres
router.get('/candidatures/csv/filtered', authMiddleware, async (req: Request, res: Response) => {
try {
    const { statut, type, dateDebut, dateFin } = req.query;

    const candidatures = await prisma.candidature.findMany({
    where: {
        userId: req.userId!,
        ...(statut && { statut: statut as string }),
        ...(type && { type: type as string }),
        ...(dateDebut && {
        dateEnvoi: {
            gte: new Date(dateDebut as string),
        },
        }),
        ...(dateFin && {
        dateEnvoi: {
            lte: new Date(dateFin as string),
        },
        }),
    },
    include: {
        entreprise: true,
    },
    orderBy: {
        dateEnvoi: 'desc',
    },
    });

    const csv = convertToCSV(candidatures);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
    'Content-Disposition',
    `attachment; filename="candidatures_filtrees_${Date.now()}.csv"`
    );
    res.send('\uFEFF' + csv);
} catch (error) {
    console.error('Erreur export CSV filtré:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
}
});

export default router;