<template>
  <v-container fluid class="mt-5">
    <!-- Sélection de la province et territoire avec filtre de date -->
    <v-row>
      <!-- Sélection de la province -->
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedProvince"
          :items="provinceOptions"
          label="Sélectionnez une province"
          outlined
          dense
          @change="fetchTerritoires"
        ></v-select>
      </v-col>

      <!-- Sélection de la ville/territoire -->
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedTerritoire"
          :items="territoireOptions"
          label="Sélectionnez une ville/territoire"
          outlined
          dense
          :disabled="
            !selectedProvince || selectedProvince === 'Toutes les provinces'
          "
        ></v-select>
      </v-col>

      <!-- Plage de dates avec bouton clear -->
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
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
              outlined
              dense
              class="filter-input"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="searchDateRange"
            range
            @input="menu = false"
          ></v-date-picker>
        </v-menu>
        <v-btn icon @click="clearDate" class="clear-btn ml-2">
          <v-icon color="red">mdi-close-circle</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Button to Load Data -->
    <v-row class="my-4">
      <v-col cols="12">
        <v-btn color="primary" @click="fetchDashboardData">
          <v-icon left>mdi-database</v-icon> Charger les données
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <!-- Statistiques générales du dashboard -->
      <v-col cols="12" md="4">
        <v-card class="pa-3" outlined elevation="2" color="white">
          <v-card-title class="headline font-weight-bold">
            <v-icon large left>mdi-alert-circle</v-icon>
            Nombre total d'incidents
          </v-card-title>
          <v-card-text class="display-1 text-center text-primary">{{
            totalIncidents
          }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-3" outlined elevation="2" color="white">
          <v-card-title class="headline font-weight-bold">
            <v-icon large left color="red">mdi-skull</v-icon>
            Nombre total de morts
          </v-card-title>
          <v-card-text class="display-1 text-center text-danger">{{
            totalMorts
          }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-3" outlined elevation="2" color="white">
          <v-card-title class="headline font-weight-bold">
            <v-icon large left color="green">mdi-hospital</v-icon>
            Nombre total de blessés
          </v-card-title>
          <v-card-text class="display-1 text-center text-success">{{
            totalBlesses
          }}</v-card-text>
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
            ></apexchart>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Répartition par Nature d'incident -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <apexchart
              type="pie"
              :options="natureChartOptions"
              :series="natureChartData"
            ></apexchart>
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
            ></apexchart>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Évolution des incidents dans le temps -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <apexchart
              type="line"
              :options="timeChartOptions"
              :series="timeChartData"
            ></apexchart>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tableau récapitulatif des incidents récents -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline font-weight-bold"
            >Incidents récents</v-card-title
          >
          <v-data-table
            :headers="incidentTableHeaders"
            :items="recentIncidents"
          ></v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import VueApexCharts from "vue-apexcharts";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      totalIncidents: 0,
      totalMorts: 0,
      totalBlesses: 0,
      //provinceOptions: [],
      //selectedProvince: null,
      provinceOptions: ["Toutes les provinces"],
      selectedProvince: "Toutes les provinces",
      searchDateRange: [], // Tableau pour stocker la plage de dates (date de début et de fin)

      territoireOptions: [], // List of villes or territories within the selected province
      selectedTerritoire: null, // Holds the selected city/territory

      provinceChartOptions: {
        chart: {
          type: "bar",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
        },
        colors: ["#5e72e4", "#2dce89"],
        xaxis: {
          categories: [],
        },
        title: {
          text: "Répartition des incidents par Province (Région)",
          style: {
            fontSize: "18px",
            color: "#32325d",
          },
        },
      },
      provinceChartData: [
        {
          name: "Incidents",
          data: [],
        },
      ],
      natureChartOptions: {
        chart: {
          type: "pie",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
        },
        labels: [],
        title: {
          text: "Répartition des incidents par Nature",
          style: {
            fontSize: "18px",
            color: "#32325d",
          },
        },
      },
      natureChartData: [],
      natureDeathsChartOptions: {
        chart: {
          type: "bar",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
        },
        xaxis: {
          categories: [],
        },
        title: {
          text: "Nombre de morts/blessés par Nature d'incident",
          style: {
            fontSize: "18px",
            color: "#32325d",
          },
        },
      },
      natureDeathsChartData: [
        {
          name: "Morts",
          data: [],
        },
        {
          name: "Blessés",
          data: [],
        },
      ],
      timeChartOptions: {
        chart: {
          type: "line",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
        },
        xaxis: {
          categories: [],
        },
        title: {
          text: "Évolution des incidents dans le temps",
          style: {
            fontSize: "18px",
            color: "#32325d",
          },
        },
      },
      timeChartData: [
        {
          name: "Incidents",
          data: [],
        },
      ],
      recentIncidents: [],
      incidentTableHeaders: [
        { text: "Date", value: "date_event" },
        { text: "Province", value: "province_region" },
        { text: "Nature", value: "event" },
        /*   { text: "Morts", value: "degats_humains.nombre_morts" },
        { text: "Blessés", value: "degats_humains.nombre_blesses" }, */
        { text: "Description", value: "description" },
      ],
    };
  },

  computed: {
    formattedDateRange() {
      if (this.searchDateRange.length === 2) {
        return `${this.formatDate(this.searchDateRange[0])} - ${this.formatDate(
          this.searchDateRange[1]
        )}`;
      }
      return ""; // Si aucune plage n'est sélectionnée
    },
  },

  mounted() {
    this.fetchProvinceOptions();
    //this.fetchDashboardData();
  },
  watch: {
    selectedProvince() {
      //this.fetchDashboardData();
    },
    selectedTerritoire() {
      //this.fetchDashboardData();
    },
  },
  methods: {
    async fetchProvinceOptions() {
      try {
        const response = await axios.get(
          "http://localhost:9200/intel_v1/_search",
          {
            auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
            params: { size: 10000 },
          }
        );

        const incidents = response.data.hits.hits.map((hit) => hit._source);
        const provinces = [
          ...new Set(incidents.map((incident) => incident.province_region)),
        ];

        this.provinceOptions = ["Toutes les provinces", ...provinces];
      } catch (error) {
        console.error("Erreur lors de la récupération des provinces:", error);
      }
    },

    async fetchTerritoires() {
      try {
        if (
          this.selectedProvince &&
          this.selectedProvince !== "Toutes les provinces"
        ) {
          const response = await axios.get(
            "http://localhost:9200/intel_v1/_search",
            {
              auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
              params: {
                size: 10000,
                q: `province_region:"${this.selectedProvince}"`,
              },
            }
          );

          const incidents = response.data.hits.hits.map((hit) => hit._source);
          const territoires = [
            "Tous les territoires", // Ajoute l'option par défaut
            ...new Set(incidents.map((incident) => incident.territoire_ville)),
          ];

          this.territoireOptions = territoires;
          this.selectedTerritoire = "Tous les territoires"; // Définit par défaut "Tous les territoires"

          // Charger les données après avoir sélectionné "Tous les territoires"
          //this.fetchDashboardData();
        } else {
          this.territoireOptions = []; // Réinitialise si aucune province sélectionnée
          this.selectedTerritoire = null;
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des territoires/villes:",
          error
        );
      }
    },

    updateFormattedDateRange() {
      if (this.dateRange.length === 2) {
        const [startDate, endDate] = this.dateRange;
        this.formattedDateRange = `${this.formatDate(
          startDate
        )} - ${this.formatDate(endDate)}`;
      }
    },

    formatDate(date) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(date).toLocaleDateString("fr-CA", options);
    },

    clearDate() {
      this.searchDateRange = []; // Réinitialiser la plage de dates
    },

    async fetchDashboardData() {
      try {
        let query = null;

        if (this.selectedProvince !== "Toutes les provinces") {
          query = `province_region:"${this.selectedProvince}"`;

          // Si un territoire spécifique est sélectionné, ajoutez-le à la requête
          if (
            this.selectedTerritoire &&
            this.selectedTerritoire !== "Tous les territoires"
          ) {
            query += ` AND territoire_ville:"${this.selectedTerritoire}"`;
          }
          // Si "Tous les territoires" est sélectionné, ne filtre que par la province
        }

        if (this.searchDateRange.length === 2) {
          const [startDate, endDate] = this.searchDateRange;
          query += query
            ? ` AND date_incident:[${startDate} TO ${endDate}]`
            : `date_incident:[${startDate} TO ${endDate}]`;
        }
        const response = await axios.get(
          "http://localhost:9200/intel_v1/_search",
          {
            auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
            params: { size: 10000, q: query },
          }
        );

        const incidents = response.data.hits.hits.map((hit) => hit._source);
        this.processDashboardData(incidents);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données du dashboard:",
          error
        );
      }

      this.$nextTick(() => {
        this.provinceChartOptions = { ...this.provinceChartOptions };
        this.natureDeathsChartOptions = { ...this.natureDeathsChartOptions };
        this.natureChartOptions = { ...this.natureChartOptions };
        this.timeChartOptions = { ...this.timeChartOptions };
      });
    },
    processDashboardData(incidents) {
      this.totalIncidents = incidents.length;
      this.totalMorts = incidents.reduce(
        (sum, inc) => sum + parseInt(inc.degats_humains.morts, 10),
        0
      );
      this.totalBlesses = incidents.reduce(
        (sum, inc) => sum + parseInt(inc.degats_humains.blesses, 10),
        0
      );

      // Répartition des incidents par province
      const provinceData = this.groupBy(incidents, "province_region");
      this.provinceChartData[0].data = Object.values(provinceData).map(
        (province) => province.length
      );
      this.provinceChartOptions.xaxis.categories = Object.keys(provinceData);

      // Répartition par nature d'incident
      const natureData = this.groupBy(incidents, "event");
      this.natureChartData = Object.values(natureData).map(
        (nature) => nature.length
      );
      this.natureChartOptions.labels = Object.keys(natureData);

      // Nombre de morts/blessés par nature d'incident
      this.natureDeathsChartData[0].data = Object.values(natureData).map(
        (nature) =>
          nature.reduce(
            (sum, inc) => sum + parseInt(inc.degats_humains.morts, 10),
            0
          )
      );
      this.natureDeathsChartData[1].data = Object.values(natureData).map(
        (nature) =>
          nature.reduce(
            (sum, inc) => sum + parseInt(inc.degats_humains.blesses, 10),
            0
          )
      );
      this.natureDeathsChartOptions.xaxis.categories = Object.keys(natureData);

      // Évolution dans le temps
      const timeData = this.groupBy(incidents, "date_event");

      // Sort the time data by date to ensure chronological order
      const sortedTimeKeys = Object.keys(timeData).sort(
        (a, b) => new Date(a) - new Date(b)
      );

      this.timeChartData[0].data = sortedTimeKeys.map(
        (date) => timeData[date].length
      );
      this.timeChartOptions.xaxis.categories = sortedTimeKeys;

      // Incidents récents
      this.recentIncidents = incidents.slice(0, 10);
    },

    groupBy(array, key) {
      return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
          currentValue
        );
        return result;
      }, {});
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap");

.v-card {
  margin-bottom: 24px;
  background-color: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.v-card:hover {
  transform: scale(1.02);
}

.v-card-title {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  color: #3c3c3c;
}

.v-icon {
  color: #5e72e4;
}

.headline {
  font-size: 1.4rem;
}

.display-1 {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  color: #2dce89;
}

body {
  background-color: #e9ecef;
}
</style>
