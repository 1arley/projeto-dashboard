import axios from 'axios';

/* --------------------------------------------------------------
   API Client
   - Em desenvolvimento (Vite proxy):  baseURL = /api/
   - Em produção (Nginx proxy):       baseURL = /api/
   - Para testes standalone (fora de Docker): VITE_API_BASE_URL
   -------------------------------------------------------------- */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/';

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

export const getDashboardData = async (params = {}) => {
    const response = await api.get('electricity/dashboard/', { params });
    return response.data;
};

