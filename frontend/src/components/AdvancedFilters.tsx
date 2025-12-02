import { useState } from 'react';
import { Candidature } from '../lib/api';
import { Search, Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  candidatures: Candidature[];
  onFilter: (filtered: Candidature[]) => void;
}

export default function AdvancedFilters({ candidatures, onFilter }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchText, setSearchText] = useState('');

  const sectors = Array.from(new Set(candidatures.map((c) => c.entreprise.secteur).filter(Boolean)));
  const companies = Array.from(new Set(candidatures.map((c) => c.entreprise.nom)));

  const applyFilters = () => {
    let filtered = candidatures;

    if (searchText) {
      filtered = filtered.filter(
        (c) =>
          c.poste.toLowerCase().includes(searchText.toLowerCase()) ||
          c.entreprise.nom.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((c) => new Date(c.dateEnvoi) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter((c) => new Date(c.dateEnvoi) <= toDate);
    }

    if (selectedSector) {
      filtered = filtered.filter((c) => c.entreprise.secteur === selectedSector);
    }

    if (selectedCompany) {
      filtered = filtered.filter((c) => c.entreprise.nom === selectedCompany);
    }

    onFilter(filtered);
  };

  const handleClear = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedSector('');
    setSelectedCompany('');
    setSearchText('');
    onFilter(candidatures);
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Chercher par poste, entreprise..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            onKeyUp={applyFilters}
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            isOpen
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter size={18} />
          Filtres
        </button>
        {(dateFrom || dateTo || selectedSector || selectedCompany || searchText) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition font-semibold"
          >
            <X size={18} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Panneau filtres avancés */}
      {isOpen && (
        <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre par date (de) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">À partir de</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filtre par date (à) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Jusqu'à</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filtre par secteur */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Secteur</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tous les secteurs</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par entreprise */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Entreprise</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Toutes les entreprises</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Appliquer les filtres
          </button>
        </div>
      )}
    </div>
  );
}
