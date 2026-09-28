import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

export const getDashboard = () => api.get('/dashboard').then((res) => res.data)
export const getAnalytics = () => api.get('/analytics').then((res) => res.data)

export const getDonors = (search = '') => api.get('/donors', { params: { search } }).then((res) => res.data)
export const createDonor = (data) => api.post('/donors', data).then((res) => res.data)
export const updateDonor = (id, data) => api.put(`/donors/${id}`, data).then((res) => res.data)
export const deleteDonor = (id) => api.delete(`/donors/${id}`).then((res) => res.data)

export const getVolunteers = (search = '') => api.get('/volunteers', { params: { search } }).then((res) => res.data)
export const createVolunteer = (data) => api.post('/volunteers', data).then((res) => res.data)
export const updateVolunteer = (id, data) => api.put(`/volunteers/${id}`, data).then((res) => res.data)
export const deleteVolunteer = (id) => api.delete(`/volunteers/${id}`).then((res) => res.data)

export const getProjects = (search = '') => api.get('/projects', { params: { search } }).then((res) => res.data)
export const createProject = (data) => api.post('/projects', data).then((res) => res.data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then((res) => res.data)
export const deleteProject = (id) => api.delete(`/projects/${id}`).then((res) => res.data)

export const getBeneficiaries = (search = '') => api.get('/beneficiaries', { params: { search } }).then((res) => res.data)
export const createBeneficiary = (data) => api.post('/beneficiaries', data).then((res) => res.data)
export const updateBeneficiary = (id, data) => api.put(`/beneficiaries/${id}`, data).then((res) => res.data)
export const deleteBeneficiary = (id) => api.delete(`/beneficiaries/${id}`).then((res) => res.data)

export const getDonations = (search = '') => api.get('/donations', { params: { search } }).then((res) => res.data)
export const createDonation = (data) => api.post('/donations', data).then((res) => res.data)
export const updateDonation = (id, data) => api.put(`/donations/${id}`, data).then((res) => res.data)
export const deleteDonation = (id) => api.delete(`/donations/${id}`).then((res) => res.data)

export const getDonationReport = () => api.get('/reports/donations').then((res) => res.data)
