import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Détection dynamique de l'IP de l'hôte pour le développement
const getBaseUrl = () => {
  // 1. Essayer de récupérer l'IP via Expo (idéal pour appareils physiques sur le même WiFi)
  const debuggerHost = Constants.expoConfig?.hostUri;
  const address = debuggerHost?.split(':')[0];
  
  if (address && address !== 'localhost' && !address.startsWith('127.')) {
    return `http://${address}:8000`;
  }

  // 2. Cas spécifiques aux émulateurs si l'IP Expo n'est pas disponible
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000'; // IP spéciale pour accéder à l'hôte depuis l'émulateur Android
  }
  
  // 3. Fallback pour iOS Simulator ou Web
  return 'http://localhost:8000';
};

const BASE_URL = getBaseUrl();
console.log('[API] Base URL configurée :', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour logger les erreurs et aider au débuggage
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[API Error] Réponse du serveur :', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API Error] Pas de réponse reçue. Vérifiez que le backend est lancé sur :', BASE_URL);
    } else {
      console.error('[API Error] Erreur de configuration :', error.message);
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (nom, mot_de_passe) => {
    // On envoie les deux formats pour être sûr de matcher ce que le backend attend
    return api.post('/auth/login', { 
      nom, 
      mot_de_passe,
      username: nom, // Format standard OAuth2/FastAPI
      password: mot_de_passe 
    });
  },
  register: async (userData) => {
    return api.post('/utilisateurs/', userData);
  },
};

export default api;
