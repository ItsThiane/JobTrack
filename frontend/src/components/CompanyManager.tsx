import { useState } from 'react';
import { Entreprise } from '../lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { showToast } from '../utils/toast';

interface EntrepriseFormData {
  nom: string;
  secteur: string;
  siteWeb: string;
}

export default function CompanyManager({
  onClose,
}: {
  onClose: () => void;
}) {
  const [companies, setCompanies] = useState<Entreprise[]>([]);
  const [formData, setFormData] = useState<EntrepriseFormData>({
    nom: '',
    secteur: '',
    siteWeb: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddCompany = () => {
    if (!formData.nom.trim()) {
      showToast.error('Le nom de l\'entreprise est requis');
      return;
    }

    if (editingId) {
      setCompanies(
        companies.map((c) =>
          c.id === editingId
            ? { ...c, ...formData }
            : c
        )
      );
      showToast.success('Entreprise modifiée');
      setEditingId(null);
    } else {
      const newCompany: Entreprise = {
        id: Date.now(),
        ...formData,
      };
      setCompanies([...companies, newCompany]);
      showToast.success('Entreprise ajoutée');
    }

    setFormData({ nom: '', secteur: '', siteWeb: '' });
    setShowForm(false);
  };

  const handleEdit = (company: Entreprise) => {
    setFormData({
      nom: company.nom,
      secteur: company.secteur || '',
      siteWeb: company.siteWeb || '',
    });
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      setCompanies(companies.filter((c) => c.id !== id));
      showToast.success('Entreprise supprimée');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Entreprises</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Google"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Secteur
              </label>
              <input
                type="text"
                value={formData.secteur}
                onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Technologie"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Site Web
              </label>
              <input
                type="url"
                value={formData.siteWeb}
                onChange={(e) => setFormData({ ...formData, siteWeb: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddCompany}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                {editingId ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ nom: '', secteur: '', siteWeb: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Bouton ajouter */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition mb-6"
          >
            <Plus size={20} />
            Ajouter une entreprise
          </button>
        )}

        {/* Liste des entreprises */}
        <div className="space-y-2">
          {companies.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Aucune entreprise ajoutée</p>
          ) : (
            companies.map((company) => (
              <div
                key={company.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{company.nom}</p>
                  {company.secteur && (
                    <p className="text-sm text-gray-600">{company.secteur}</p>
                  )}
                  {company.siteWeb && (
                    <a
                      href={company.siteWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {company.siteWeb}
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
