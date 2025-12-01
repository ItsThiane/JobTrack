import { useEffect, useState } from 'react';
import { candidaturesAPI, Candidature } from '../lib/api';
import { showToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

const STATUTS = ['envoye', 'entretien', 'accepte', 'refus'] as const;
const STATUT_COLORS: Record<string, string> = {
  envoye: 'bg-blue-100 border-blue-300',
  entretien: 'bg-yellow-100 border-yellow-300',
  accepte: 'bg-green-100 border-green-300',
  refus: 'bg-red-100 border-red-300',
};

const STATUT_TEXT_COLORS: Record<string, string> = {
  envoye: 'text-blue-800',
  entretien: 'text-yellow-800',
  accepte: 'text-green-800',
  refus: 'text-red-800',
};

export default function KanbanBoard() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCandidatures();
  }, []);

  const loadCandidatures = async () => {
    try {
      setLoading(true);
      const data = await candidaturesAPI.getAll();
      setCandidatures(data);
    } catch (error) {
      showToast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const getCandidaturesForStatus = (statut: string) =>
    candidatures.filter((c) => c.statut === statut);

  const handleStatusChange = async (candidature: Candidature, newStatus: string) => {
    try {
      await candidaturesAPI.update(candidature.id, { statut: newStatus });
      showToast.success(`Candidature déplacée à "${newStatus}"`);
      loadCandidatures();
    } catch (error) {
      showToast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tableau Kanban</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUTS.map((statut) => (
          <div
            key={statut}
            className={`rounded-lg p-4 min-h-96 ${STATUT_COLORS[statut]} border-2`}
          >
            <h3 className={`font-bold text-lg mb-4 capitalize ${STATUT_TEXT_COLORS[statut]}`}>
              {statut} ({getCandidaturesForStatus(statut).length})
            </h3>
            <div className="space-y-3">
              {getCandidaturesForStatus(statut).map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => navigate(`/candidatures/${cand.id}`)}
                  className="bg-white p-4 rounded border-l-4 border-indigo-500 shadow hover:shadow-lg transition cursor-pointer"
                >
                  <p className="font-semibold text-gray-900">{cand.poste}</p>
                  <p className="text-sm text-gray-600">{cand.entreprise.nom}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(cand.dateEnvoi).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {statut !== 'accepte' && statut !== 'refus' && (
                      <>
                        {statut === 'envoye' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(cand, 'entretien');
                            }}
                            className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          >
                            → Entretien
                          </button>
                        )}
                        {statut === 'entretien' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(cand, 'accepte');
                              }}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              ✓ Accepté
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(cand, 'refus');
                              }}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              ✗ Refus
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
