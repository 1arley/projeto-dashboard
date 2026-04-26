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

/* --------------------------------------------------------------
   Endpoints Individuais (cada bloco carrega independentemente)
   -------------------------------------------------------------- */

export const getKpis = async (params = {}) => {
    const response = await api.get('electricity/dashboard/kpis/', { params });
    return response.data;
};

export const getDemandChart = async (params = {}) => {
    const response = await api.get('electricity/dashboard/charts/demand/', { params });
    return response.data;
};

export const getClassDistribution = async (params = {}) => {
    const response = await api.get('electricity/dashboard/charts/classes/', { params });
    return response.data;
};

export const getDayDemand = async (params = {}) => {
    const response = await api.get('electricity/dashboard/charts/days/', { params });
    return response.data;
};

/* --------------------------------------------------------------
   Endpoint Agregado
   -------------------------------------------------------------- */

export const getDashboardData = async (params = {}) => {
    const response = await api.get('electricity/dashboard/', { params });
    return response.data;
};
