import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Ajouter un intercepteur pour inclure le token d'authentification dans les requêtes
api.interceptors.request.use((config) => {
  const rawToken = localStorage.getItem("token");
  const token = rawToken ? rawToken.trim() : null;
  if (token) {
    config.headers!["Authorization"] = `Bearer ${token}`;
  }
  // Debug: log the final request URL and method to help diagnose malformed requests
  try {
    const base = (config.baseURL as string) || "";
    const url = config.url || "";
    // Avoid logging Authorization header value
    const safeConfig = { ...config, headers: { ...(config.headers || {}) } } as any;
    if (safeConfig.headers && safeConfig.headers.Authorization) {
      safeConfig.headers = { ...safeConfig.headers, Authorization: "[REDACTED]" };
    }
    // eslint-disable-next-line no-console
    console.debug("[API Request]", config.method?.toUpperCase(), base + url, safeConfig);
  } catch (e) {
    // ignore logging errors
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
export interface Tag {
  id: string;
  label: string;
  color: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'pink';
}

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
  tags?: Tag[];
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
      const response = await api.get<any>("/candidatures", { params: filters });
      // Backend may return either an array of candidatures or a paginated object { candidatures, total, page, limit }
      if (Array.isArray(response.data)) {
        return response.data as Candidature[];
      }
      if (response.data && Array.isArray(response.data.candidatures)) {
        return response.data.candidatures as Candidature[];
      }
      // Fallback: return empty array to avoid runtime errors
      return [] as Candidature[];
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
