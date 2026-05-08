import jwt from "jsonwebtoken";
import config from "../config";

export function isAuthenticated(token) {
  if (!config.isBackend && token) return true;
  if (!token) return;
  const date = new Date().getTime() / 1000;
  const data = jwt.decode(token);
  if (!data) return;
  return date < data.exp;
}

export function getTokenPayload() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

export const AuthMixin = {
  methods: {
    isAuthenticated,
  },
};
