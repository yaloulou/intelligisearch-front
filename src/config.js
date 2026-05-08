const hostApi =
  process.env.NODE_ENV === "development"
    ? "http://localhost"
    : "https://sing-generator-node.herokuapp.com";
const portApi = process.env.NODE_ENV === "development" ? 8080 : "";
const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}/api`;
const redirectUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/vue-material"
    : "https://demo.flatlogic.com/vue-material";

// URL unique pour la base de données Elasticsearch (legacy, ne plus utiliser dans les composants)
const URL_BASE = process.env.VUE_APP_ELASTICSEARCH_URL || "http://41.79.235.212:9200";

// URL du backend NestJS intermédiaire
const API_BASE = process.env.VUE_APP_API_BASE || "http://localhost:3000";

export default {
  light: {
    primary: "#536dfe",
    primaryConst: "#536dfe",
    secondary: "#FF5C93",
    secondaryConst: "#FF5C93",
    error: "#FF4081",
    warning: "#FFC260",
    success: "#3CD4A0",
    successConst: "#3CD4A0",
    info: "#9013FE",
    greyBold: "#4a4a4a",
    greyBoldConst: "#4a4a4a",
    greyMedium: "#6e6e6e",
    greyTint: "#b9b9b9",
    default: "#e0e0e0",
    iconColor: "#FFFFFF59",
  },
  dark: {
    primary: "#536dfe",
    primaryConst: "#536dfe",
    secondary: "#FF5C93",
    secondaryConst: "#FF5C93",
    success: "#3CD4A0",
    successConst: "#3CD4A0",
    error: "#FF4081",
    greyMedium: "#bfbfbf",
    greyBold: "#d6d6d6",
    greyBoldConst: "#4a4a4a",
    greyTint: "#9b9b9b",
    default: "#e0e0e0",
  },
  hostApi,
  portApi,
  baseURLApi,
  redirectUrl,
  URL_BASE,
  API_BASE,
  isBackend: process.env.VUE_APP_BACKEND,
  remote: "https://sing-generator-node.herokuapp.com",
  auth: {
    email: "admin@flatlogic.com",
    password: "password",
  },
};
