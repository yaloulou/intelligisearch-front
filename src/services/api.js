import axios from "axios";
import config from "@/config";
import { EventBus } from "@/eventBus";

const BASE = config.API_BASE;

// ── Request interceptor: inject access_token ──────────────────────────────
axios.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    cfg.headers = cfg.headers || {};
    cfg.headers["Authorization"] = `Bearer ${token}`;
  }
  return cfg;
});

// ── Response interceptor: handle 401 / 403 ───────────────────────────────
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("access_token");
      delete axios.defaults.headers.common["Authorization"];
      // Use dynamic import to avoid circular deps with the store
      import("@/store/index").then(({ default: store }) => {
        store.commit("auth/LOGOUT");
      });
      if (!window.location.hash.includes("/login")) {
        window.location.href = "/#/login";
      }
    } else if (status === 403) {
      EventBus.$emit("global-notification", {
        message: "Accès refusé : vous n'avez pas les droits nécessaires.",
        color: "error",
      });
    }
    return Promise.reject(error);
  }
);

const api = {
  entities: {
    // Accepte soit (queryString, size) pour backward compat, soit un objet params complet
    search: (queryOrParams, size = 20) => {
      const body = typeof queryOrParams === "object" && queryOrParams !== null
        ? queryOrParams
        : { query: queryOrParams, size };
      return axios.post(`${BASE}/api/entities/search`, body);
    },
    get: (id) =>
      axios.get(`${BASE}/api/entities/${id}`),
    create: (data) =>
      axios.post(`${BASE}/api/entities`, data),
    update: (id, data) =>
      axios.put(`${BASE}/api/entities/${id}`, data),
    delete: (id) =>
      axios.delete(`${BASE}/api/entities/${id}`),
  },

  links: {
    search: (params) =>
      axios.post(`${BASE}/api/links/search`, params),
    get: (id) =>
      axios.get(`${BASE}/api/links/${id}`),
    create: (data) =>
      axios.post(`${BASE}/api/links`, data),
    update: (id, data) =>
      axios.put(`${BASE}/api/links/${id}`, data),
    delete: (id) =>
      axios.delete(`${BASE}/api/links/${id}`),
  },

  events: {
    search: (params) =>
      axios.post(`${BASE}/api/events/search`, params),
    get: (id) =>
      axios.get(`${BASE}/api/events/${id}`),
    create: (data) =>
      axios.post(`${BASE}/api/events`, data),
    update: (id, data) =>
      axios.put(`${BASE}/api/events/${id}`, data),
    delete: (id) =>
      axios.delete(`${BASE}/api/events/${id}`),
  },

  observations: {
    search: (params) =>
      axios.post(`${BASE}/api/observations/search`, params),
    get: (id) =>
      axios.get(`${BASE}/api/observations/${id}`),
    create: (data) =>
      axios.post(`${BASE}/api/observations`, data),
    update: (id, data) =>
      axios.put(`${BASE}/api/observations/${id}`, data),
    delete: (id) =>
      axios.delete(`${BASE}/api/observations/${id}`),
  },

  intel: {
    search: (params) =>
      axios.post(`${BASE}/api/intel/search`, params),
    get: (id) =>
      axios.get(`${BASE}/api/intel/${id}`),
    create: (data) =>
      axios.post(`${BASE}/api/intel`, data),
    update: (id, data) =>
      axios.put(`${BASE}/api/intel/${id}`, data),
    delete: (id) =>
      axios.delete(`${BASE}/api/intel/${id}`),
  },

  users: {
    list: () =>
      axios.get(`${BASE}/users`),
    create: (data) =>
      axios.post(`${BASE}/users`, data),
    update: (id, data) =>
      axios.put(`${BASE}/users/${id}`, data),
    deactivate: (id) =>
      axios.patch(`${BASE}/users/${id}/desactiver`),
    changePassword: (id, data) =>
      axios.patch(`${BASE}/users/${id}/password`, data),
  },

  dashboard: {
    provinces: () =>
      axios.get(`${BASE}/api/intel-dashboard/provinces`),
    territoires: (province) =>
      axios.get(`${BASE}/api/intel-dashboard/territoires`, { params: { province } }),
    data: (params) =>
      axios.get(`${BASE}/api/intel-dashboard/data`, { params }),
  },
};

export default api;
