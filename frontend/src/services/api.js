import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    timeout: 5000,
});

export const getDashboardData = async () => {
    try {
        const response = await api.get('electricity/dashboard/');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        throw error;
    }
};