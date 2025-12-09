import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Fonction utilitaire pour ajouter des jours à une date
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

async function main() {
  console.log('--- Démarrage de l\'amorçage de la base de données ---');

  // 1. Suppression des donnees existantes (pour un environnement propre)
  await prisma.interaction.deleteMany();
  //await prisma.tag.deleteMany();
  await prisma.candidature.deleteMany();
  await prisma.entreprise.deleteMany();
  await prisma.user.deleteMany();

  // 2. Création des utilisateurs
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log('Création des utilisateurs...');

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

  // 3. Création des entreprises (y compris celles vues dans le dashboard)
  console.log('Création des entreprises...');
  const companiesData = [
    { nom: 'Google France', secteur: 'Technologie', siteWeb: 'https://google.fr', notes: 'Entreprise leader en tech'},
    { nom: 'Microsoft', secteur: 'Technologie', siteWeb: 'https://microsoft.com', notes: 'Leader en cloud et logiciels' },
    { nom: 'Accenture', secteur: 'Conseil IT', siteWeb: 'https://accenture.com', notes: 'Conseil et services informatiques'},
    { nom: 'KLEYSIA', secteur: 'Assurance', siteWeb: 'https://kleysia.fr', notes: 'Banque française' }, 
    { nom: 'SNCF', secteur: 'Audit', siteWeb: 'https://transtest.com', notes: 'Transport ferroviaire' }, 
    { nom: 'Société Générale', secteur: 'Finance', siteWeb: 'https://societegenerale.fr' },
  ];

  const companies = await Promise.all(
    companiesData.map(data => prisma.entreprise.create({ data }))
  );

  const google = companies.find(c => c.nom === 'Google France')!;
  const microsoft = companies.find(c => c.nom === 'Microsoft')!;
  const accenture = companies.find(c => c.nom === 'Accenture')!;
  const kleysia = companies.find(c => c.nom === 'KLEYSIA')!;
  const sncf = companies.find(c => c.nom === 'SNCF')!;
  

  // 4. Création des Tags (Réutilisables)
  /*
  console.log('Création des tags...');
  const tagsData = await Promise.all([
    prisma.tag.create({ data: { name: 'Urgent' } }),
    prisma.tag.create({ data: { name: 'Front-end' } }),
    prisma.tag.create({ data: { name: 'Back-end' } }),
    prisma.tag.create({ data: { name: 'Finance' } }),
    prisma.tag.create({ data: { name: 'Data' } }),
  ]);
  const tagUrgent = tagsData[0];
  const tagFrontend = tagsData[1];
  const tagData = tagsData[4]; */


  // 5. Création des candidatures
  console.log('Création des candidatures...');

  // Candidatures vues sur votre dashboard (avec les dates ajustées à la capture)
  const c1 = await prisma.candidature.create({
    data: {
      userId: user1.id,
      entrepriseId: transtest.id,
      poste: 'Trans Test',
      //type: TypeContrat.stage,
      //statut: StatutCandidature.envoye,
      dateEnvoi: daysAgo(2), 
      //tags: { connect: [{ id: tagUrgent.id }] }
    },
  });
  
  const c2 = await prisma.candidature.create({
    data: {
      userId: user1.id,
      entrepriseId: kleysia.id,
      poste: 'Data scientist',
      //type: TypeContrat.alternance,
      //statut: StatutCandidature.envoye,
      dateEnvoi: daysAgo(4), 
      //tags: { connect: [{ id: tagData.id }] }
    },
  });

  // Autres cas pour la démo complète (tous les statuts)
  const c3 = await prisma.candidature.create({
    data: {
      userId: user1.id,
      entrepriseId: microsoft.id,
      poste: 'Data Engineer',
      //type: TypeContrat.cdi,
      //statut: StatutCandidature.entretien, // Statut Entretien
      dateEnvoi: daysAgo(10), 
      notes: 'Entretien technique réussi, attente du RH.',
    },
  });

  const c4 = await prisma.candidature.create({
    data: {
      userId: user1.id,
      entrepriseId: google.id,
      poste: 'Développeur Full Stack',
      //type: TypeContrat.stage,
      //statut: StatutCandidature.envoye,
      dateEnvoi: daysAgo(18), 
      //tags: { connect: [{ id: tagFrontend.id }, { id: tagUrgent.id }] }
    },
  });

  const c5 = await prisma.candidature.create({
    data: {
      userId: user1.id,
      entrepriseId: accenture.id,
      poste: 'Consultant IT',
      //type: TypeContrat.alternance,
      //statut: StatutCandidature.refus, // Statut Refus
      dateEnvoi: daysAgo(30), 
      notes: 'Refus. À archiver.',
    },
  });

  const c6 = await prisma.candidature.create({
    data: {
      userId: user1.id,
      entrepriseId: accenture.id,
      poste: 'Chef de projet',
      //type: TypeContrat.cdd,
      //statut: StatutCandidature.accepte, // Statut Accepté
      dateEnvoi: daysAgo(50), 
      notes: 'Offre signée !',
    },
  });

  console.log('Création de 6 candidatures pour la démo.');

  // 6. Création des interactions (pour tester le compteur)
  console.log('Création des interactions...');
  await Promise.all([
    prisma.interaction.create({
      data: {
        candidatureId: c3.id,
        type: 'appel',
        date: daysAgo(8),
        description: 'Premier appel de qualification RH.',
      },
    }),
    prisma.interaction.create({
      data: {
        candidatureId: c3.id,
        type: 'entretien',
        date: daysAgo(5),
        description: 'Entretien technique avec le lead dev.',
      },
    }),
    prisma.interaction.create({
      data: {
        candidatureId: c5.id,
        type: 'email',
        date: daysAgo(25),
        description: 'Email de relance envoyé.',
      },
    }),
  ]);

  console.log('--- Amorçage terminé avec succès ! ---');
  console.log(`Utilisateur de test: thiane@gmail.com / password123`);
}

main()
  .catch((e) => {
    console.error('Erreur lors de l\'amorçage de la base de données:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });