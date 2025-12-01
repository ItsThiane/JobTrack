import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

//Créer une candidature
router.post("/", async (req: Request, res: Response) => {
    try {
        const { 
            entrepriseNom,
            entrepriseSecteur,
            entrepriseSiteWeb,
            poste,
            type,
            statut,
            dateEnvoi,
            cvUrl,
            lettreUrl,
            notes,
        } = req.body;

        // Validation des champs requis
        const allowedTypes = ["stage", "alternance", "cdd", "cdi"];
        const allowedStatuts = ["envoye", "entretien", "refus", "accepte"];
        if (!entrepriseNom || !poste || !type || !statut || !dateEnvoi) {
            return res.status(400).json({ error: "Champs requis manquants." });
        }
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ error: "Type de candidature invalide." });
        }
        if (!allowedStatuts.includes(statut)) {
            return res.status(400).json({ error: "Statut de candidature invalide." });
        }
        const dateObj = new Date(dateEnvoi);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ error: "Date d'envoi invalide." });
        }

        //Chercher ou Créer l'entreprise
        let entreprise = await prisma.entreprise.findFirst({
            where: { nom: entrepriseNom },
        });

        if (!entreprise) {
            entreprise = await prisma.entreprise.create({
                data: {
                    nom: entrepriseNom,
                    secteur: entrepriseSecteur,
                    siteWeb: entrepriseSiteWeb,
                },
            });
        }

        //Créer la candidature
        const candidature = await prisma.candidature.create({
            data: {
                userId: req.userId!,
                entrepriseId: entreprise.id,
                poste,
                type,
                statut: statut || "envoye",
                dateEnvoi: dateObj,
                cvUrl,
                lettreUrl,
                notes,
            },
            include: { 
                entreprise: true,  
                user: {
                    select: {
                        id: true,
                        email: true,
                        nom: true,
                        prenom: true,
                    },  
                },
            },
        });

        return res.status(201).json(candidature);
    } catch (error) {
        console.error("Erreur création candidature", error);
        return res.status(500).json({ error: "Erreur du serveur" });
    }
});

//Récupérer toutes les candidatures de l'utilisateur authentifié
router.get("/", async (req: Request, res: Response) => {
    try {
        const { statut, type, page = "1", limit = "10" } = req.query;
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        const where = {
            userId: req.userId!,
            ...(statut && { statut: statut as string }),
            ...(type && { type: type as string }),
        };

        const [candidatures, total] = await Promise.all([
            prisma.candidature.findMany({
                where,
                include: {
                    entreprise: true,
                    interactions: {
                        orderBy: { date: "desc" },
                    },
                },
                orderBy: {
                    dateEnvoi: "desc",
                },
                skip,
                take: limitNum,
            }),
            prisma.candidature.count({ where }),
        ]);
        return res.json({ candidatures, total, page: pageNum, limit: limitNum });
    } catch (error) {
        console.error("Erreur récupération candidatures", error);
        return res.status(500).json({ error: "Erreur du serveur" });
    }
});

//Récupérer une candidature par ID
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const candidature = await prisma.candidature.findFirst({
            where: { 
                id: parseInt(req.params.id), 
                userId: req.userId!,     //Par sécurité, on vérifie que c'est bien sa candidature
            },
            include: {
                entreprise: true,
                interactions: {
                    orderBy: { date: "desc" },
                },
            },
        });
        
        if (!candidature) {
            return res.status(404).json({ message: "Candidature non trouvée." });
        }

        return res.json(candidature);
    } catch (error) {
        console.error("Erreur récupération candidature", error);
        return res.status(500).json({ error: "Erreur du serveur" });
    }
});

//Mettre à jour une candidature
router.patch("/:id", async (req: Request, res: Response) => {
    try {
        const { statut, dateRelance, notes, poste, type } = req.body;
        const allowedTypes = ["stage", "alternance", "cdd", "cdi"];
        const allowedStatuts = ["envoye", "entretien", "refus", "accepte"];

        //Vérifier que la candidature appartient bien à l'utilisateur
        const existingCandidature = await prisma.candidature.findFirst({
            where: { id: parseInt(req.params.id), userId: req.userId! },
        });
        
        if (!existingCandidature) {
            return res.status(404).json({ message: "Candidature non trouvée." });
        }

        // Validation des enums et date
        if (type && !allowedTypes.includes(type)) {
            return res.status(400).json({ error: "Type de candidature invalide." });
        }
        if (statut && !allowedStatuts.includes(statut)) {
            return res.status(400).json({ error: "Statut de candidature invalide." });
        }
        let dateRelanceObj;
        if (dateRelance) {
            dateRelanceObj = new Date(dateRelance);
            if (isNaN(dateRelanceObj.getTime())) {
                return res.status(400).json({ error: "Date de relance invalide." });
            }
        }

        //Mettre à jour la candidature
        const Candidature = await prisma.candidature.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(statut && { statut }),
                ...(dateRelance && { dateRelance: dateRelanceObj }),
                ...(notes !== undefined && { notes }),
                ...(poste && { poste }),
                ...(type && { type }),
            },
            include : {
                entreprise: true,
                interactions: true,
            },
        });

        return res.json(Candidature);
    } catch (error) {
        console.error("Erreur mise à jour candidature", error);
        return res.status(500).json({ error: "Erreur du serveur" });
    }
});

//Supprimer une candidature
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        //Vérifier que la candidature appartient bien à l'utilisateur
        const Candidature = await prisma.candidature.findFirst({
            where: { id: parseInt(req.params.id), userId: req.userId! },
        });

        if (!Candidature) {
            return res.status(404).json({ message: "Candidature non trouvée." });
        }
        
        // Supprimer les interactions en cascade
        await prisma.interaction.deleteMany({
            where: { candidatureId: parseInt(req.params.id) },
        });
        
        //Supprimer la candidature
        await prisma.candidature.delete({
            where: { id: parseInt(req.params.id) },
        });

        return res.json({ message: "Candidature supprimée avec succès." });
    } catch (error) {
        console.error("Erreur suppression candidature", error);
        return res.status(500).json({ error: "Erreur du serveur" });
    }
}); 

//Ajouter une interaction à une candidature
router.post("/:id/interactions", async (req: Request, res: Response) => {
    try {
        const { type, date, description } = req.body;

        //Validation des champs requis
        if (!type || !date) {
            return res.status(400).json({ message: "Champs requis manquants." });
        }

        //Vérifier que la candidature appartient bien à l'utilisateur
        const Candidature = await prisma.candidature.findFirst({
            where: { 
                id: parseInt(req.params.id), 
                userId: req.userId! 
            },
        });

        if (!Candidature) {
            return res.status(404).json({ message: "Candidature non trouvée." });
        }

        //Créer l'interaction
        const interaction = await prisma.interaction.create({
            data: {
                candidatureId: parseInt(req.params.id),
                type,
                date: new Date(date),
                description,
            },
        });

        return res.status(201).json(interaction);
    } catch (error) {
        console.error("Erreur création interaction", error);
        return res.status(500).json({ error: "Erreur du serveur" });
    }
});

//Statistiques des candidatures
router.get("/stats/summary", async (req: Request, res: Response) => {
    try {
         const stats = await prisma.candidature.groupBy({
            by: ['statut'],
            where: { 
                userId: req.userId!, 
            },
            _count: true,
        });

        const statsByType = await prisma.candidature.groupBy({
            by: ['type'],
            where: { 
                userId: req.userId!, 
            },
            _count: true,
        });

        const totalCandidatures = await prisma.candidature.count({
            where: { userId: req.userId! },
        });

        const statsFormatted = stats.reduce((acc, stat) => {
            acc[stat.statut] = stat._count;
            return acc;
        }, {} as Record<string, number>);

        const typeFormatted = statsByType.reduce((acc, stat) => {
            acc[stat.type] = stat._count;
            return acc;
        }, {} as Record<string, number>);

        return res.json({
            totalCandidatures,
            byStatut: statsFormatted,
            byType: typeFormatted,
        });
    } catch (error) {
        console.error("Erreur récupération statistiques", error);
        return res.status(500).json({ error: "Erreur du serveur" });
    }
}); 


export default router;