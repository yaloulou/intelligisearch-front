<template>
  <v-container>
    <!-- Barre de recherche principale -->
    <v-row class="my-2" justify="center">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="Rechercher"
          append-icon="mdi-magnify"
          @keyup.enter="performSearch"
          outlined
          dense
          placeholder="Tapez votre recherche ici..."
          class="search-bar"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Filtres supplémentaires : Province, Nature, Date + Bouton de recherche -->
    <v-row class="my-2" justify="space-between">
      <!-- Province avec bouton clear -->
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-select
          v-model="searchProvince"
          :items="provinceOptions"
          label="Province"
          outlined
          dense
          append-icon="mdi-map-marker"
          class="filter-input flex-grow-1"
        ></v-select>
        <v-btn icon @click="clearProvince" class="clear-btn ml-2">
          <v-icon color="red">mdi-close-circle</v-icon>
        </v-btn>
      </v-col>

      <!-- Event avec bouton clear -->
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-select
          v-model="searchEvent"
          :items="eventOptions"
          label="Événement"
          outlined
          dense
          append-icon="mdi-alert-circle"
          class="filter-input flex-grow-1"
        ></v-select>
        <v-btn icon @click="clearEvent" class="clear-btn ml-2">
          <v-icon color="red">mdi-close-circle</v-icon>
        </v-btn>
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

      <!-- Bouton de recherche -->
      <v-col cols="12" md="2">
        <v-btn
          @click="performSearch"
          color="primary"
          block
          class="search-button elevation-2"
        >
          <v-icon left>mdi-magnify</v-icon> Rechercher
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tableau des résultats -->
    <!-- <v-row class="my-4">
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="results"
          item-key="id"
          class="elevation-1"
          :loading="loading"
          loading-text="Chargement des résultats..."
          no-data-text="Aucun résultat trouvé"
        >
          <template v-slot:item.date_event="{ item }">
            <span>{{ formatDate(item.date_event) }}</span>
          </template>

          <template v-slot:item.province_region="{ item }">
            <span>{{ item.province_region }}</span>
          </template>

          <template v-slot:item.event="{ item }">
            <span>{{ item.event }}</span>
          </template>

          <template v-slot:item.degats_humains="{ item }">
            <span
              >Morts: {{ item.degats_humains.morts }} - Blessés:
              {{ item.degats_humains.blesses }}</span
            >
          </template>

          <template v-slot:item.document="{ item }">
            <v-btn icon @click="viewDetails(item.id)">
              <v-icon>mdi-file-document</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row> -->
    <v-row class="my-4">
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="results"
          item-key="id"
          class="elevation-1"
          :loading="loading"
          loading-text="Chargement des résultats..."
          no-data-text="Aucun résultat trouvé"
        >
          <template v-slot:item.date_event="{ item }">
            <span>{{ formatDate(item.date_event) }}</span>
          </template>

          <template v-slot:item.province_region="{ item }">
            <span>{{ item.province_region }}</span>
          </template>

          <template v-slot:item.event="{ item }">
            <span>{{ item.event }}</span>
          </template>

          <template v-slot:item.degats_humains="{ item }">
            <span
              >Morts: {{ item.degats_humains.nombre_morts }} - Blessés:
              {{ item.degats_humains.nombre_blesses }}</span
            >
          </template>

          <template v-slot:item.document="{ item }">
            <v-btn icon @click="viewDetails(item.id)">
              <v-icon>mdi-file-document</v-icon>
            </v-btn>
          </template>

          <!-- New Edit Button Column -->
          <template v-slot:item.actions="{ item }">
            <v-btn icon @click="editItem(item)">
              <v-icon color="green">mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="800px">
      <v-card>
        <v-card-title class="headline">Modifier l'incident</v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field
              v-model="currentItem.province_region"
              label="Province"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.territoire_ville"
              label="Territoire/Ville"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.date_incident"
              label="Date de l'incident"
              type="date"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.nature_incident"
              label="Nature de l'incident"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.lieu_precis"
              label="Lieu Précis"
              outlined
              dense
            ></v-text-field>
            <v-textarea
              v-model="currentItem.acteurs_impliques"
              label="Acteurs Impliqués"
              outlined
              dense
            ></v-textarea>
            <v-textarea
              v-model="currentItem.objectif_incident"
              label="Objectif de l'incident"
              outlined
              dense
            ></v-textarea>
            <v-textarea
              v-model="currentItem.methode_moyen_utilise"
              label="Méthode/Moyen Utilisé"
              outlined
              dense
            ></v-textarea>

            <!-- Section Dégâts Humains -->
            <h5>Dégâts Humains</h5>
            <v-text-field
              v-model="currentItem.degats_humains.nombre_morts"
              label="Nombre de Morts"
              type="number"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.degats_humains.nombre_blesses"
              label="Nombre de Blessés"
              type="number"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.degats_humains.nombre_disparus"
              label="Nombre de Disparus"
              type="number"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.degats_humains.nombre_expulses"
              label="Nombre d'Expulsés"
              type="number"
              outlined
              dense
            ></v-text-field>

            <!-- Section Dégâts Matériels -->
            <h5>Dégâts Matériels</h5>
            <v-text-field
              v-model="currentItem.degats_materiels.vehicules_endommages"
              label="Véhicules Endommagés"
              type="number"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.degats_materiels.batiments_endommages"
              label="Bâtiments Endommagés"
              type="number"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="currentItem.degats_materiels.infrastructures_endommagees"
              label="Infrastructures Endommagées"
              type="number"
              outlined
              dense
            ></v-text-field>
            <v-textarea
              v-model="currentItem.degats_materiels.autres_degats"
              label="Autres Dégâts"
              outlined
              dense
            ></v-textarea>

            <!-- Autres Détails de l'Incident -->
            <v-textarea
              v-model="currentItem.impact_socioeconomique"
              label="Impact Socioéconomique"
              outlined
              dense
            ></v-textarea>
            <v-textarea
              v-model="currentItem.repercussions_politiques_exterieures"
              label="Répercussions Politiques Extérieures"
              outlined
              dense
            ></v-textarea>
            <v-textarea
              v-model="currentItem.reponse_autorites"
              label="Réponse des Autorités"
              outlined
              dense
            ></v-textarea>
            <v-textarea
              v-model="currentItem.reactions_acteurs_locaux"
              label="Réactions des Acteurs Locaux"
              outlined
              dense
            ></v-textarea>
            <v-textarea
              v-model="currentItem.autres_mesures"
              label="Autres Mesures"
              outlined
              dense
            ></v-textarea>
            <v-textarea
              v-model="currentItem.description"
              label="Description de l'Incident"
              outlined
              dense
            ></v-textarea>
            <v-text-field
              v-model="currentItem.categorie"
              label="Catégorie"
              outlined
              dense
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="saveEdit"
            >Enregistrer</v-btn
          >
          <v-btn color="red darken-1" text @click="closeEditDialog"
            >Annuler</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      searchQuery: "",
      searchDateRange: [],
      searchEvent: "",
      searchProvince: "",
      results: [],
      loading: false,
      menu: false,
      provinceOptions: [],
      eventOptions: [],
      headers: [
        { text: "Date", value: "date_event" },
        { text: "Province", value: "province_region" },
        { text: "Événement", value: "event" },
        { text: "Description", value: "description" },
        { text: "Dégâts humains", value: "degats_humains" },
        { text: "Document", value: "document", align: "center" },
        { text: "Actions", value: "actions", align: "center", sortable: false },
      ],
      currentItem: {
        degats_humains: {},
        degats_materiels: {},
      },
    };
  },
  computed: {
    formattedDateRange() {
      if (this.searchDateRange.length === 2) {
        return `${this.formatDate(this.searchDateRange[0])} - ${this.formatDate(
          this.searchDateRange[1]
        )}`;
      }
      return "";
    },
  },
  methods: {
    async performSearch() {
      this.loading = true;
      try {
        let queryParts = [];

        // Full-text search query (if any)
        if (this.searchQuery) {
          queryParts.push(`${this.searchQuery}`);
        }

        // Date range filter (if selected)
        if (this.searchDateRange.length === 2) {
          const [startDate, endDate] = this.searchDateRange;
          queryParts.push(`date_event:[${startDate} TO ${endDate}]`);
        }

        // Event filter (e.g., "Expulsion")
        if (this.searchEvent) {
          queryParts.push(`event:${this.searchEvent}`);
        }

        // Province filter (e.g., "Nord-Kivu")
        if (this.searchProvince) {
          //queryParts.push(`province_region.keyword:${this.searchProvince}`);
          queryParts.push(`province_region:${this.searchProvince}`);
        }

        // Construct the final query by joining the query parts with AND
        const query = queryParts.join(" AND ");

        // Perform the search request to Elasticsearch
        const response = await axios.get(
          "http://localhost:9200/intel_v1/_search",
          {
            params: { q: query },
            auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
          }
        );

        // Map and set the search results
        this.results = response.data.hits.hits.map((hit) => ({
          id: hit._id,
          ...hit._source,
        }));
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      } finally {
        this.loading = false;
      }
    },
    saveEdit() {
      // Logic to save the edited item to the server
      axios
        .put(
          `http://localhost:9200/intel_v1/_doc/${this.currentItem.id}`,
          this.currentItem,
          {
            auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
          }
        )
        .then(() => {
          this.performSearch(); // Refresh the data after saving
          this.closeEditDialog();
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour de l'incident:", error);
        });
    },

    closeEditDialog() {
      this.editDialog = false;
      this.currentItem = { degats_humains: {}, degats_materiels: {} };
    },

    editItem(item) {
      // Deep copy the item to avoid directly modifying the table data
      this.currentItem = JSON.parse(JSON.stringify(item));
      if (!this.currentItem.degats_humains)
        this.currentItem.degats_humains = {};
      if (!this.currentItem.degats_materiels)
        this.currentItem.degats_materiels = {};
      this.editDialog = true;
    },

    async fetchProvinceOptions() {
      try {
        // Use GET request to retrieve up to 10,000 documents
        const response = await axios.get(
          "http://localhost:9200/intel_v1/_search",
          {
            auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
            params: { size: 10000 }, // Retrieve up to 10,000 documents
          }
        );

        // Map through the results and extract the '_source' field (document data)
        const incidents = response.data.hits.hits.map((hit) => hit._source);

        // Extract unique provinces from the 'province_region' field using Set
        const provinces = [
          ...new Set(
            incidents
              .map((incident) => incident.province_region)
              .filter(Boolean)
          ),
        ];

        // Set the province options, with a default "Toutes les provinces" option
        //this.provinceOptions = ["Toutes les provinces", ...provinces];
        this.provinceOptions = provinces;

        // Log the results for debugging
        console.log("Provinces retrieved:", this.provinceOptions);
      } catch (error) {
        // Log the error for debugging purposes
        console.error("Erreur lors de la récupération des provinces:", error);
      }
    },

    async fetchEventOptions() {
      try {
        // Use GET request to retrieve up to 10,000 documents
        const response = await axios.get(
          "http://localhost:9200/intel_v1/_search",
          {
            auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
            params: { size: 10000 }, // Retrieve up to 10,000 documents
          }
        );

        // Map through the results and extract the '_source' field (document data)
        const incidents = response.data.hits.hits.map((hit) => hit._source);

        // Extract unique events from the 'event' field using Set
        const events = [
          ...new Set(
            incidents.map((incident) => incident.event).filter(Boolean)
          ),
        ];

        // Set the event options, with a default "Tous les événements" option
        //this.eventOptions = ["Tous les événements", ...events];
        this.eventOptions = events;

        // Log the results for debugging
        console.log("Events retrieved:", this.eventOptions);
      } catch (error) {
        // Log the error for debugging purposes
        console.error("Erreur lors de la récupération des événements:", error);
      }
    },
    formatDate(date) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(date).toLocaleDateString(undefined, options);
    },

    clearDate() {
      this.searchDateRange = [];
    },

    clearProvince() {
      this.searchProvince = "";
    },

    clearEvent() {
      this.searchEvent = "";
    },

    viewDetails(id) {
      this.$router.push({ name: "IncidentDetails", params: { id } });
    },
  },
  mounted() {
    this.fetchProvinceOptions();
    this.fetchEventOptions();
  },
};
</script>

<style scoped>
.my-2 {
  margin-top: 8px;
  margin-bottom: 8px;
}

.filter-input {
  border-radius: 8px;
}

.search-bar {
  background-color: #f5f5f5;
  border-radius: 8px;
}

.search-button {
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.clear-btn {
  margin-top: 10px;
}
</style>
