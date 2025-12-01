import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, authAPI } from "../lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { 
    email: string; 
    password: string; 
    nom: string; 
    prenom: string; 
    statut: string 
}) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => { 
        //Recuperer le token de l'utilisateur depuis le localStorage au demarrage
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");    

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);
    
  const login = async (email: string, password: string) => { 
    const response = await authAPI.login({email, password});
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const register = async (data: { 
    email: string; 
    password: string; 
    nom: string; 
    prenom: string; 
    statut: string 
}) => {
    const response = await authAPI.register(data);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );            
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}       