import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { candidaturesAPI, Candidature, Tag } from '../lib/api';
import { showToast } from '../utils/toast';
import { ArrowLeft, Save, Upload, FileTex, X } from 'lucide-react';
import TagsInput from '../components/TagsInput';
import { tagsStorage } from '../utils/tagsStorage';

export default function CandidatureForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    entrepriseNom: '',
    entrepriseSecteur: '',
    entrepriseSiteWeb: '',
    poste: '',
    type: 'stage',
    statut: 'envoye',
    dateEnvoi: new Date().toISOString().split('T')[0],
    notes: '',
    cvUrl: '',
    lettreUrl: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [lettreFile, setLettreFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingLettre, setUploadingLettre] = useState(false);
  const [loadingData, setLoadingData] = useState(false);


  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      loadCandidature();
    }
  }, [id]);

  const loadCandidature = async () => {
    try {
      const data: Candidature = await candidaturesAPI.getOne(parseInt(id!));
      setFormData({
        entrepriseNom: data.entreprise.nom,
        entrepriseSecteur: data.entreprise.secteur || '',
        entrepriseSiteWeb: data.entreprise.siteWeb || '',
        poste: data.poste,
        type: data.type,
        statut: data.statut,
        dateEnvoi: data.dateEnvoi.split('T')[0],
        notes: data.notes || '',
        cvUrl: data.cvUrl || '',
        lettreUrl: data.lettreUrl || '',
      });
      if (data.tags) {
        setTags(data.tags);
      }
    } catch (error) {
      showToast.error('Erreur lors du chargement de la candidature');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = async (file: File, type: 'cv' | 'lettre') => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', type);

    try {
      if (type === 'cv') {
        setUploadingCv(true);
      } else {
        setUploadingLettre(true);
      }

      const response = await api.post('/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = `http://localhost:5001${response.data.url}`;

      if (type === 'cv') {
        setFormData((prev) => ({ ...prev, cvUrl: fileUrl }));
        setCvFile(file);
      } else {
        setFormData((prev) => ({ ...prev, lettreUrl: fileUrl }));
        setLettreFile(file);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload du fichier');
    } finally {
      if (type === 'cv') {
        setUploadingCv(false);
      } else {
        setUploadingLettre(false);
      }
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'cv');
    }
  };

  const handleLettreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'lettre');
    }
  };

  const removeFile = (type: 'cv' | 'lettre') => {
    if (type === 'cv') {
      setFormData((prev) => ({ ...prev, cvUrl: '' }));
      setCvFile(null);
    } else {
      setFormData((prev) => ({ ...prev, lettreUrl: '' }));
      setLettreFile(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isEdit) {
        await candidaturesAPI.update(parseInt(id!), {
          poste: formData.poste,
          type: formData.type,
          statut: formData.statut,
          notes: formData.notes,
        });
        tagsStorage.saveTagsForCandidature(parseInt(id!), tags);
        showToast.success('Candidature mise à jour avec succès');
      } else {
        const response = await candidaturesAPI.create(formData);
        if (response.id) {
          tagsStorage.saveTagsForCandidature(response.id, tags);
        }
        showToast.success('Candidature créée avec succès');
      }
      navigate('/dashboard');
    } catch (err: unknown) {
        let message = 'Erreur lors de la sauvegarde';
        if (err instanceof Error && err.message) {
          message = err.message;
        } else if (typeof err === 'object' && err !== null && 'response' in err) {
          const maybeResp = (err as { response?: { data?: { error?: string } } }).response;
          if (maybeResp?.data?.error) {
            message = maybeResp.data.error;
          }
        }
        setError(message);
        showToast.error(message);
      } finally {
        setIsLoading(false);
      }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier la candidature' : 'Nouvelle candidature'}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations Entreprise */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de l'entreprise
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    name="entrepriseNom"
                    value={formData.entrepriseNom}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Ex: Google France"
                  />
                  {isEdit && (
                    <p className="text-sm text-gray-500 mt-1">
                      Le nom de l'entreprise ne peut pas être modifié
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur
                  </label>
                  <input
                    type="text"
                    name="entrepriseSecteur"
                    value={formData.entrepriseSecteur}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Ex: Technologie"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    name="entrepriseSiteWeb"
                    value={formData.entrepriseSiteWeb}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Informations Candidature */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Détails de la candidature
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intitulé du poste *
                  </label>
                  <input
                    type="text"
                    name="poste"
                    value={formData.poste}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Développeur Full Stack Junior"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contrat *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="stage">Stage</option>
                    <option value="alternance">Alternance</option>
                    <option value="cdd">CDD</option>
                    <option value="cdi">CDI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut *
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="envoye">Envoyée</option>
                    <option value="entretien">Entretien</option>
                    <option value="accepte">Acceptée</option>
                    <option value="refus">Refusée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'envoi *
                  </label>
                  <input
                    type="date"
                    name="dateEnvoi"
                    value={formData.dateEnvoi}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes / Commentaires
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ajoutez des notes sur cette candidature..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags / Catégories
                  </label>
                  <TagsInput tags={tags} onTagsChange={setTags} placeholder="Ajouter un tag (Appuyez sur Entrée)..." />
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isLoading
                  ? 'Enregistrement...'
                  : isEdit
                  ? 'Mettre à jour'
                  : 'Créer la candidature'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}