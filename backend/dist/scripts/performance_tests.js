import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function testPerformance() {
    console.log('Nettoyage des anciennes données de test...');
    // --- ÉTAPE DE NETTOYAGE ---
    await prisma.interaction.deleteMany({});
    await prisma.candidature.deleteMany({
        where: {
            poste: {
                startsWith: 'Test'
            }
        }
    });
    console.log('Nettoyage terminé. Début du test de performance...\n');
    console.log('Test de performance...\n');
    // Test 2 : Temps d'écriture (Séquentiel)
    console.log('\n Test d\'écriture...');
    const writeStart = Date.now();
    const inputs = 1000000;
    for (let i = 0; i < inputs; i++) {
        await prisma.candidature.create({
            data: {
                userId: 6,
                entrepriseId: 12,
                poste: `Test ${i}`,
                type: 'stage',
                statut: 'envoye',
                dateEnvoi: new Date(),
            },
        });
    }
    const writeDuration = Date.now() - writeStart;
    console.log(`Création de ${inputs} candidatures : ${writeDuration}ms`);
    console.log(`Moyenne : ${(writeDuration / inputs).toFixed(2)}ms par insertion`);
    // Test 1 : Temps de lecture (Warm-up + Séquentiel)
    const sizes = [100, 500, 1000, 5000, 10000, inputs];
    for (const size of sizes) {
        const start = Date.now();
        await prisma.candidature.findMany({
            take: size,
            include: { entreprise: true },
        });
        const duration = Date.now() - start;
        console.log(` Lecture de ${size} candidatures : ${duration}ms`);
    }
    // Test 3: L'écriture parallèle (Debit)
    console.log('\n Test d\'écriture (parallèle)...');
    const parallel_inputs = 1000;
    const writeParallelStart = Date.now();
    const promises = [];
    for (let i = 0; i < parallel_inputs; i++) {
        promises.push(prisma.candidature.create({
            data: {
                userId: 6,
                entrepriseId: 12,
                poste: `Par Test ${i}`,
                type: 'stage',
                statut: 'envoye',
                dateEnvoi: new Date(),
            },
        }));
    }
    await Promise.all(promises);
    const writeParallelDuration = Date.now() - writeParallelStart;
    console.log(`Création de ${inputs} candidatures en parallèle : ${writeParallelDuration}ms`);
    console.log(`Moyenne parallèle : ${(writeParallelDuration / parallel_inputs).toFixed(2)}ms par insertion`);
    // Test 4:Créer une Candidature ET une Interaction dans une transaction
    const transactionStart = Date.now();
    console.log('\n Test de transaction Candidature + Interaction...');
    await prisma.$transaction(async (tx) => {
        const newCandidature = await tx.candidature.create({
            data: {
                userId: 6,
                entrepriseId: 12,
                poste: 'Trans Test',
                type: 'stage',
                statut: 'envoye',
                dateEnvoi: new Date(),
            },
        });
        await tx.interaction.create({
            data: {
                candidatureId: newCandidature.id,
                type: 'email',
                date: new Date(),
            }
        });
    });
    const transactionDuration = Date.now() - transactionStart;
    console.log(`Création Candidature + Interaction (transaction) : ${transactionDuration}ms`);
}
testPerformance()
    .then(() => prisma.$disconnect())
    .catch(console.error);
