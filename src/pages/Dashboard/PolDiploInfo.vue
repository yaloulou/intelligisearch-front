<template>
  <v-container fluid class="mt-5">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top right>
      {{ snackbarMessage }}
    </v-snackbar>

    <v-card class="pa-5" elevation="3">
      <v-card-title class="headline">Recherche — Entities (entities_v1)</v-card-title>
      <v-divider class="mb-4"></v-divider>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchText"
            label="Nom / téléphone / lieu / profession…"
            outlined
            clearable
            @keyup.enter="performSearch"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="entityType"
            :items="entityTypeOptions"
            label="Type"
            outlined
            clearable
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-btn color="primary" block class="mt-2" @click="performSearch" :loading="loading">
            <v-icon left>mdi-magnify</v-icon> Rechercher
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="mt-3">
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="results"
            item-key="id"
            :loading="loading"
            loading-text="Recherche en cours…"
            no-data-text="Aucun résultat"
          >
            <template v-slot:item.name="{ item }">
              <strong>{{ item.name || '—' }}</strong>
              <div class="text-caption grey--text">
                {{ item.entity_type || '—' }} • {{ item.status || '—' }}
              </div>
            </template>

            <template v-slot:item.naissance="{ item }">
              {{ formatDate(item.attributes?.naissance) }}
            </template>

            <template v-slot:item.tel="{ item }">
              {{ firstPhone(item.contacts) || '—' }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn small color="primary" @click="openDetails(item.id)">
                Voir
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      // ES CONFIG
      ES_BASE_URL: "http://41.79.235.212:9200",
      ES_INDEX: "entities_v1",
      ES_AUTH: {
        username: "elastic",
        password: "ZuCI2sJBt3M=CMph9Y47",
      },

      searchText: "",
      entityType: "person",
      entityTypeOptions: ["person", "organization", "asset", "unknown"],

      loading: false,
      results: [],

      snackbar: false,
      snackbarMessage: "",
      snackbarColor: "info",

      headers: [
        { text: "Nom", value: "name" },
        { text: "Sexe", value: "attributes.sexe" },
        { text: "Naissance", value: "naissance" },
        { text: "Lieu nais.", value: "attributes.lieu_nais" },
        { text: "Profession", value: "attributes.profession" },
        { text: "Téléphone", value: "tel" },
        { text: "Actions", value: "actions", sortable: false, align: "center" },
      ],
    };
  },
  methods: {
    showSnackbar(message, type = "info") {
      this.snackbarMessage = message;
      this.snackbarColor =
        type === "success" ? "green" : type === "error" ? "red" : "orange";
      this.snackbar = true;
    },

    formatDate(date) {
      if (!date) return "—";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
    },

    firstPhone(contacts) {
      if (!Array.isArray(contacts)) return null;
      const p = contacts.find((c) => (c?.type || "").toLowerCase() === "phone");
      return p?.value || null;
    },

    buildSearchBody() {
      const must = [];
      const filter = [];

      // Filtre entity_type si choisi
      if (this.entityType) {
        filter.push({ term: { entity_type: this.entityType } });
      }

      // Recherche texte
      const q = (this.searchText || "").trim();
      if (q) {
        // Multi-match sur champs text/keyword
        must.push({
          bool: {
            should: [
              // name text / keyword
              { match: { name: { query: q, operator: "and" } } },
              { term: { "name.keyword": q.toLowerCase() } },

              // attributes
              { term: { "attributes.lieu_nais": q.toLowerCase() } },
              { term: { "attributes.profession": q.toLowerCase() } },
              { term: { "attributes.etat_civil": q.toLowerCase() } },
              { term: { "attributes.sexe": q.toLowerCase() } },

              // nested contacts phone
              {
                nested: {
                  path: "contacts",
                  query: {
                    bool: {
                      should: [
                        { term: { "contacts.value": q } },
                        { match: { "contacts.value": q } },
                      ],
                    },
                  },
                },
              },

              // nested identifiers (ci_name etc.)
              {
                nested: {
                  path: "identifiers",
                  query: {
                    bool: {
                      should: [
                        { term: { "identifiers.id_value": q } },
                        { match: { "identifiers.id_value": q } },
                      ],
                    },
                  },
                },
              },

              // address in locations (text)
              {
                nested: {
                  path: "locations",
                  query: {
                    match: {
                      "locations.address": {
                        query: q,
                        operator: "and",
                      },
                    },
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        });
      }

      return {
        track_total_hits: true,
        size: 50,
        query: {
          bool: {
            must: must.length ? must : [{ match_all: {} }],
            filter,
          },
        },
        sort: [
          { "name.keyword": { order: "asc" } }
        ],
        _source: [
          "name",
          "entity_type",
          "status",
          "attributes",
          "contacts",
        ],
      };
    },

    async performSearch() {
      this.loading = true;
      try {
        const body = this.buildSearchBody();

        const res = await axios.post(
          `${this.ES_BASE_URL}/${this.ES_INDEX}/_search`,
          body,
          { auth: this.ES_AUTH }
        );

        const hits = res.data?.hits?.hits || [];
        this.results = hits.map((h) => ({
          id: h._id,
          ...h._source,
        }));

        this.showSnackbar(`${this.results.length} résultat(s) trouvé(s)`, "success");
      } catch (e) {
        console.error(e);
        this.showSnackbar("Erreur lors de la recherche dans entities_v1", "error");
      } finally {
        this.loading = false;
      }
    },

    openDetails(id) {
      this.$router.push({ name: "ProfileDetails", params: { id } });
    },
  },
  mounted() {
    // Charger automatiquement
    this.performSearch();
  },
};
</script>

<style scoped>
.mt-5 {
  margin-top: 40px;
}
</style>
