<template>
  <v-container fluid class="mt-5">
    <!-- Filtres -->
    <v-row>
      <!-- Province -->
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedProvince"
          :items="provinceOptions"
          label="Sélectionnez une province"
          outlined
          dense
          @change="fetchTerritoires"
        />
      </v-col>

      <!-- Territoire -->
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedTerritoire"
          :items="territoireOptions"
          label="Sélectionnez une ville/territoire"
          outlined
          dense
          :disabled="!selectedProvince || selectedProvince === ALL_PROVINCES"
        />
      </v-col>

      <!-- Dates -->
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="formattedDateRange"
              label="Plage de dates"
              readonly
              v-bind="attrs"
              v-on="on"
              outlined
              dense
              class="filter-input"
            />
          </template>

          <v-date-picker v-model="searchDateRange" range @input="menu = false" />
        </v-menu>

        <v-btn icon @click="clearDate" class="clear-btn ml-2">
          <v-icon color="red">mdi-close-circle</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Bouton -->
    <v-row class="my-4">
      <v-col cols="12">
        <v-btn color="primary" @click="fetchDashboardData">
          Charger les données
        </v-btn>
      </v-col>
    </v-row>

    <!-- KPIs -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="headline font-weight-bold">
            Nombre total d'incidents
          </v-card-title>
          <v-card-text class="display-1 text-center text-primary">{{ totalIncidents }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="headline font-weight-bold">
            Nombre total de morts
          </v-card-title>
          <v-card-text class="display-1 text-center text-danger">{{ totalMorts }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="headline font-weight-bold">
            Nombre total de blessés
          </v-card-title>
          <v-card-text class="display-1 text-center text-success">{{ totalBlesses }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Répartition par Province -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <apexchart
              type="bar"
              :options="provinceChartOptions"
              :series="provinceChartData"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Répartition par Event -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <apexchart
              type="pie"
              :options="natureChartOptions"
              :series="natureChartData"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-text>
            <apexchart
              type="bar"
              :options="natureDeathsChartOptions"
              :series="natureDeathsChartData"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Evolution temps -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <apexchart
              type="line"
              :options="timeChartOptions"
              :series="timeChartData"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Incidents récents -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline font-weight-bold">Incidents récents</v-card-title>
          <v-data-table :headers="incidentTableHeaders" :items="recentIncidents" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import VueApexCharts from "vue-apexcharts";
import config from "@/config";

// Points vers le middleware NestJS (ex: http://localhost:3000)
const API_BASE = config.API_BASE || "http://localhost:3000";

export default {
  components: { apexchart: VueApexCharts },

  data() {
    return {
      // Constantes d'UI
      ALL_PROVINCES: "Toutes les provinces",
      ALL_TERRITORIES: "Tous les territoires",

      // Filtres
      provinceOptions: ["Toutes les provinces"],
      selectedProvince: "Toutes les provinces",
      territoireOptions: ["Tous les territoires"],
      selectedTerritoire: "Tous les territoires",
      searchDateRange: [],
      menu: false,

      // KPIs
      totalIncidents: 0,
      totalMorts: 0,
      totalBlesses: 0,

      // Charts
      provinceChartOptions: {
        chart: { type: "bar", animations: { enabled: true, easing: "easeinout", speed: 800 } },
        xaxis: { categories: [] },
        title: { text: "Répartition des incidents par Province (Région)", style: { fontSize: "18px", color: "#32325d" } },
      },
      provinceChartData: [{ name: "Incidents", data: [] }],

      natureChartOptions: {
        chart: { type: "pie", animations: { enabled: true, easing: "easeinout", speed: 800 } },
        labels: [],
        title: { text: "Répartition des incidents par Événement", style: { fontSize: "18px", color: "#32325d" } },
      },
      natureChartData: [],

      natureDeathsChartOptions: {
        chart: { type: "bar", animations: { enabled: true, easing: "easeinout", speed: 800 } },
        xaxis: { categories: [] },
        title: { text: "Morts / Blessés par Événement", style: { fontSize: "18px", color: "#32325d" } },
      },
      natureDeathsChartData: [
        { name: "Morts", data: [] },
        { name: "Blessés", data: [] },
      ],

      timeChartOptions: {
        chart: { type: "line", animations: { enabled: true, easing: "easeinout", speed: 800 } },
        xaxis: { categories: [] },
        title: { text: "Évolution des incidents dans le temps", style: { fontSize: "18px", color: "#32325d" } },
      },
      timeChartData: [{ name: "Incidents", data: [] }],

      // Table
      recentIncidents: [],
      incidentTableHeaders: [
        { text: "Date", value: "date_event" },
        { text: "Province", value: "province_region" },
        { text: "Événement", value: "event" },
        { text: "Description", value: "description" },
      ],
    };
  },

  computed: {
    formattedDateRange() {
      if (Array.isArray(this.searchDateRange) && this.searchDateRange.length === 2) {
        return `${this.formatDate(this.searchDateRange[0])} - ${this.formatDate(this.searchDateRange[1])}`;
      }
      return "";
    },
  },

  mounted() {
    this.fetchProvinceOptions();
  },

  methods: {
    formatDate(date) {
      if (!date) return "-";
      try {
        const options = { year: "numeric", month: "2-digit", day: "2-digit" };
        return new Date(date).toLocaleDateString("fr-CA", options);
      } catch {
        return String(date);
      }
    },

    clearDate() {
      this.searchDateRange = [];
    },

    safeInt(v) {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    },

    calcTotalMorts(degats = {}) {
      return this.safeInt(degats.morts_civils ?? degats.morts) +
        this.safeInt(degats.morts_allies) +
        this.safeInt(degats.morts_ennemis);
    },

    calcTotalBlesses(degats = {}) {
      return this.safeInt(degats.blesses_civils ?? degats.blesses) +
        this.safeInt(degats.blesses_allies) +
        this.safeInt(degats.blesses_ennemis);
    },

    normalizeIncident(incident = {}) {
      return {
        ...incident,
        date_event: incident.event?.date_event || incident.date_event,
        province_region: incident.location?.province_region || incident.province_region,
        territoire_ville: incident.location?.territoire_ville || incident.territoire_ville,
        event: incident.event?.event_type || incident.event,
        description: incident.event?.description || incident.description,
      };
    },

    // ─── API calls via NestJS middleware ───────────────────────

    async fetchProvinceOptions() {
      try {
        const res = await axios.get(`${API_BASE}/api/intel-dashboard/provinces`);
        // API returns { provinces: string[] }
        const provinces = res.data.provinces || [];
        this.provinceOptions = [this.ALL_PROVINCES, ...provinces];
      } catch (error) {
        console.error("Erreur lors de la récupération des provinces:", error);
      }
    },

    async fetchTerritoires() {
      try {
        // Reset
        this.territoireOptions = [this.ALL_TERRITORIES];
        this.selectedTerritoire = this.ALL_TERRITORIES;

        if (!this.selectedProvince || this.selectedProvince === this.ALL_PROVINCES) return;

        const res = await axios.get(`${API_BASE}/api/intel-dashboard/territoires`, {
          params: { province: this.selectedProvince },
        });
        // API returns { territoires: string[] }
        const territoires = res.data.territoires || [];
        this.territoireOptions = [this.ALL_TERRITORIES, ...territoires];
      } catch (error) {
        console.error("Erreur lors de la récupération des territoires/villes:", error);
      }
    },

    async fetchDashboardData() {
      try {
        // Build query params for the middleware
        const params = {};

        if (this.selectedProvince && this.selectedProvince !== this.ALL_PROVINCES) {
          params.province = this.selectedProvince;
        }

        if (
          this.selectedTerritoire &&
          this.selectedTerritoire !== this.ALL_TERRITORIES &&
          this.selectedProvince !== this.ALL_PROVINCES
        ) {
          params.territoire = this.selectedTerritoire;
        }

        if (Array.isArray(this.searchDateRange) && this.searchDateRange.length === 2) {
          const [startDate, endDate] = this.searchDateRange;
          if (startDate && endDate) {
            params.dateFrom = startDate;
            params.dateTo = endDate;
          }
        }

        const res = await axios.get(`${API_BASE}/api/intel-dashboard/data`, { params });
        const incidents = res.data.incidents || res.data.items || [];

        this.processDashboardData(incidents);

        // Force refresh apex re-render
        this.$nextTick(() => {
          this.provinceChartOptions = { ...this.provinceChartOptions };
          this.natureChartOptions = { ...this.natureChartOptions };
          this.natureDeathsChartOptions = { ...this.natureDeathsChartOptions };
          this.timeChartOptions = { ...this.timeChartOptions };
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données du dashboard:", error);
      }
    },

    // ─── Data processing (unchanged) ──────────────────────────

    processDashboardData(incidents) {
      incidents = (incidents || []).map(this.normalizeIncident);
      this.totalIncidents = incidents.length;

      this.totalMorts = incidents.reduce(
        (sum, inc) => sum + this.calcTotalMorts(inc?.degats_humains),
        0
      );
      this.totalBlesses = incidents.reduce(
        (sum, inc) => sum + this.calcTotalBlesses(inc?.degats_humains),
        0
      );

      // Province chart
      const byProvince = this.groupBy(incidents, "province_region");
      this.provinceChartOptions.xaxis.categories = Object.keys(byProvince);
      this.provinceChartData[0].data = Object.values(byProvince).map((arr) => arr.length);

      // Event charts
      const byEvent = this.groupBy(incidents, "event");
      this.natureChartOptions.labels = Object.keys(byEvent);
      this.natureChartData = Object.values(byEvent).map((arr) => arr.length);

      this.natureDeathsChartOptions.xaxis.categories = Object.keys(byEvent);
      this.natureDeathsChartData[0].data = Object.values(byEvent).map((arr) =>
        arr.reduce((s, inc) => s + this.calcTotalMorts(inc?.degats_humains), 0)
      );
      this.natureDeathsChartData[1].data = Object.values(byEvent).map((arr) =>
        arr.reduce((s, inc) => s + this.calcTotalBlesses(inc?.degats_humains), 0)
      );

      // Time chart (date_event)
      const byDate = this.groupBy(incidents, "date_event");
      const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));
      this.timeChartOptions.xaxis.categories = sortedDates;
      this.timeChartData[0].data = sortedDates.map((d) => byDate[d].length);

      // Table: 10 plus récents (déjà triés desc par l'API)
      this.recentIncidents = incidents.slice(0, 10).map((inc) => ({
        ...inc,
        date_event: inc.date_event ? this.formatDate(inc.date_event) : "-",
        province_region: inc.province_region || "-",
        event: inc.event || "-",
        description: inc.description || "-",
      }));
    },

    groupBy(array, key) {
      return (array || []).reduce((result, item) => {
        const k = item?.[key] || "Non renseigné";
        (result[k] = result[k] || []).push(item);
        return result;
      }, {});
    },
  },
};
</script>

<style scoped>
.v-card {
  margin-bottom: 24px;
  background-color: #ffffff;
  border-radius: 0;
  border: 1px solid #dde3ec;
}

.v-card-title {
  font-weight: 600;
  color: #333;
}

.headline {
  font-size: 1.4rem;
}

.display-1 {
  font-weight: 600;
  font-size: 2.5rem;
  color: #2dce89;
}
</style>
