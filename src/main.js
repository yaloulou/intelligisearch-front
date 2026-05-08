import Vue from "vue";
import App from "./App.vue";
import router from "./Routes";
import store from "./store/index";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import config from "./config";
import "leaflet/dist/leaflet.css";
import * as VueGoogleMaps from "vue2-google-maps";
import { AuthMixin } from "./mixins/auth";

axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Bootstrap JWT token on app startup
const accessToken = localStorage.getItem("access_token");
if (accessToken) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
  store.dispatch("auth/fetchMe");
}

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyB7OXmzfQYua_1LEhRdqsoYzyJOPh9hGLg",
  },
});
Vue.mixin(AuthMixin);

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
  store,
}).$mount("#app");
