import { Candidature } from '../lib/api';
import { differenceInHours } from 'date-fns';

export interface Notification {
  id: string;
  type: 'entretien' | 'relance' | 'urgence';
  title: string;
  message: string;
  candidatureId: number;
  date: Date;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  static generateNotifications(candidatures: Candidature[]): Notification[] {
    const notifications: Notification[] = [];
    const now = new Date();

    candidatures.forEach((cand) => {
      // Vérifier les entretiens proches (dans les 3 prochains jours)
      cand.interactions.forEach((interaction) => {
        if (interaction.type === 'entretien') {
          const interactionDate = new Date(interaction.date);
          const hoursLeft = differenceInHours(interactionDate, now);

          if (hoursLeft > 0 && hoursLeft <= 72) {
            // Dans les 3 prochains jours
            let type: 'entretien' | 'urgence' = 'entretien';
            let title = 'Entretien prévu';

            if (hoursLeft <= 24) {
              type = 'urgence';
              title = '🚨 Entretien DEMAIN ou AUJOURD\'HUI';
            } else if (hoursLeft <= 48) {
              title = '⏰ Entretien dans 2 jours';
            }

            notifications.push({
              id: `entretien-${cand.id}-${interaction.date}`,
              type,
              title,
              message: `Entretien pour le poste de ${cand.poste} chez ${cand.entreprise.nom}`,
              candidatureId: cand.id,
              date: interactionDate,
              read: false,
              createdAt: now,
            });
          }
        }
      });

      // Vérifier les relances à faire (dans les 3 prochains jours)
      if (cand.dateRelance) {
        const relanceDate = new Date(cand.dateRelance);
        const hoursLeft = differenceInHours(relanceDate, now);

        if (hoursLeft > 0 && hoursLeft <= 72) {
          let type: 'relance' | 'urgence' = 'relance';
          let title = 'Relance à faire';

          if (hoursLeft <= 24) {
            type = 'urgence';
            title = '🚨 Relance AUJOURD\'HUI ou DEMAIN';
          } else if (hoursLeft <= 48) {
            title = '⏰ Relance à faire dans 2 jours';
          }

          notifications.push({
            id: `relance-${cand.id}-${cand.dateRelance}`,
            type,
            title,
            message: `Relance pour ${cand.poste} chez ${cand.entreprise.nom}`,
            candidatureId: cand.id,
            date: relanceDate,
            read: false,
            createdAt: now,
          });
        }
      }
    });

    return notifications;
  }

  static sendBrowserNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  static requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}
