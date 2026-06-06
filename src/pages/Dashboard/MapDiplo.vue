<template>
  <v-container>
    <l-map style="height: 600px; width: 100%" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" />
      <l-marker
        v-for="(city, index) in worldCities"
        :key="index"
        :lat-lng="[city.lat, city.lng]"
        :icon="customIcon"
      >
        <l-popup>
          <div v-if="city.amb || city.photo_url || city.info">
            <h3>{{ city.name }}</h3>
            <p>
              <strong>Ambassadeur:</strong>
              {{ city.amb || "Information not available" }}
            </p>
            <img
              v-if="city.photo_url"
              :src="`${uploadsBase}/${city.photo_url}`"
              alt="Ambassador photo"
              style="
                width: 100px;
                height: 100px;
                margin: 10px 0;
                border-radius: 50%;
                object-fit: cover;
              "
            />
            <p>
              <strong>Information:</strong>
              {{ city.info || "No additional information" }}
            </p>
          </div>
          <div v-else>
            <h3>{{ city.name }}</h3>
            <p>No ambassador information available.</p>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </v-container>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup } from "vue2-leaflet";
import L from "leaflet";
import config from "@/config";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS

// Fix for default Leaflet marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
  },
  data() {
    return {
      zoom: 2,
      center: [20, 0], // Center of the map for a global view
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      uploadsBase: config.UPLOADS_BASE,
      worldCities: [
        {
          name: "Washington, USA",
          lat: 38.894893,
          lng: -77.036553,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "London, UK",
          lat: 51.5074,
          lng: -0.1278,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Paris, France",
          lat: 48.8566,
          lng: 2.3522,
          amb: "NGOY KASONGO EMILE",
          photo_url: "emile_ngoy.jpeg",
          info: "Les informations",
        },
        {
          name: "Tokyo, Japan",
          lat: 35.6762,
          lng: 139.6503,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Monaco, Monaco",
          lat: 43.738418,
          lng: 7.424616,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Moscow, Russia",
          lat: 55.7558,
          lng: 37.6176,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Brasilia, Brazil",
          lat: -10.333333,
          lng: -53.2,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Prétoria, South Africa",
          lat: -25.745937,
          lng: 28.187944,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Pekin, China",
          lat: 39.906217,
          lng: 116.391276,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "New Delhi, India",
          lat: 28.6139,
          lng: 77.209,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Cairo, Egypt",
          lat: 30.0444,
          lng: 31.2357,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Alger, Algérie",
          lat: 36.775361,
          lng: 3.060188,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Buenos Aires, Argentina",
          lat: -34.6037,
          lng: -58.3816,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Berlin, Germany",
          lat: 52.52,
          lng: 13.405,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Luanda, Angola",
          lat: -8.82727,
          lng: 13.243951,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Ryiad, Arabie Saoudite",
          lat: 24.638916,
          lng: 46.71601,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Bruxelles, Belgique",
          lat: 50.843671,
          lng: 4.367437,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Cotonu, Benin",
          lat: 41.784979,
          lng: 8.737946,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Gaborone, Botswana",
          lat: -24.658136,
          lng: 25.908847,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Bujumbura, Burundi",
          lat: -3.363812,
          lng: 29.367503,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Ottawa, Canada",
          lat: 45.421106,
          lng: -75.690308,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Seoul, Corée du Sud",
          lat: 37.566679,
          lng: 126.978291,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Abidjan, Côte d’Ivoire",
          lat: 5.409118,
          lng: -4.04221,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "La Havanne, Cuba",
          lat: 23.135305,
          lng: -82.358963,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Abou Dabi, Emirats Arabes Unis",
          lat: 24.453835,
          lng: 54.377401,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Madrid, Espagne",
          lat: 40.416705,
          lng: -3.703582,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Addis Abeba, Ethiopie",
          lat: 9.035829,
          lng: 38.752413,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Libreville, Gabon",
          lat: 0.390002,
          lng: 9.454001,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Accra, Ghana",
          lat: 5.55711,
          lng: -0.201238,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Athènes, Grèce",
          lat: 37.983941,
          lng: 23.728305,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Conakry, Guinée",
          lat: 9.51706,
          lng: -13.699843,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Tel Aviv, Israel",
          lat: 32.080481,
          lng: 34.780527,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Rome, Italie",
          lat: 41.894802,
          lng: 12.485338,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Nairobi, Kenya",
          lat: -1.292066,
          lng: 36.821946,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Rabat, Maroc",
          lat: 34.022405,
          lng: -6.834543,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Maputo, Mozambique",
          lat: -25.966213,
          lng: 32.56745,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Windhoek, Namibie",
          lat: -22.560881,
          lng: 17.065755,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Abuja, Nigeria",
          lat: 9.064331,
          lng: 7.489297,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "La Haye, Pays-Bas",
          lat: 52.079984,
          lng: 4.311346,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Varsovie, Pologne",
          lat: 52.231958,
          lng: 21.006725,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Lisbonne, Portugal",
          lat: 38.707751,
          lng: -9.136592,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Doha, Qatar",
          lat: 25.285633,
          lng: 51.526416,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Bangui, République Centrafricaine",
          lat: 4.390715,
          lng: 18.550913,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Brazzaville, République du Congo",
          lat: -4.269441,
          lng: 15.271226,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Prague, République Tchèque",
          lat: 50.087465,
          lng: 14.421254,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Bucarest, Roumanie",
          lat: 44.436141,
          lng: 26.10272,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Kigali, Rwanda",
          lat: -1.88596,
          lng: 30.129675,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Dakar, Sénégal",
          lat: 14.693425,
          lng: -17.447938,
          amb: "MUZUNGU CHRISTOPHE",
          photo_url: "christophe_muzungu.jpeg",
          info: "Les informations",
        },
        {
          name: "Belgrade, Serbie",
          lat: 44.817813,
          lng: 20.456897,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Khartoum, Soudan",
          lat: 15.593325,
          lng: 32.53565,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Stockholm, Suède",
          lat: 59.325117,
          lng: 18.071093,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Berne, Suisse",
          lat: 46.948474,
          lng: 7.452175,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Dar es Salaam, Tanzanie",
          lat: -6.816084,
          lng: 39.280358,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "N'Djamena, Tchad",
          lat: 16.347124,
          lng: 47.891527,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Lomé, Togo",
          lat: 6.130419,
          lng: 1.215829,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Tunis, Tunisie",
          lat: 33.843941,
          lng: 9.400138,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Ankara, Turquie",
          lat: 39.920777,
          lng: 32.854067,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Cité du Vatican, Vatican",
          lat: 41.903491,
          lng: 12.452835,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Lusaka, Zambie",
          lat: -15.416449,
          lng: 28.282153,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Harare, Zimbabwe",
          lat: -17.831773,
          lng: 31.045686,
          amb: "",
          photo_url: "",
          info: "",
        },
        {
          name: "Cotonou, Benin",
          lat: 41.784979,
          lng: 8.737946,
          amb: "",
          photo_url: "",
          info: "",
        },
      ],

      customIcon: L.icon({
        iconUrl: require("@/assets/map_pointer.png"), // Path to your custom marker image
        iconSize: [32, 32], // Adjust the size of your marker image
        iconAnchor: [16, 32], // The point of the icon which will correspond to marker's location
        popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
      }),
    };
  },
  methods: {
    onMarkerClick(city) {
      alert(`You clicked on ${city.name}`);
    },
  },
};
</script>

<style>
.v-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}
</style>
