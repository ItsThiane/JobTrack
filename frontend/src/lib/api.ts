import axios from "axios";

const API_URL = "http://localhost:5001/api";    

export const api = axios.create({
  baseURL: API_URL,
});

// Ajouter un intercepteur pour inclure le token d'authentification dans les requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers!["Authorization"] = `Bearer ${token}`;
  }
  return config;
});     

//Intercepteur pour gerer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne rediriger que si on reçoit un 401 ET qu'on est connecté (c'est-à-dire une session expirée)
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem("token");
      // Si on a un token, c'est une session expirée, on peut rediriger
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      // Sinon, c'est juste une tentative de connexion échouée, on laisse passer l'erreur
    }
    return Promise.reject(error);
  }
);  

//Types des données utilisateur
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  statut: string;
}

//Types des données de Entreprise
export interface Entreprise {
  id: number;
  nom: string;
  secteur?: string;
  siteWeb?: string;
}

//Types des données de Candidature
export interface Candidature {
  id: number;
  poste: string;
  type: string;
  statut: string;
  dateEnvoi: string;
  dateRelance?: string;
  cvUrl?: string;
  lettreUrl?: string;
  notes?: string;
  entreprise: Entreprise;
  interactions: Interaction[];
}

//Types des données d'Interaction
export interface Interaction {
  id: number;
  type: string;
  date: string;
  description?: string;
}

// Api Authentification
export const authAPI = {
    register: async (data: { 
        email: string; 
        password: string; 
        nom: string; 
        prenom: string; 
        statut: string;
     }) => {
        const response = await api.post("/auth/register", data);
        return response.data;
    },

    login: async (data: { email: string; password: string }) => {
        const response = await api.post("/auth/login", data);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get<User>("/auth/me");
        return response.data;
    },
};

// Api Candidatures
export const candidaturesAPI = {
    getAll: async (filters?: { statut?: string; type?: string }) => {
        const response = await api.get<Candidature[]>("/candidatures", { params: filters });
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<Candidature>(`/candidatures/${id}`);
        return response.data;
    },

    create: async (data: {
        entrepriseNom: string;
        entrepriseSecteur?: string;
        entrepriseSiteWeb?: string;
        poste: string;
        type: string;
        statut?: string;
        dateEnvoi: string;
        cvUrl?: string;
        lettreUrl?: string;
        notes?: string;
    }) => {
        const response = await api.post<Candidature>("/candidatures", data);
        return response.data;
    },

    
    update: async (
        id: number,
         data: {
            statut?: string;
            dateRelance?: string;
            notes?: string;
            poste?: string;
            type?: string;      
         }
    ) => {
        const response = await api.patch<Candidature>(`/candidatures/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/candidatures/${id}`);
        return response.data;
    },

    addInteraction: async (
        candidatureId: number,
        data: {
            type: string;
            date: string;
            description?: string;
        }
    ) => {
        const response = await api.post<Interaction>(`/candidatures/${candidatureId}/interactions`, data);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get<{
            total: number;
            byStatut: { [key: string]: number };
            byType: { [key: string]: number };
        }>("/candidatures/stats/summary");
        return response.data;
    },
}; 
