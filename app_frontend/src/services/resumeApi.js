import { api } from './api.js';

export const uploadResume = async (data) => {
    const response = await api.post('/resume/upload', data);
    return response.data;
};

export const analyseResume = async (data) => {
    const response = await api.post('/resume/analyze', data);
    return response.data;
};

export const getResumeHistory = async () => {
    const response = await api.get('/resume/history');
    return response.data;
};

export const getAnalysisById = async (id) => {
    const response = await api.get(`/resume/history/${id}`);
    return response.data;
};

export const chatWithResume = async (data) => {
    const response = await api.post('/resume/chat', data);
    return response.data;
};

export const deleteResume = async (id) => {
    const response = await api.delete(`/resume/${id}`);
    return response.data;
};

export const getAllResumes = async () => {
    const response = await api.get('/resume/all');
    return response.data;
};