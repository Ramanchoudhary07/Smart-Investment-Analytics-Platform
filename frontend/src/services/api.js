import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    return api.post("/token", formData);
  },
  register: (userData) => api.post("/register", userData),
};

export const portfolioAPI = {
  getPortfolios: () => api.get("/portfolios"),
  createPortfolio: (data) => api.post("/portfolios", data),
  updatePortfolio: (id, data) => api.put(`/portfolios/${id}`, data),
  deletePortfolio: (id) => api.delete(`/portfolios/${id}`),

  getHoldings: (portfolioId) => api.get(`/portfolios/${portfolioId}/holdings`),
  addHolding: (portfolioId, data) =>
    api.post(`/portfolios/${portfolioId}/holdings`, data),
  updateHolding: (portfolioId, holdingId, data) =>
    api.put(`/portfolios/${portfolioId}/holdings/${holdingId}`, data),
  deleteHolding: (portfolioId, holdingId) =>
    api.delete(`/portfolios/${portfolioId}/holdings/${holdingId}`),

  getAnalytics: (portfolioId) =>
    api.get(`/portfolios/${portfolioId}/analytics`),

  addTransaction: (portfolioId, data) =>
    api.post(`/portfolios/${portfolioId}/transactions`, data),
  getTransactions: (portfolioId) =>
    api.get(`/portfolios/${portfolioId}/transactions`),
  updateTransaction: (portfolioId, transactionId, data) =>
    api.put(`/portfolios/${portfolioId}/transactions/${transactionId}`, data),
  deleteTransaction: (portfolioId, transactionId) =>
    api.delete(`/portfolios/${portfolioId}/transactions/${transactionId}`),
};

export const stockAPI = {
  getPrice: (symbol) => api.get(`/stock/${symbol}/price`),
  getPrediction: (symbol) => api.get(`/stock/${symbol}/prediction`),
  getHistorical: (symbol, days = 30) =>
    api.get(`/stock/${symbol}/historical?days=${days}`),
  searchStocks: (query) => api.get(`/stock/search?q=${query}`),
};

export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/profile", data),
  changePassword: (data) => api.put("/user/password", data),
  deleteAccount: () => api.delete("/user/account"),

  getPreferences: () => api.get("/user/preferences"),
  updatePreferences: (data) => api.put("/user/preferences", data),
};

export const riskAPI = {
  getPortfolioRisk: (portfolioId) => api.get(`/risk/portfolio/${portfolioId}`),
  getVaR: (portfolioId, confidence = 0.95, days = 1) =>
    api.get(`/risk/var/${portfolioId}?confidence=${confidence}&days=${days}`),
  getCorrelationMatrix: (portfolioId) =>
    api.get(`/risk/correlation/${portfolioId}`),
};

export default api;
