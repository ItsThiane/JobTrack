import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Candidature } from '../lib/api';

interface SectorStats {
  total: number;
  accepte: number;
  refus: number;
  envoye: number;
  entretien: number;
}

interface TypeStats {
  total: number;
  accepte: number;
  refus: number;
}

interface MonthStats {
  total: number;
  accepte: number;
  entretien: number;
  refus: number;
}

export default function AdvancedStats({ candidatures }: { candidatures: Candidature[] }) {
  // Taux de réussite par secteur
  const statsBySektor = candidatures.reduce((acc: Record<string, SectorStats>, cand) => {
    const sector = cand.entreprise.secteur || 'Non spécifié';
    if (!acc[sector]) {
      acc[sector] = { total: 0, accepte: 0, refus: 0, envoye: 0, entretien: 0 };
    }
    acc[sector].total += 1;
    if (cand.statut === 'accepte') acc[sector].accepte += 1;
    else if (cand.statut === 'refus') acc[sector].refus += 1;
    else if (cand.statut === 'envoye') acc[sector].envoye += 1;
    else if (cand.statut === 'entretien') acc[sector].entretien += 1;
    return acc;
  }, {});

  const sectorTauxData = Object.entries(statsBySektor).map(([sector, stats]) => ({
    name: sector,
    tauxReussite: stats.total > 0 ? parseFloat(((stats.accepte / stats.total) * 100).toFixed(1)) : 0,
    total: stats.total,
    accepte: stats.accepte,
    refus: stats.refus,
  }));

  // Taux de réussite par type
  const statsByType = candidatures.reduce((acc: Record<string, TypeStats>, cand) => {
    const type = cand.type || 'Non spécifié';
    if (!acc[type]) {
      acc[type] = { total: 0, accepte: 0, refus: 0 };
    }
    acc[type].total += 1;
    if (cand.statut === 'accepte') acc[type].accepte += 1;
    else if (cand.statut === 'refus') acc[type].refus += 1;
    return acc;
  }, {});

  const typeTauxData = Object.entries(statsByType).map(([type, stats]) => ({
    name: type,
    tauxReussite: stats.total > 0 ? parseFloat(((stats.accepte / stats.total) * 100).toFixed(1)) : 0,
    total: stats.total,
    accepte: stats.accepte,
    refus: stats.refus,
  }));

  // Evolution temporelle (par mois)
  const evolutionByMonth = candidatures.reduce((acc: Record<string, MonthStats>, cand) => {
    const date = new Date(cand.dateEnvoi);
    const month = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { total: 0, accepte: 0, entretien: 0, refus: 0 };
    }
    acc[month].total += 1;
    if (cand.statut === 'accepte') acc[month].accepte += 1;
    else if (cand.statut === 'entretien') acc[month].entretien += 1;
    else if (cand.statut === 'refus') acc[month].refus += 1;
    return acc;
  }, {});

  const evolutionData = Object.entries(evolutionByMonth).map(([month, stats]) => ({
    month,
    ...stats,
  }));

  return (
    <div className="space-y-6">
      {/* Taux de réussite par secteur */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Taux de Réussite par Secteur</h3>
        {sectorTauxData.length > 0 ? (
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorTauxData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Taux (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="tauxReussite" fill="#10b981" name="Taux de réussite %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-600">Aucune donnée disponible</p>
        )}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectorTauxData.map((sector) => (
            <div key={sector.name} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">{sector.name}</p>
              <p className="text-sm text-gray-600">{sector.total} candidatures</p>
              <p className="text-lg font-bold text-green-600">{sector.tauxReussite}% réussite</p>
              <div className="mt-2 text-xs text-gray-600">
                <p>✅ Acceptées: {sector.accepte}</p>
                <p>❌ Refusées: {sector.refus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Taux de réussite par type */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Taux de Réussite par Type de Poste</h3>
        {typeTauxData.length > 0 ? (
          <div className="flex gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeTauxData}
                    dataKey="tauxReussite"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <div className="space-y-3">
                {typeTauxData.map((type) => (
                  <div key={type.name} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{type.name}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${type.tauxReussite}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{type.tauxReussite}% ({type.total} total)</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Aucune donnée disponible</p>
        )}
      </div>

      {/* Evolution temporelle */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Evolution des Candidatures par Mois</h3>
        {evolutionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Total" />
              <Line type="monotone" dataKey="accepte" stroke="#10b981" name="Acceptées" />
              <Line type="monotone" dataKey="entretien" stroke="#f59e0b" name="Entretiens" />
              <Line type="monotone" dataKey="refus" stroke="#ef4444" name="Refusées" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600">Aucune donnée disponible</p>
        )}
      </div>
    </div>
  );
}
