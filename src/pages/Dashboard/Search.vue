<template>
  <v-container fluid class="search-page pa-4">

    <!-- ── Barre de filtres compacte ── -->
    <div class="filter-bar">
      <!-- Recherche textuelle -->
      <v-text-field
        v-model="searchQuery"
        placeholder="Mots-clés, description, lieu…"
        @keyup.enter="performSearch"
        outlined
        dense
        hide-details
        clearable
        prepend-inner-icon="mdi-magnify"
        class="filter-field filter-search"
      />

      <!-- Province -->
      <v-select
        v-model="searchProvince"
        :items="provinceOptions"
        label="Province"
        outlined
        dense
        hide-details
        clearable
        class="filter-field"
      />

      <!-- Événement -->
      <v-select
        v-model="searchEvent"
        :items="eventOptions"
        label="Événement"
        outlined
        dense
        hide-details
        clearable
        class="filter-field"
      />

      <!-- Plage de dates -->
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
            label="Période"
            readonly
            v-bind="attrs"
            v-on="on"
            outlined
            dense
            hide-details
            clearable
            prepend-inner-icon="mdi-calendar-range"
            class="filter-field"
            @click:clear="clearDate"
          />
        </template>
        <v-date-picker v-model="searchDateRange" range @input="menu = false" />
      </v-menu>

      <!-- Bouton -->
      <v-btn depressed class="btn-search" @click="performSearch">
        Rechercher
      </v-btn>
    </div>

    <!-- Tableau -->
    <div class="table-wrapper">
      <v-data-table
          :headers="headers"
          :items="results"
          item-key="id"
          :loading="loading"
          loading-text="Chargement des résultats..."
          no-data-text="Aucun résultat trouvé"
          class="flat-table"
        >
          <template v-slot:item.date_event="{ item }">
            <span>{{ formatDate(item.event?.date_event) }}</span>
          </template>

          <template v-slot:item.province_region="{ item }">
            <span>{{ item.location?.province_region || "-" }}</span>
          </template>

          <template v-slot:item.event_type="{ item }">
            <v-chip x-small label color="#e3f2fd" text-color="#1565c0">{{ item.event?.event_type || "-" }}</v-chip>
          </template>

          <template v-slot:item.description="{ item }">
            <span
              class="text-truncate d-inline-block"
              style="max-width: 240px"
              :title="item.event?.description"
            >{{ item.event?.description || "-" }}</span>
          </template>

          <template v-slot:item.degats="{ item }">
            <span class="degats-cell">
              <span class="degat-badge degat-mort">
                <v-icon x-small>mdi-skull</v-icon> {{ item.degats_humains?.morts ?? 0 }}
              </span>
              <span class="degat-badge degat-blesse">
                <v-icon x-small>mdi-hospital</v-icon> {{ item.degats_humains?.blesses ?? 0 }}
              </span>
              <span v-if="(item.degats_materiels?.degat_batiments ?? 0) > 0" class="degat-badge degat-batiment">
                <v-icon x-small>mdi-home-remove</v-icon> {{ item.degats_materiels?.degat_batiments ?? 0 }}
              </span>
            </span>
          </template>

          <template v-slot:item.document="{ item }">
            <v-btn x-small depressed class="btn-action" @click="viewDetails(item.id)">
              <v-icon small>mdi-file-document</v-icon>
            </v-btn>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn x-small depressed class="btn-action btn-edit" @click="editItem(item)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="900px">
      <v-card>
        <v-card-title class="headline">Modifier l'incident</v-card-title>

        <v-card-text>
          <v-form ref="editForm">
            <!-- Localisation -->
            <h5 class="mt-2 mb-2">Localisation</h5>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.location.province_region" label="Province/Région" outlined dense />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.location.territoire_ville" label="Territoire/Ville" outlined dense />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.location.secteur_chefferie_commune" label="Secteur/Chefferie/Commune" outlined dense />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.location.groupement_quartier" label="Groupement/Quartier" outlined dense />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.location.localite_village_lieuprecis" label="Localité / Lieu précis" outlined dense />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.location.pays" label="Pays" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="currentItem.location.latitude" label="Latitude" type="number" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="currentItem.location.longitude" label="Longitude" type="number" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="currentItem.location.geoprecision" label="Géoprécision" outlined dense />
              </v-col>
            </v-row>

            <!-- Événement -->
            <h5 class="mt-4 mb-2">Événement</h5>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="currentItem.event.date_event" label="Date" type="date" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="currentItem.event.event_type" label="Type d'événement" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="currentItem.event.categorie" label="Catégorie" outlined dense />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="currentItem.event.description" label="Description" outlined dense rows="3" />
              </v-col>
            </v-row>

            <!-- Acteurs -->
            <h5 class="mt-4 mb-2">Acteurs</h5>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.actors[0].nom" label="Acteur 1 — Nom" outlined dense />
                <v-text-field v-model="currentItem.actors[0].assoc" label="Acteur 1 — Association" outlined dense />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentItem.actors[1].nom" label="Acteur 2 — Nom" outlined dense />
                <v-text-field v-model="currentItem.actors[1].assoc" label="Acteur 2 — Association" outlined dense />
              </v-col>
            </v-row>

            <!-- Source -->
            <h5 class="mt-4 mb-2">Source</h5>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="currentItem.source.source_type" label="Type de source" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="currentItem.source.source_name" label="Nom de la source" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="currentItem.source.source_ref" label="Référence" outlined dense />
              </v-col>
            </v-row>

            <!-- Dégâts humains -->
            <h5 class="mt-4 mb-2">Dégâts Humains</h5>
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
            <h5 class="mt-4 mb-2">Dégâts Matériels</h5>
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
              <v-col cols="12">
                <v-textarea v-model="currentItem.degats_materiels.autres_degats" label="Autres dégâts" outlined dense rows="2" />
              </v-col>
            </v-row>
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
//import axios from "axios";
import api from "@/services/api";

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
        { text: "Type d'événement", value: "event_type" },
        { text: "Description", value: "description" },
        { text: "Dégâts", value: "degats", sortable: false },
        { text: "Document", value: "document", align: "center", sortable: false },
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
        location: {
          province_region: "",
          territoire_ville: "",
          secteur_chefferie_commune: "",
          groupement_quartier: "",
          localite_village_lieuprecis: "",
          latitude: null,
          longitude: null,
          pays: "",
          geoprecision: "",
        },
        event: {
          date_event: "",
          event_type: "",
          categorie: "",
          description: "",
        },
        actors: [
          { nom: "", role: "acteur1", assoc: "" },
          { nom: "", role: "acteur2", assoc: "" },
        ],
        source: {
          source_type: "",
          source_name: "",
          source_ref: "",
        },
        degats_humains: {
          morts: 0,
          blesses: 0,
          enleves_disparus: 0,
          expulses: 0,
        },
        degats_materiels: {
          degat_vehicules: 0,
          degat_batiments: 0,
          degat_infrastructures: 0,
          autres_degats: "",
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
        const res = await api.intel.search({
          search: this.searchQuery.trim() || undefined,
          province_region: this.searchProvince || undefined,
          event_type: this.searchEvent || undefined,
          dateFrom: (Array.isArray(this.searchDateRange) && this.searchDateRange[0]) || undefined,
          dateTo: (Array.isArray(this.searchDateRange) && this.searchDateRange[1]) || undefined,
          size: 200,
        });

        this.results = (res.data.items || []).map((item) => ({
          id: item._id || item.id,
          ...item,
        }));
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      } finally {
        this.loading = false;
      }
    },

    async loadFilterOptions() {
      try {
        const [, intelRes] = await Promise.all([
          api.dashboard.provinces(),
          api.intel.search({ size: 500 }),
        ]);
        const items = intelRes.data.items || [];
        this.provinceOptions = [...new Set(
          items.map((i) => i.location?.province_region).filter(Boolean)
        )].sort();
        this.eventOptions = [...new Set(
          items.map((i) => i.event?.event_type).filter(Boolean)
        )].sort();
      } catch (error) {
        console.error("Erreur lors du chargement des options Province/Event:", error);
      }
    },

    editItem(item) {
      const copy = JSON.parse(JSON.stringify(item));
      const empty = this.emptyItem();

      this.currentItem = {
        ...empty,
        ...copy,
        id: copy.id,
        location: { ...empty.location, ...(copy.location || {}) },
        event: { ...empty.event, ...(copy.event || {}) },
        actors: copy.actors?.length
          ? copy.actors.map((a, i) => ({ ...empty.actors[i] || {}, ...a }))
          : empty.actors,
        source: { ...empty.source, ...(copy.source || {}) },
        degats_humains: { ...empty.degats_humains, ...(copy.degats_humains || {}) },
        degats_materiels: { ...empty.degats_materiels, ...(copy.degats_materiels || {}) },
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

        await api.intel.update(id, doc);

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
/* ── Page container ────────────────────── */
.search-page {
  background: #f0f2f5;
  min-height: 100vh;
}

/* ── Filter bar ────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #dde3ec;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.filter-field {
  flex: 1 1 160px;
  min-width: 140px;
  max-width: 260px;
}

.filter-search {
  flex: 2 1 220px;
  max-width: 340px;
}

.btn-search {
  background: #1a2744 !important;
  color: #ffffff !important;
  border-radius: 0 !important;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.2px;
  text-transform: none;
  height: 40px;
  padding: 0 18px;
  flex-shrink: 0;
}

/* ── Table ────────────────────── */
.table-wrapper {
  border: 1px solid #dde3ec;
  background: #ffffff;
}

.flat-table {
  border-radius: 0 !important;
}

/* ── Dégâts badges ─────────────────── */
.degats-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.degat-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 1px 5px;
  white-space: nowrap;
}

.degat-mort     { color: #b71c1c; }
.degat-blesse   { color: #e65100; }
.degat-batiment { color: #5d4037; }

/* ── Action buttons ───────────────── */
.btn-action {
  background: #f5f7f8 !important;
  border: 1px solid #dde3ec !important;
  border-radius: 0 !important;
  min-width: 32px !important;
  width: 32px;
  height: 28px !important;
  padding: 0 !important;
}

.btn-edit {
  margin-left: 4px;
}

/* ── Responsive ──────────────────── */
@media (max-width: 960px) {
  .filter-bar { gap: 6px; padding: 10px; }
  .filter-field { flex: 1 1 100%; max-width: 100%; }
  .filter-search { flex: 1 1 100%; max-width: 100%; }
  .btn-search { width: 100%; }
}
</style>
