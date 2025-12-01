import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Candidature, Interaction } from '../lib/api';
import { AlertCircle, Clock } from 'lucide-react';
import { differenceInDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarEvent {
  date: Date;
  type: 'relance' | 'entretien' | 'interaction';
  title: string;
  candidatureId: number;
  daysLeft: number;
}

export default function CalendarView({ candidatures }: { candidatures: Candidature[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    generateEvents();
  }, [candidatures]);

  const generateEvents = () => {
    const allEvents: CalendarEvent[] = [];
    const now = new Date();

    candidatures.forEach((cand) => {
      // Ajouter les relances
      if (cand.dateRelance) {
        const relanceDate = new Date(cand.dateRelance);
        const daysLeft = differenceInDays(relanceDate, now);
        allEvents.push({
          date: relanceDate,
          type: 'relance',
          title: `Relance: ${cand.poste} chez ${cand.entreprise.nom}`,
          candidatureId: cand.id,
          daysLeft,
        });
      }

      // Ajouter les entretiens (interactions de type 'entretien')
      cand.interactions.forEach((interaction) => {
        if (interaction.type === 'entretien') {
          const interactionDate = new Date(interaction.date);
          const daysLeft = differenceInDays(interactionDate, now);
          allEvents.push({
            date: interactionDate,
            type: 'entretien',
            title: `Entretien: ${cand.poste} chez ${cand.entreprise.nom}`,
            candidatureId: cand.id,
            daysLeft,
          });
        }
      });
    });

    setEvents(allEvents);

    // Rappels : événements dans les 7 prochains jours
    const reminders = allEvents.filter((event) => event.daysLeft >= 0 && event.daysLeft <= 7);
    setUpcomingReminders(reminders);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div className="text-xs">
        {dayEvents.slice(0, 2).map((event, i) => (
          <div
            key={i}
            className={`px-1 py-0.5 rounded text-white text-center ${
              event.type === 'relance' ? 'bg-blue-500' : 'bg-orange-500'
            }`}
          >
            {event.type === 'relance' ? '🔔' : '📞'}
          </div>
        ))}
        {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendrier */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Calendrier des Événements</h2>
        <div className="flex justify-center">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            locale="fr-FR"
          />
        </div>
      </div>

      {/* Événements du jour sélectionné */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Événements du {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
        </h3>
        {getEventsForDate(selectedDate).length > 0 ? (
          <div className="space-y-3">
            {getEventsForDate(selectedDate).map((event, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${
                    event.type === 'relance' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {event.type === 'relance' ? 'Relance prévue' : 'Entretien'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Aucun événement prévu ce jour.</p>
        )}
      </div>

      {/* Rappels des 7 prochains jours */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
          <AlertCircle size={24} className="text-red-500" />
          Rappels (7 prochains jours)
        </h3>
        {upcomingReminders.length > 0 ? (
          <div className="space-y-3">
            {upcomingReminders.sort((a, b) => a.daysLeft - b.daysLeft).map((event, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  event.daysLeft === 0
                    ? 'bg-red-50 border-l-4 border-red-500'
                    : 'bg-yellow-50 border-l-4 border-yellow-500'
                }`}
              >
                <Clock size={20} className={event.daysLeft === 0 ? 'text-red-500' : 'text-yellow-500'} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {event.daysLeft === 0
                      ? 'Aujourd\'hui! 🚨'
                      : event.daysLeft === 1
                      ? 'Demain ⏰'
                      : `Dans ${event.daysLeft} jours`}
                  </p>
                </div>
                <div className={`text-center px-3 py-1 rounded font-semibold ${
                  event.daysLeft === 0
                    ? 'bg-red-200 text-red-800'
                    : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {event.daysLeft}j
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Aucun rappel pour les 7 prochains jours.</p>
        )}
      </div>

      {/* Compte à rebours des entretiens à venir */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Entretiens à Venir</h3>
        {events
          .filter((e) => e.type === 'entretien' && e.daysLeft > 0)
          .sort((a, b) => a.daysLeft - b.daysLeft)
          .slice(0, 3)
          .map((event, i) => (
            <div key={i} className="flex items-center justify-between mb-3 pb-3 border-b border-blue-400">
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-blue-100">{format(event.date, 'd MMMM à HH:mm', { locale: fr })}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{event.daysLeft}</div>
                <div className="text-sm text-blue-100">jours</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
