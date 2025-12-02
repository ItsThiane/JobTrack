import { useState, useEffect } from 'react';
import { History, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface HistoryEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
  changedBy: string;
}

interface CandidatureHistoryProps {
  candidatureId: number;
  onClose: () => void;
}

export default function CandidatureHistory({
  candidatureId,
  onClose,
}: CandidatureHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // Récupérer l'historique depuis localStorage (exemple)
    const stored = localStorage.getItem(`history-${candidatureId}`);
    if (stored) {
      try {
        const parsed: unknown[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const historyData: HistoryEntry[] = parsed
            .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
            .map((h) => ({
              id: String(h.id || ''),
              field: String(h.field || ''),
              oldValue: String(h.oldValue || ''),
              newValue: String(h.newValue || ''),
              changedAt: new Date(String(h.changedAt || '')),
              changedBy: String(h.changedBy || ''),
            }));
          setHistory(historyData);
        }
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, [candidatureId]);

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      statut: 'Statut',
      type: 'Type',
      poste: 'Poste',
      dateRelance: 'Date de relance',
      notes: 'Notes',
      cvUrl: 'CV',
      lettreUrl: 'Lettre de motivation',
    };
    return labels[field] || field;
  };

  const getChangeColor = (field: string) => {
    switch (field) {
      case 'statut':
        return 'bg-purple-50 border-l-4 border-purple-500';
      case 'dateRelance':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'notes':
        return 'bg-green-50 border-l-4 border-green-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <History size={24} />
            Historique des Modifications
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>Aucune modification enregistrée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history
              .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
              .map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg ${getChangeColor(entry.field)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900">
                      {getFieldLabel(entry.field)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(entry.changedAt, 'd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Avant:</span> <span className="line-through">{entry.oldValue || '—'}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Après:</span> <span className="text-green-700 font-semibold">{entry.newValue || '—'}</span>
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
