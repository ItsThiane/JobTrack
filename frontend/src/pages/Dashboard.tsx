import { useState, useEffect } from 'react';
import { candidaturesAPI, Candidature } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, BarChart3, Grid3x3, Calendar, Building2, History } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import StatsGateway from '../components/StatsGateway';
import AdvancedStats from '../components/AdvancedStats';
import AdvancedFilters from '../components/AdvancedFilters';
import CalendarView from '../components/CalendarView';
import CompanyManager from '../components/CompanyManager';
import CandidatureHistory from '../components/CandidatureHistory';
import { toast } from 'react-toastify';
import { exportCandidaturesCSV, exportCandidaturesPDF } from '../utils/exportUtils';
import { Download } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'kanban' | 'stats' | 'calendar' | 'advanced-stats'>('list');
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCandidatures, setFilteredCandidatures] = useState<Candidature[]>([]);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadCandidatures = async () => {
    try {
      setIsLoading(true);
      const data = await candidaturesAPI.getAll();
      setCandidatures(data);
      setFilteredCandidatures(data);
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidatures();
  }, []);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const importData: Record<string, string> = {};

          headers.forEach((header, index) => {
            importData[header] = values[index];
          });

          if (importData.poste && importData.entreprise && importData.type && importData.statut && importData.dateenvoi) {
            await candidaturesAPI.create({
              poste: importData.poste,
              entrepriseNom: importData.entreprise,
              type: importData.type as 'cdd' | 'cdi' | 'freelance' | 'alternance',
              statut: importData.statut as 'envoye' | 'entretien' | 'accepte' | 'refus',
              dateEnvoi: new Date(importData.dateenvoi).toISOString(),
              notes: importData.notes || '',
            });
          }
        }

        toast.success('Importation réussie!');
        loadCandidatures();
      } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
        toast.error('Erreur lors de l\'importation du CSV');
      }
    };
    reader.readAsText(file);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'envoye':
        return 'bg-blue-100 text-blue-800';
      case 'entretien':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepte':
        return 'bg-green-100 text-green-800';
      case 'refus':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec Actions */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
            <p className="text-gray-600 mt-1">Suivi de vos candidatures</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCompanyManager(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold"
            >
              <Building2 size={20} />
              Entreprises
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold"
            >
              <History size={20} />
              Historique
            </button>
            <button
              onClick={() => exportCandidaturesCSV(candidatures)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              Exporter CSV
            </button>
            <button
              onClick={() => exportCandidaturesPDF(candidatures)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
            >
              Exporter PDF
            </button>
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold cursor-pointer">
              Import CSV
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleImportCSV}
              />
            </label>
            <button
              onClick={() => navigate('/candidatures/new')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              <Plus size={20} />
              Nouvelle candidature
            </button>
          </div>
        </div>
        {/* Switcher de vue */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              view === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Briefcase size={18} />
            Liste
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              view === 'kanban'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Grid3x3 size={18} />
            Kanban
          </button>
          <button
            onClick={() => setView('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              view === 'stats'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={18} />
            Statistiques
          </button>
          <button
            onClick={() => setView('advanced-stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              view === 'advanced-stats'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={18} />
            Analyses Avancées
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              view === 'calendar'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Calendar size={18} />
            Calendrier
          </button>
        </div>
        {/* Contenu Conditionnel */}
        {view === 'list' && (
          <>
            {/* Filtres */}
            <div className="mb-6">
              <AdvancedFilters 
                candidatures={candidatures} 
                onFilter={setFilteredCandidatures}
              />
            </div>
            {/* Afficher le nombre de résultats filtrés */}
            <div className="mb-4 text-sm text-gray-600">
              Affichage de {filteredCandidatures.length} candidature(s)
            </div>
            {/* Liste Candidatures */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredCandidatures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidatures.map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => navigate(`/candidatures/${cand.id}`)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cand.poste}</h3>
                        <p className="text-sm text-gray-600">{cand.entreprise.nom}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatutColor(cand.statut)}`}>
                        {cand.statut}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Type:</strong> {cand.type}
                      </p>
                      <p>
                        <strong>Envoyée:</strong> {new Date(cand.dateEnvoi).toLocaleDateString('fr-FR')}
                      </p>
                      <p>
                        <strong>Interactions:</strong> {cand.interactions.length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Aucune candidature pour ce filtre</p>
              </div>
            )}
          </>
        )}
        {view === 'kanban' && <KanbanBoard />}
        {view === 'stats' && <StatsGateway />}
        {view === 'advanced-stats' && <AdvancedStats candidatures={candidatures} />}
        {view === 'calendar' && <CalendarView candidatures={candidatures} />}

        {/* Modal Company Manager */}
        {showCompanyManager && (
          <CompanyManager onClose={() => setShowCompanyManager(false)} />
        )}

        {/* Modal History */}
        {showHistory && (
          <CandidatureHistory candidatureId={0} onClose={() => setShowHistory(false)} />
        )}
      </main>
    </div>
  );
}