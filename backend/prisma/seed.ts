import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Suppression des donnees existantes
  await prisma.interaction.deleteMany();
  await prisma.candidature.deleteMany();
  await prisma.entreprise.deleteMany();
  await prisma.user.deleteMany();

  // Creation users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'thiane@gmail.com',
      password: hashedPassword,
      nom: 'Dia',
      prenom: 'Thiane',
      statut: 'etudiant',
    },
  });
  

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      nom: 'Martin',
      prenom: 'Bob',
      statut: 'chomeur',
    },
  });
  const user3 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      nom: 'Dupont',
      prenom: 'Alice',
      statut: 'etudiant',
    },
  });

  console.log('Created 2 users');

  // Creation companies
  const companies = await Promise.all([
    prisma.entreprise.create({
      data: {
        nom: 'Google France',
        secteur: 'Technologie',
        siteWeb: 'https://google.fr',
        notes: 'Entreprise leader en tech',
      },
    }),
    prisma.entreprise.create({
      data: {
        nom: 'Microsoft',
        secteur: 'Technologie',
        siteWeb: 'https://microsoft.com',
        notes: 'Leader en cloud et logiciels',
      },
    }),
    prisma.entreprise.create({
      data: {
        nom: 'Accenture',
        secteur: 'Conseil IT',
        siteWeb: 'https://accenture.com',
        notes: 'Conseil et services informatiques',
      },
    }),
    prisma.entreprise.create({
      data: {
        nom: 'Société Générale',
        secteur: 'Finance',
        siteWeb: 'https://societegenerale.fr',
        notes: 'Banque française',
      },
    }),
    prisma.entreprise.create({
      data: {
        nom: 'SNCF',
        secteur: 'Transport',
        siteWeb: 'https://sncf.fr',
        notes: 'Transport ferroviaire',
      },
    }),
  ]);

  console.log('Created 5 companies');

  // Creation candidatures
  const now = new Date();
  const candidatures = await Promise.all([
    prisma.candidature.create({
      data: {
        userId: user1.id,
        entrepriseId: companies[0].id,
        poste: 'Développeur Full Stack',
        type: 'stage',
        statut: 'envoye',
        dateEnvoi: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        notes: 'Candidature intéressante pour stage d\'été',
      },
    }),
    prisma.candidature.create({
      data: {
        userId: user1.id,
        entrepriseId: companies[1].id,
        poste: 'Data Engineer',
        type: 'cdi',
        statut: 'entretien',
        dateEnvoi: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        dateRelance: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: 'Entretien prévu la semaine prochaine',
      },
    }),
    prisma.candidature.create({
      data: {
        userId: user1.id,
        entrepriseId: companies[2].id,
        poste: 'Consultant IT',
        type: 'alternance',
        statut: 'refus',
        dateEnvoi: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        notes: 'Candidature refusée - pas assez d\'expérience',
      },
    }),
    prisma.candidature.create({
      data: {
        userId: user2.id,
        entrepriseId: companies[3].id,
        poste: 'Analyste Financier',
        type: 'cdd',
        statut: 'accepte',
        dateEnvoi: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        notes: 'Offre acceptée ! Début le 1er janvier',
      },
    }),
    prisma.candidature.create({
      data: {
        userId: user2.id,
        entrepriseId: companies[4].id,
        poste: 'Ingénieur Réseau',
        type: 'cdi',
        statut: 'envoye',
        dateEnvoi: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        notes: 'Candidature récente',
      },
    }),
  ]);

  console.log('Created 5 candidatures');

  // Creation  interactions
  await Promise.all([
    prisma.interaction.create({
      data: {
        candidatureId: candidatures[1].id,
        type: 'email',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        description: 'Email de suivi envoyé',
      },
    }),
    prisma.interaction.create({
      data: {
        candidatureId: candidatures[1].id,
        type: 'appel',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        description: 'Appel téléphonique avec le recruteur',
      },
    }),
    prisma.interaction.create({
      data: {
        candidatureId: candidatures[1].id,
        type: 'entretien',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        description: 'Entretien technique prévu',
      },
    }),
    prisma.interaction.create({
      data: {
        candidatureId: candidatures[3].id,
        type: 'entretien',
        date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        description: 'Entretien RH et technique réalisé',
      },
    }),
  ]);

  console.log('Created 4 interactions');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
