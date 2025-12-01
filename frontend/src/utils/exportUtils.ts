import { Candidature } from '../lib/api';
import jsPDF from 'jspdf';

export function exportCandidaturesCSV(candidatures: Candidature[]) {
  const headers = [
    'Poste', 'Entreprise', 'Type', 'Statut', 'Date Envoi', 'Date Relance', 'Notes'
  ];
  const rows = candidatures.map(c => [
    c.poste,
    c.entreprise?.nom || '',
    c.type,
    c.statut,
    c.dateEnvoi ? new Date(c.dateEnvoi).toLocaleDateString('fr-FR') : '',
    c.dateRelance ? new Date(c.dateRelance).toLocaleDateString('fr-FR') : '',
    c.notes || ''
  ]);
  let csv = headers.join(',') + '\n';
  csv += rows.map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'candidatures.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportCandidaturesPDF(candidatures: Candidature[]) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Liste des candidatures', 10, 10);
  let y = 20;
  candidatures.forEach((c, i) => {
    doc.setFontSize(12);
    doc.text(
      `${i + 1}. ${c.poste} chez ${c.entreprise?.nom || ''} | ${c.type} | ${c.statut}`,
      10, y
    );
    y += 8;
    doc.setFontSize(10);
    doc.text(
      `Envoyée: ${c.dateEnvoi ? new Date(c.dateEnvoi).toLocaleDateString('fr-FR') : ''} | Relance: ${c.dateRelance ? new Date(c.dateRelance).toLocaleDateString('fr-FR') : ''}`,
      12, y
    );
    y += 8;
    if (c.notes) {
      doc.text(`Notes: ${c.notes}`, 12, y);
      y += 8;
    }
    y += 2;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });
  doc.save('candidatures.pdf');
}
