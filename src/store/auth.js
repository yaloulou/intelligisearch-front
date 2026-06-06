import axios from "axios";
import router from "../Routes";
import config from "@/config";

const API_BASE = config.API_BASE;

export default {
  namespaced: true,
  state: {
    isFetching: false,
    errorMessage: "",
    user: null,
  },
  getters: {
    isAuthenticated: () => !!localStorage.getItem("access_token"),
    role: (state) => state.user?.role || null,
    desk: (state) => state.user?.desk || null,
    isAdmin: (state) => state.user?.role === "admin",
    isCoordinateur: (state) => state.user?.role === "coordinateur",
    canCreate: (state) => (resource) => {
      const role = state.user?.role;
      if (!role) return false;
      const matrix = {
        intel:      ["officier", "coordinateur", "admin"],
        observation:["officier", "coordinateur", "admin"],
        event:      ["analyste", "conseiller", "coordinateur", "admin"],
        relation:   ["analyste", "conseiller", "coordinateur", "admin"],
        entity:     ["analyste", "conseiller", "coordinateur", "admin"],
        user:       ["admin"],
      };
      return (matrix[resource] || []).includes(role);
    },
    canDelete: (state) => (resource) => {
      const role = state.user?.role;
      if (!role) return false;
      const matrix = {
        intel:      ["coordinateur", "admin"],
        observation:["coordinateur", "admin"],
        event:      ["coordinateur", "admin"],
        relation:   ["coordinateur", "admin"],
        user:       ["admin"],
      };
      return (matrix[resource] || []).includes(role);
    },
    canAssign: (state) =>
      state.user?.role === "coordinateur" || state.user?.role === "admin",
  },
  mutations: {
    LOGIN_FAILURE(state, payload) {
      state.isFetching = false;
      state.errorMessage = payload;
    },
    LOGIN_SUCCESS(state) {
      state.isFetching = false;
      state.errorMessage = "";
    },
    LOGIN_REQUEST(state) {
      state.isFetching = true;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    LOGOUT(state) {
      state.user = null;
      state.isFetching = false;
      state.errorMessage = "";
    },
  },
  actions: {
    async loginUser({ commit, dispatch }, creds) {
      commit("LOGIN_REQUEST");
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: creds.email,
          password: creds.password,
        });
        const token = res.data.access_token;
        localStorage.setItem("access_token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await dispatch("fetchMe");
        commit("LOGIN_SUCCESS");
        const redirect = router.currentRoute.query?.redirect || "/dashboard";
        router.push(redirect).catch(() => {});
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          (err.response?.status === 401
            ? "Identifiants invalides ou compte désactivé"
            : "Erreur de connexion");
        commit("LOGIN_FAILURE", Array.isArray(msg) ? msg.join(", ") : msg);
      }
    },
    async fetchMe({ commit }) {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        commit("SET_USER", res.data);
      } catch {
        localStorage.removeItem("access_token");
        commit("SET_USER", null);
      }
    },
    logoutUser({ commit }) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
      axios.defaults.headers.common["Authorization"] = "";
      commit("LOGOUT");
      router.push("/login").catch(() => {});
    },
    loginError({ commit }, payload) {
      commit("LOGIN_FAILURE", payload);
    },
    requestLogin({ commit }) {
      commit("LOGIN_REQUEST");
    },
    // Legacy — kept for backward compatibility
    receiveToken({ dispatch }, token) {
      if (token && token !== "token") {
        localStorage.setItem("access_token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return dispatch("fetchMe");
      }
    },
    receiveLogin() {
      router.push("/dashboard").catch(() => {});
    },
  },
};
