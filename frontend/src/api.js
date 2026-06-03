import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // URL du backend FastAPI
});

export const login = (nom_utilisateur, mot_de_passe) => api.post('/login', null, { params: { nom_utilisateur, mot_de_passe } });
export const register = (nom_utilisateur, mot_de_passe, role, id_localite, numero_cin) => 
  api.post('/register', null, { params: { nom_utilisateur, mot_de_passe, role, id_localite, numero_cin } });
export const creerCitoyen = (data) => api.post('/citoyens/', data);
export const getCitoyen = (cin) => api.get(`/citoyens/${cin}`);
export const getProches = (cin) => api.get(`/citoyens/${cin}/proches`);
export const getActeNaissance = (cin) => api.get(`/actes/naissance/${cin}`);
export const getActeMariage = (cin) => api.get(`/actes/mariage/${cin}`);
export const getActeDeces = (cin, requester_cin) => api.get(`/actes/deces/${cin}/${requester_cin}`);
export const declarerDeces = (data, requester_cin) => api.post(`/actes/deces/declarer-par-proche?requester_cin=${requester_cin}`, data);
export const declarerMariage = (data) => api.post('/actes/mariage/declarer', data);
export const validerMariageConjoint = (id_acte, cin, action) => 
  api.post('/actes/mariage/valider', null, { params: { id_acte, cin_conjoint: cin, action } });
export const getActesAValider = () => api.get('/admin/actes/a-valider');
export const validerActeOfficiel = (id_acte) => api.post(`/admin/actes/${id_acte}/valider-officiel`);
export const rechercherCitoyen = (prefixe) => api.get(`/citoyens/recherche/${prefixe}`);

export default api;
