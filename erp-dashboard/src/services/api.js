import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth Service
export const authService = {
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  }
}

// Client Service
export const clientService = {
  getAll: async () => {
    const response = await api.get('/clients')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },

  create: async (clientData) => {
    const response = await api.post('/clients', clientData)
    return response.data
  },

  update: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData)
    return response.data
  }
}

// Devis Service
export const devisService = {
  getAll: async () => {
    const response = await api.get('/devis')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/devis/${id}`)
    return response.data
  },

  create: async (devisData) => {
    const response = await api.post('/devis', devisData)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/devis/${id}/status`, null, {
      params: { status }
    })
    return response.data
  }
}

// Bon de Commande Service
export const bonCommandeService = {
  getAll: async () => {
    const response = await api.get('/bons-commande')
    return response.data
  },

  create: async (bonData) => {
    const response = await api.post('/bons-commande', bonData)
    return response.data
  }
}

// Chantier Service
export const chantierService = {
  getAll: async () => {
    const response = await api.get('/chantiers')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/chantiers/${id}`)
    return response.data
  },

  create: async (chantierData) => {
    const response = await api.post('/chantiers', chantierData)
    return response.data
  },

  update: async (id, chantierData) => {
    const response = await api.put(`/chantiers/${id}`, chantierData)
    return response.data
  }
}

// Intervention Service
export const interventionService = {
  getAll: async () => {
    const response = await api.get('/interventions')
    return response.data
  },

  create: async (interventionData) => {
    const response = await api.post('/interventions', interventionData)
    return response.data
  },

  update: async (id, interventionData) => {
    const response = await api.put(`/interventions/${id}`, interventionData)
    return response.data
  }
}

// Dashboard Service
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  }
}

export default api