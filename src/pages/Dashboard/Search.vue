<template>
  <v-container>
    <!-- Barre de recherche principale -->
    <v-row class="my-2" justify="center">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="Rechercher"
          @keyup.enter="performSearch"
          outlined
          dense
          placeholder="Tapez votre recherche ici..."
          class="search-bar"
          clearable
        />
      </v-col>
    </v-row>

    <!-- Filtres : Province, Event, Dates + Bouton -->
    <v-row class="my-2" justify="space-between" align="center">
      <!-- Province -->
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-select
          v-model="searchProvince"
          :items="provinceOptions"
          label="Province"
          outlined
          dense
          class="filter-input flex-grow-1"
          clearable
        />
        <v-btn icon @click="clearProvince" class="clear-btn ml-2">
          <v-icon color="red">mdi-close-circle</v-icon>
        </v-btn>
      </v-col>

      <!-- Event -->
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-select
          v-model="searchEvent"
          :items="eventOptions"
          label="Événement"
          outlined
          dense
          class="filter-input flex-grow-1"
          clearable
        />
        <v-btn icon @click="clearEvent" class="clear-btn ml-2">
          <v-icon color="red">mdi-close-circle</v-icon>
        </v-btn>
      </v-col>

      <!-- Plage de dates -->
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
              clearable
              @click:clear="clearDate"
            />
          </template>

          <v-date-picker v-model="searchDateRange" range @input="menu = false" />
        </v-menu>

        <v-btn icon @click="clearDate" class="clear-btn ml-2">
          <v-icon color="red">mdi-close-circle</v-icon>
        </v-btn>
      </v-col>

      <!-- Bouton -->
      <v-col cols="12" md="2">
        <v-btn @click="performSearch" color="primary" block class="search-button">
          Rechercher
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tableau -->
    <v-row class="my-4">
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="results"
          item-key="id"
          :loading="loading"
          loading-text="Chargement des résultats..."
          no-data-text="Aucun résultat trouvé"
          class="elevation-1"
        >
          <template v-slot:item.date_event="{ item }">
            <span>{{ formatDate(item.date_event) }}</span>
          </template>

          <template v-slot:item.province_region="{ item }">
            <span>{{ item.province_region || "-" }}</span>
          </template>

          <template v-slot:item.event="{ item }">
            <span>{{ item.event || "-" }}</span>
          </template>

          <template v-slot:item.degats_humains="{ item }">
            <span>
              Morts: {{ item.degats_humains?.morts ?? 0 }} - Blessés:
              {{ item.degats_humains?.blesses ?? 0 }}
            </span>
          </template>

          <template v-slot:item.document="{ item }">
            <v-btn color="primary" @click="viewDetails(item.id)">Voir</v-btn>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn color="success" @click="editItem(item)">Modifier</v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="900px">
      <v-card>
        <v-card-title class="headline">Modifier l'incident</v-card-title>

        <v-card-text>
          <v-form ref="editForm">
            <!-- Champs ES réels -->
            <v-text-field v-model="currentItem.province_region" label="Province" outlined dense />
            <v-text-field v-model="currentItem.territoire_ville" label="Territoire/Ville" outlined dense />
            <v-text-field v-model="currentItem.groupement_quartier" label="Groupement/Quartier" outlined dense />

            <v-text-field
              v-model="currentItem.date_event"
              label="Date (date_event)"
              type="date"
              outlined
              dense
            />

            <v-text-field v-model="currentItem.event" label="Événement (event)" outlined dense />
            <v-text-field v-model="currentItem.categorie" label="Catégorie" outlined dense />

            <v-text-field v-model="currentItem.localite_village_lieuprecis" label="Localité / Lieu précis" outlined dense />
            <v-text-field v-model="currentItem.geoprecision" label="Géoprécision" outlined dense />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="currentItem.latitude" label="Latitude" type="number" outlined dense />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="currentItem.longitude" label="Longitude" type="number" outlined dense />
              </v-col>
            </v-row>

            <v-textarea v-model="currentItem.description" label="Description" outlined dense />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.acteur1" label="Acteur 1" outlined dense />
                <v-text-field v-model="currentItem.assoc_acteur1" label="Association Acteur 1" outlined dense />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.acteur2" label="Acteur 2" outlined dense />
                <v-text-field v-model="currentItem.assoc_acteur2" label="Association Acteur 2" outlined dense />
              </v-col>
            </v-row>

            <v-text-field v-model="currentItem.source" label="Source" outlined dense />
            <v-text-field v-model="currentItem.pays" label="Pays" outlined dense />

            <!-- Dégâts humains -->
            <h5 class="mt-4">Dégâts Humains</h5>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field v-model.number="currentItem.degats_humains.morts" label="Morts" type="number" outlined dense />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model.number="currentItem.degats_humains.blesses" label="Blessés" type="number" outlined dense />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model.number="currentItem.degats_humains.enleves_disparus" label="Enlevés/Disparus" type="number" outlined dense />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model.number="currentItem.degats_humains.expulses" label="Expulsés" type="number" outlined dense />
              </v-col>
            </v-row>

            <!-- Dégâts matériels -->
            <h5 class="mt-4">Dégâts Matériels</h5>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="currentItem.degats_materiels.degat_vehicules" label="Véhicules endommagés" type="number" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="currentItem.degats_materiels.degat_batiments" label="Bâtiments endommagés" type="number" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="currentItem.degats_materiels.degat_infrastructures" label="Infrastructures endommagées" type="number" outlined dense />
              </v-col>
            </v-row>

            <v-textarea v-model="currentItem.degats_materiels.autres_degats" label="Autres dégâts" outlined dense />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" text @click="saveEdit">Enregistrer</v-btn>
          <v-btn color="red darken-1" text @click="closeEditDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import config from "@/config";

const ES_URL = config.URL_BASE;
const INDEX = "intel_v1";
const AUTH = {
  username: "elastic",
  password: "ZuCI2sJBt3M=CMph9Y47",
};

export default {
  name: "Search",
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

      editDialog: false,
      currentItem: this.emptyItem(),

      headers: [
        { text: "Date", value: "date_event" },
        { text: "Province", value: "province_region" },
        { text: "Événement", value: "event" },
        { text: "Description", value: "description" },
        { text: "Dégâts humains", value: "degats_humains" },
        { text: "Document", value: "document", align: "center" },
        { text: "Actions", value: "actions", align: "center", sortable: false },
      ],
    };
  },

  computed: {
    formattedDateRange() {
      if (Array.isArray(this.searchDateRange) && this.searchDateRange.length === 2) {
        const [start, end] = this.searchDateRange;
        return `${this.formatDate(start)} - ${this.formatDate(end)}`;
      }
      return "";
    },
  },

  methods: {
    emptyItem() {
      return {
        id: null,
        acteur1: "",
        acteur2: "",
        assoc_acteur1: "",
        assoc_acteur2: "",
        categorie: "",
        date_event: "",
        description: "",
        event: "",
        geoprecision: "",
        groupement_quartier: "",
        latitude: null,
        longitude: null,
        localite_village_lieuprecis: "",
        pays: "",
        province_region: "",
        secteur_chefferie_commune: "",
        source: "",
        territoire_ville: "",
        degats_humains: {
          blesses: 0,
          enleves_disparus: 0,
          expulses: 0,
          morts: 0,
        },
        degats_materiels: {
          autres_degats: "",
          degat_batiments: 0,
          degat_infrastructures: 0,
          degat_vehicules: 0,
        },
      };
    },

    formatDate(value) {
      if (!value) return "-";
      try {
        const options = { year: "numeric", month: "2-digit", day: "2-digit" };
        return new Date(value).toLocaleDateString(undefined, options);
      } catch {
        return value;
      }
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

    async performSearch() {
      this.loading = true;

      try {
        const must = [];
        const filter = [];

        // Full text sur description (tu peux ajouter d'autres champs si tu veux)
        if (this.searchQuery && this.searchQuery.trim()) {
          must.push({
            multi_match: {
              query: this.searchQuery.trim(),
              fields: ["description"],
              type: "best_fields",
            },
          });
        }

        // Date range
        if (Array.isArray(this.searchDateRange) && this.searchDateRange.length === 2) {
          const [startDate, endDate] = this.searchDateRange;
          if (startDate && endDate) {
            filter.push({
              range: {
                date_event: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            });
          }
        }

        // Event exact (keyword)
        if (this.searchEvent) {
          filter.push({ term: { event: this.searchEvent } });
        }

        // Province exact (keyword)
        if (this.searchProvince) {
          filter.push({ term: { province_region: this.searchProvince } });
        }

        const body = {
          size: 200, // ajuste si besoin
          sort: [{ date_event: { order: "desc" } }],
          query: {
            bool: {
              must,
              filter,
            },
          },
        };

        // si aucun filtre et aucune recherche, renvoyer tout
        if (must.length === 0 && filter.length === 0) {
          body.query = { match_all: {} };
        }

        const response = await axios.post(`${ES_URL}/${INDEX}/_search`, body, {
          auth: AUTH,
        });

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

    async loadFilterOptions() {
      try {
        const body = {
          size: 0,
          aggs: {
            provinces: { terms: { field: "province_region", size: 1000 } },
            events: { terms: { field: "event", size: 1000 } },
          },
        };

        const res = await axios.post(`${ES_URL}/${INDEX}/_search`, body, {
          auth: AUTH,
        });

        this.provinceOptions = (res.data.aggregations?.provinces?.buckets || []).map((b) => b.key);
        this.eventOptions = (res.data.aggregations?.events?.buckets || []).map((b) => b.key);
      } catch (error) {
        console.error("Erreur lors du chargement des options Province/Event:", error);
      }
    },

    editItem(item) {
      // deep copy + garantie des objets imbriqués
      const copy = JSON.parse(JSON.stringify(item));

      copy.degats_humains = copy.degats_humains || {};
      copy.degats_materiels = copy.degats_materiels || {};

      this.currentItem = {
        ...this.emptyItem(),
        ...copy,
        degats_humains: {
          ...this.emptyItem().degats_humains,
          ...copy.degats_humains,
        },
        degats_materiels: {
          ...this.emptyItem().degats_materiels,
          ...copy.degats_materiels,
        },
      };

      this.editDialog = true;
    },

    closeEditDialog() {
      this.editDialog = false;
      this.currentItem = this.emptyItem();
    },

    async saveEdit() {
      try {
        const { id, ...doc } = this.currentItem;

        if (!id) {
          console.error("Impossible de sauvegarder: id manquant");
          return;
        }

        await axios.put(`${ES_URL}/${INDEX}/_doc/${id}`, doc, {
          auth: AUTH,
        });

        await this.performSearch();
        this.closeEditDialog();
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'incident:", error);
      }
    },
  },

  mounted() {
    this.loadFilterOptions();
    this.performSearch(); // charge une première liste
  },
};
</script>

<style scoped>
.my-2 {
  margin-top: 8px;
  margin-bottom: 8px;
}

.filter-input {
  border-radius: 0;
}

.search-bar {
  background-color: #ffffff;
  border-radius: 0;
}

.search-button {
  font-weight: bold;
  box-shadow: none;
}

.clear-btn {
  margin-top: 10px;
}
</style>
