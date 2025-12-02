import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { candidaturesAPI, Candidature } from '../lib/api';
import { showToast } from '../utils/toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building,
  Calendar,
  FileText,
  MessageSquare,
  Plus,
  ExternalLink,
  Briefcase,
  Clock,
  Tag as TagIcon,
} from 'lucide-react';
import { tagsStorage } from '../utils/tagsStorage';

export default function CandidatureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidature, setCandidature] = useState<Candidature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [tags, setTags] = useState<any[]>([]);

  const [interactionForm, setInteractionForm] = useState({
    type: 'email',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    loadCandidature();
  }, [id]);

  const loadCandidature = async () => {
    try {
      const data = await candidaturesAPI.getOne(parseInt(id!));
      setCandidature(data);
      const savedTags = tagsStorage.getTagsForCandidature(parseInt(id!));
      setTags(savedTags);
    } catch (error) {
      console.error('Erreur chargement candidature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await candidaturesAPI.delete(parseInt(id!));
      showToast.success('Candidature supprimée avec succès');
      setShowDeleteConfirm(false);
      navigate('/dashboard');
    } catch (error) {
      showToast.error('Erreur lors de la suppression');
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await candidaturesAPI.addInteraction(parseInt(id!), interactionForm);
      showToast.success('Interaction ajoutée avec succès');
      setShowInteractionForm(false);
      setInteractionForm({
        type: 'email',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      loadCandidature();
    } catch (error) {
      showToast.error('Erreur lors de l\'ajout de l\'interaction');
    }
  };

  // Réorganisé pour plus d'impact visuel et de lisibilité
  const getStatutStyle = (statut: string) => {
    switch (statut) {
      case 'envoye':
        return 'bg-blue-500/10 text-blue-800 border-blue-500';
      case 'entretien':
        return 'bg-yellow-500/10 text-yellow-800 border-yellow-500';
      case 'accepte':
        return 'bg-green-500/10 text-green-800 border-green-500';
      case 'refus':
        return 'bg-red-500/10 text-red-800 border-red-500';
      default:
        return 'bg-gray-500/10 text-gray-800 border-gray-500';
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'appel':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'entretien':
        return <Briefcase className="w-5 h-5 text-yellow-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-xl text-gray-700">Candidature non trouvée</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Rendu plus impactant avec une couleur d'accentuation */}
      <header className="bg-white border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux candidatures
          </button>
          
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                {candidature.poste}
              </h1>
              <p className="text-xl text-gray-600 mt-1 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-500" />
                {candidature.entreprise.nom}
              </p>
            </div>
            {/* Boutons d'action en haut à droite */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/candidatures/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-md hover:shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar - Colonne droite pour les infos rapides */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Statut - Grand et en évidence */}
            <div className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${getStatutStyle(candidature.statut)}`}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Statut Actuel
              </h3>
              <span
                className={`block text-2xl font-bold capitalize ${getStatutStyle(
                  candidature.statut
                ).split(' ')[1]}`} // Récupère la classe text-color
              >
                {candidature.statut}
              </span>
            </div>

            {/* Type de contrat */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Type de Contrat
              </h3>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {candidature.type}
              </p>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Documents
              </h3>
              <div className="space-y-3">
                {candidature.cvUrl ? (
                  <a
                    href={candidature.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition group"
                  >
                    <span className="text-gray-700 font-medium">Curriculum Vitae (CV)</span>
                    <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
                  </a>
                ) : (
                  <p className="text-gray-400 text-sm p-3 bg-gray-50 rounded-lg">Aucun CV ajouté</p>
                )}
                {candidature.lettreUrl ? (
                  <a
                    href={candidature.lettreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition group"
                  >
                    <span className="text-gray-700 font-medium">Lettre de Motivation</span>
                    <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
                  </a>
                ) : (
                  <p className="text-gray-400 text-sm p-3 bg-gray-50 rounded-lg">
                    Aucune lettre ajoutée
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Colonne principale - Informations et Chronologie */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Informations principales - Mise en page en grille */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Détails de l'Offre
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                
                {/* Bloc Entreprise */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Building className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Entreprise / Secteur</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {candidature.entreprise.nom}
                    </p>
                    {candidature.entreprise.secteur && (
                      <p className="text-sm text-gray-600 mt-1">
                        {candidature.entreprise.secteur}
                      </p>
                    )}
                    {candidature.entreprise.siteWeb && (
                      <a
                        href={candidature.entreprise.siteWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2 font-medium"
                      >
                        Visiter le site
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bloc Date d'envoi */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date d'envoi de la candidature</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(candidature.dateEnvoi).toLocaleDateString(
                        'fr-FR',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bloc Notes, pleine largeur */}
              {candidature.notes && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-start gap-4">
                    <FileText className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Notes personnelles</p>
                      <p className="text-gray-800 whitespace-pre-wrap mt-1">
                        {candidature.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-start gap-4">
                    <TagIcon className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-sm font-medium text-gray-500 mb-3">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const colorClasses: Record<string, string> = {
                            blue: 'bg-blue-100 text-blue-800',
                            red: 'bg-red-100 text-red-800',
                            green: 'bg-green-100 text-green-800',
                            yellow: 'bg-yellow-100 text-yellow-800',
                            purple: 'bg-purple-100 text-purple-800',
                            pink: 'bg-pink-100 text-pink-800',
                          };
                          return (
                            <span
                              key={tag.id}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                colorClasses[tag.color] || colorClasses.blue
                              }`}
                            >
                              {tag.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactions - Chronologie Visuelle */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Historique des interactions
                </h2>
                <button
                  onClick={() => setShowInteractionForm(true)}
                  className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une interaction
                </button>
              </div>

              {showInteractionForm && (
                <form
                  onSubmit={handleAddInteraction}
                  className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-lg space-y-4"
                >
                  <h3 className="text-lg font-semibold text-blue-800">Nouvelle Interaction</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Type
                      </label>
                      <select
                        value={interactionForm.type}
                        onChange={(e) =>
                          setInteractionForm({
                            ...interactionForm,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      >
                        <option value="email">Email</option>
                        <option value="appel">Appel téléphonique</option>
                        <option value="entretien">Entretien / Entrevue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={interactionForm.date}
                        onChange={(e) =>
                          setInteractionForm({
                            ...interactionForm,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Description (détails importants)
                    </label>
                    <textarea
                      value={interactionForm.description}
                      onChange={(e) =>
                        setInteractionForm({
                          ...interactionForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Détails de l'interaction (sujets abordés, prochaine étape, contacts...)"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Enregistrer l'Interaction
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInteractionForm(false)}
                      className="px-5 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {candidature.interactions && candidature.interactions.length > 0 ? (
                // Style de chronologie plus visuel
                <div className="relative space-y-6 pl-4 border-l-2 border-gray-200">
                  {/* Trier les interactions par date descendante pour un affichage chronologique standard (du plus récent au plus ancien) */}
                  {candidature.interactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((interaction) => (
                    <div key={interaction.id} className="relative">
                      {/* Cercle d'étape sur la ligne de temps */}
                      <div className="absolute -left-7 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center">
                        {getInteractionIcon(interaction.type)}
                      </div>

                      <div className="ml-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow transition">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-gray-800 capitalize flex items-center gap-2">
                            <span className="p-1 rounded-full bg-blue-100">
                              {getInteractionIcon(interaction.type)}
                            </span>
                            {interaction.type}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(interaction.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                          </span>
                        </div>
                        {interaction.description && (
                          <p className="text-gray-700 text-sm mt-1">
                            {interaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-xl">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  Aucune interaction enregistrée pour cette candidature.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de confirmation de suppression - Styles améliorés */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 transform transition-all scale-100 ease-out duration-300">
            <div className="text-center">
                <Trash2 className="w-10 h-10 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmer la suppression
                </h3>
                <p className="text-gray-600 mb-6">
                Êtes-vous *certain* de vouloir supprimer la candidature pour le poste **{candidature.poste}** chez **{candidature.entreprise.nom}** ? Cette action est irréversible.
                </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md hover:shadow-lg"
              >
                Oui, Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}