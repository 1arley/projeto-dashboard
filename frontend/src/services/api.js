import axios from 'axios';

/* --------------------------------------------------------------
API Client
- Em desenvolvimento (Vite proxy): baseURL = /api/
- Em producao (Nginx proxy): baseURL = /api/
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

export const getKpis = async (params = {}, signal) => {
const response = await api.get('v1/electricity/dashboard/kpis/', { params, signal });
return response.data;
};

export const getDemandChart = async (params = {}, signal) => {
const response = await api.get('v1/electricity/dashboard/charts/demand/', { params, signal });
return response.data;
};

export const getClassDistribution = async (params = {}, signal) => {
const response = await api.get('v1/electricity/dashboard/charts/classes/', { params, signal });
return response.data;
};

export const getDayDemand = async (params = {}, signal) => {
const response = await api.get('v1/electricity/dashboard/charts/days/', { params, signal });
return response.data;
};
