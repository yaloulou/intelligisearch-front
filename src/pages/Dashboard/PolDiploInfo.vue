<template>
  <v-container fluid class="mt-5">
    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3500" top right>
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Confirm delete -->
    <v-dialog v-model="deleteDialog" max-width="420px">
      <v-card>
        <v-card-title class="headline red--text">
          <v-icon color="red" left>mdi-alert</v-icon> Confirmer la suppression
        </v-card-title>
        <v-card-text>
          Cette action est <strong>irréversible</strong>. Supprimer
          <strong>{{ entityToDelete && entityToDelete.name }}</strong> ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" :loading="saving" @click="confirmDelete">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Search card -->
    <v-card class="pa-4 mb-4" elevation="2">
      <div class="d-flex align-center mb-3">
        <span class="text-h6">Entités</span>
        <v-spacer />
        <v-btn color="success" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon> Nouvelle entité
        </v-btn>
      </div>
      <v-divider class="mb-4" />
      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search.text"
            label="Nom / alias / identifiant…"
            outlined dense clearable hide-details
            @keyup.enter="performSearch"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="search.entity_type"
            :items="entityTypeOptions"
            label="Type"
            outlined dense clearable hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="search.status"
            :items="statusOptions"
            label="Statut"
            outlined dense clearable hide-details
          />
        </v-col>
        <v-col cols="auto" class="d-flex align-center pl-3">
          <v-switch v-model="search.watchlist" label="Watchlist" dense hide-details />
        </v-col>
        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn color="primary" block :loading="loading" @click="performSearch">
            <v-icon left>mdi-magnify</v-icon> Rechercher
          </v-btn>
        </v-col>
      </v-row>
      <div v-if="total !== null" class="mt-3 text-caption grey--text">
        {{ total }} résultat(s) trouvé(s)
      </div>
    </v-card>

    <!-- Table -->
    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="results"
        item-key="id"
        :loading="loading"
        loading-text="Recherche en cours…"
        no-data-text="Aucun résultat"
        :footer-props="{ itemsPerPageOptions: [20, 50, 100] }"
      >
        <template v-slot:item.name="{ item }">
          <strong>{{ item.name }}</strong>
          <div v-if="item.aliases && item.aliases.length" class="text-caption grey--text">
            {{ item.aliases.join(", ") }}
          </div>
        </template>
        <template v-slot:item.entity_type="{ item }">
          <v-chip x-small :color="typeColor(item.entity_type)" dark>{{ item.entity_type || "—" }}</v-chip>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip x-small :color="statusColor(item.status)" dark>{{ item.status || "—" }}</v-chip>
        </template>
        <template v-slot:item.risk="{ item }">
          <v-chip v-if="item.risk && item.risk.risk_level" x-small :color="riskColor(item.risk.risk_level)" dark>
            {{ item.risk.risk_level }}
          </v-chip>
          <span v-else class="grey--text">—</span>
        </template>
        <template v-slot:item.watchlist="{ item }">
          <v-icon v-if="item.risk && item.risk.watchlist" color="orange" small>mdi-eye</v-icon>
          <span v-else class="grey--text">—</span>
        </template>
        <template v-slot:item.tags="{ item }">
          <span v-if="!(item.tags && item.tags.length)" class="grey--text">—</span>
          <template v-else>
            <v-chip v-for="tag in item.tags.slice(0, 2)" :key="tag" x-small class="mr-1">{{ tag }}</v-chip>
            <span v-if="item.tags.length > 2" class="text-caption grey--text">+{{ item.tags.length - 2 }}</span>
          </template>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon x-small color="primary" class="mr-1" @click="openDetails(item.id)" title="Voir profil">
            <v-icon small>mdi-account-details</v-icon>
          </v-btn>
          <v-btn icon x-small color="orange darken-1" class="mr-1" @click="openEditDialog(item)" title="Modifier">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon x-small color="error" @click="askDelete(item)" title="Supprimer">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="entityDialog" max-width="900px" persistent scrollable>
      <v-card>
        <v-card-title class="headline">
          <v-icon left>{{ editingId ? "mdi-pencil" : "mdi-plus-circle" }}</v-icon>
          {{ editingId ? "Modifier l'entité" : "Créer une entité" }}
        </v-card-title>
        <v-card-text style="max-height: 72vh; overflow-y: auto;">
          <v-form ref="entityForm">
            <v-tabs v-model="activeTab" grow color="primary">
              <v-tab><v-icon left small>mdi-account-box</v-icon> Identité</v-tab>
              <v-tab>
                <v-icon left small>mdi-card-account-details</v-icon> Identifiants
                <v-badge v-if="form.identifiers.length" :content="form.identifiers.length" color="blue" class="ml-1" inline />
              </v-tab>
              <v-tab>
                <v-icon left small>mdi-phone</v-icon> Contacts
                <v-badge v-if="form.contacts.length" :content="form.contacts.length" color="blue" class="ml-1" inline />
              </v-tab>
              <v-tab>
                <v-icon left small>mdi-map-marker</v-icon> Localisations
                <v-badge v-if="form.locations.length" :content="form.locations.length" color="blue" class="ml-1" inline />
              </v-tab>
              <v-tab><v-icon left small>mdi-shield-alert</v-icon> Risque</v-tab>
              <v-tab><v-icon left small>mdi-lock</v-icon> Classification</v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
              <!-- TAB 1: Identité -->
              <v-tab-item>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <v-text-field v-model="form.name" label="Nom *" outlined dense :rules="[v => !!v || 'Le nom est requis']" />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select v-model="form.entity_type" :items="entityTypeOptions" label="Type *" outlined dense :rules="[v => !!v || 'Requis']" />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select v-model="form.status" :items="statusOptions" label="Statut" outlined dense />
                  </v-col>
                  <v-col cols="12">
                    <v-combobox v-model="form.aliases" label="Alias / noms alternatifs" outlined dense multiple chips small-chips deletable-chips hint="Appuyez sur Entrée pour valider" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-combobox v-model="form.tags" label="Tags" outlined dense multiple chips small-chips deletable-chips />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-combobox v-model="form.labels" label="Labels" outlined dense multiple chips small-chips deletable-chips />
                  </v-col>
                </v-row>

                <template v-if="form.entity_type === 'person'">
                  <v-divider class="my-3" />
                  <div class="text-subtitle-2 mb-2 primary--text"><v-icon left small color="primary">mdi-account</v-icon> Informations personnelles</div>
                  <v-row>
                    <v-col cols="12" md="3">
                      <v-select v-model="form.attributes.person.sexe" :items="['M', 'F', 'autre']" label="Sexe" outlined dense clearable />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field v-model="form.attributes.person.naissance" label="Date de naissance" type="date" outlined dense />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.attributes.person.lieu_nais" label="Lieu de naissance" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.person.etat_civil" label="État civil" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.person.profession" label="Profession" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.person.nom_pere" label="Nom du père" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.person.nom_mere" label="Nom de la mère" outlined dense />
                    </v-col>
                  </v-row>
                </template>

                <template v-if="form.entity_type === 'organisation'">
                  <v-divider class="my-3" />
                  <div class="text-subtitle-2 mb-2 primary--text"><v-icon left small color="primary">mdi-office-building</v-icon> Informations organisation</div>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.organisation.type_org" label="Type d'organisation" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.organisation.secteur_activite" label="Secteur d'activité" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.organisation.pays_enregistrement" label="Pays d'enregistrement" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.organisation.date_creation" label="Date de création" type="date" outlined dense />
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-text-field v-model="form.attributes.organisation.parent_entity_id" label="Entité parente (ID)" outlined dense />
                    </v-col>
                  </v-row>
                </template>

                <template v-if="form.entity_type === 'lieu'">
                  <v-divider class="my-3" />
                  <div class="text-subtitle-2 mb-2 primary--text"><v-icon left small color="primary">mdi-map</v-icon> Informations lieu</div>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.lieu.type_lieu" label="Type de lieu" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.lieu.province" label="Province" outlined dense />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.attributes.lieu.territoire" label="Territoire" outlined dense />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field v-model.number="form.attributes.lieu.geo_lat" label="Latitude" type="number" outlined dense />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field v-model.number="form.attributes.lieu.geo_lon" label="Longitude" type="number" outlined dense />
                    </v-col>
                  </v-row>
                </template>
              </v-tab-item>

              <!-- TAB 2: Identifiants -->
              <v-tab-item>
                <div class="d-flex justify-space-between align-center my-3">
                  <div class="text-subtitle-2">Documents d'identité</div>
                  <v-btn small color="primary" outlined @click="addIdentifier"><v-icon left small>mdi-plus</v-icon> Ajouter</v-btn>
                </div>
                <v-simple-table v-if="form.identifiers.length" dense>
                  <thead><tr><th>Type</th><th>Numéro</th><th>Pays émetteur</th><th></th></tr></thead>
                  <tbody>
                    <tr v-for="(id, i) in form.identifiers" :key="i">
                      <td style="width:170px">
                        <v-select v-model="id.id_type" :items="['CNI','PASSEPORT','NIF','PERMIS','AUTRE']" outlined dense hide-details class="mt-1" />
                      </td>
                      <td><v-text-field v-model="id.id_value" outlined dense hide-details class="mt-1" /></td>
                      <td style="width:150px"><v-text-field v-model="id.country" outlined dense hide-details class="mt-1" /></td>
                      <td style="width:48px">
                        <v-btn icon small color="error" @click="removeIdentifier(i)"><v-icon small>mdi-delete</v-icon></v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
                <div v-else class="grey--text text-center py-6">Aucun identifiant ajouté</div>
              </v-tab-item>

              <!-- TAB 3: Contacts -->
              <v-tab-item>
                <div class="d-flex justify-space-between align-center my-3">
                  <div class="text-subtitle-2">Contacts</div>
                  <v-btn small color="primary" outlined @click="addContact"><v-icon left small>mdi-plus</v-icon> Ajouter</v-btn>
                </div>
                <v-simple-table v-if="form.contacts.length" dense>
                  <thead><tr><th>Type</th><th>Valeur</th><th>Depuis</th><th>Jusqu'au</th><th></th></tr></thead>
                  <tbody>
                    <tr v-for="(c, i) in form.contacts" :key="i">
                      <td style="width:160px">
                        <v-select v-model="c.type" :items="['tel','email','whatsapp','signal','telegram','autre']" outlined dense hide-details class="mt-1" />
                      </td>
                      <td><v-text-field v-model="c.value" outlined dense hide-details class="mt-1" /></td>
                      <td style="width:150px"><v-text-field v-model="c.valid_from" type="date" outlined dense hide-details class="mt-1" /></td>
                      <td style="width:150px"><v-text-field v-model="c.valid_to" type="date" outlined dense hide-details class="mt-1" /></td>
                      <td style="width:48px">
                        <v-btn icon small color="error" @click="removeContact(i)"><v-icon small>mdi-delete</v-icon></v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
                <div v-else class="grey--text text-center py-6">Aucun contact ajouté</div>
              </v-tab-item>

              <!-- TAB 4: Localisations -->
              <v-tab-item>
                <div class="d-flex justify-space-between align-center my-3">
                  <div class="text-subtitle-2">Localisations connues</div>
                  <v-btn small color="primary" outlined @click="addLocation"><v-icon left small>mdi-plus</v-icon> Ajouter</v-btn>
                </div>
                <v-card v-for="(loc, i) in form.locations" :key="i" outlined class="pa-3 mb-3">
                  <div class="d-flex align-center mb-2">
                    <v-chip small class="mr-2">{{ i + 1 }}</v-chip>
                    <v-select v-model="loc.role" :items="['domicile','bureau','opérationnel','autre']" label="Rôle" outlined dense hide-details style="max-width:200px" />
                    <v-spacer />
                    <v-btn small text color="error" @click="removeLocation(i)"><v-icon left small>mdi-delete</v-icon> Supprimer</v-btn>
                  </div>
                  <v-row dense>
                    <v-col cols="12"><v-text-field v-model="loc.address" label="Adresse complète" outlined dense hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model="loc.province" label="Province" outlined dense hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model="loc.territoire" label="Territoire" outlined dense hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model="loc.groupement" label="Groupement" outlined dense hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model="loc.secteur" label="Secteur" outlined dense hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model.number="loc.geo_lat" label="Latitude" type="number" outlined dense hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model.number="loc.geo_lon" label="Longitude" type="number" outlined dense hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model="loc.valid_from" label="Depuis" type="date" outlined dense hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model="loc.valid_to" label="Jusqu'au" type="date" outlined dense hide-details /></v-col>
                  </v-row>
                </v-card>
                <div v-if="!form.locations.length" class="grey--text text-center py-6">Aucune localisation ajoutée</div>
              </v-tab-item>

              <!-- TAB 5: Risque -->
              <v-tab-item>
                <v-row class="mt-4">
                  <v-col cols="12" md="4">
                    <v-select v-model="form.risk.risk_level" :items="['faible','modéré','élevé','critique']" label="Niveau de risque" outlined dense clearable />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model.number="form.risk.risk_score" label="Score (0 – 100)" type="number" min="0" max="100" outlined dense />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <v-switch v-model="form.risk.watchlist" label="Surveiller (Watchlist)" inset />
                  </v-col>
                  <v-col v-if="form.risk.risk_score != null" cols="12">
                    <div class="text-caption mb-1">Score : {{ form.risk.risk_score }} / 100</div>
                    <v-progress-linear :value="form.risk.risk_score" :color="riskColor(form.risk.risk_level)" height="8" rounded />
                  </v-col>
                </v-row>
              </v-tab-item>

              <!-- TAB 6: Classification -->
              <v-tab-item>
                <v-row class="mt-4">
                  <v-col cols="12" md="4">
                    <v-select v-model="form.classification.level" :items="classificationLevels" label="Niveau de classification" outlined dense clearable>
                      <template v-slot:item="{ item }">
                        <v-chip small :color="classifColor(item)" dark class="mr-2">{{ item }}</v-chip>
                      </template>
                      <template v-slot:selection="{ item }">
                        <v-chip small :color="classifColor(item)" dark>{{ item }}</v-chip>
                      </template>
                    </v-select>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-combobox v-model="form.classification.compartments" label="Compartiments" outlined dense multiple chips small-chips deletable-chips hint="Appuyez sur Entrée pour ajouter" />
                  </v-col>
                </v-row>
              </v-tab-item>
            </v-tabs-items>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeEntityDialog">Annuler</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveEntity">
            <v-icon left>{{ editingId ? "mdi-content-save" : "mdi-plus" }}</v-icon>
            {{ editingId ? "Mettre à jour" : "Créer" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      search: { text: "", entity_type: null, status: null, watchlist: false },
      entityTypeOptions: ["person", "organisation", "lieu"],
      statusOptions: ["actif", "inactif", "archivé"],
      classificationLevels: ["PUBLIC", "INTERNE", "CONFIDENTIEL", "SECRET"],
      loading: false,
      results: [],
      total: null,
      headers: [
        { text: "Nom / Alias", value: "name", width: "25%" },
        { text: "Type", value: "entity_type" },
        { text: "Statut", value: "status" },
        { text: "Risque", value: "risk" },
        { text: "WL", value: "watchlist", align: "center", sortable: false },
        { text: "Tags", value: "tags", sortable: false },
        { text: "Actions", value: "actions", sortable: false, align: "center", width: "120px" },
      ],
      snackbar: false,
      snackbarMessage: "",
      snackbarColor: "info",
      entityDialog: false,
      editingId: null,
      activeTab: 0,
      saving: false,
      form: null,
      deleteDialog: false,
      entityToDelete: null,
    };
  },

  created() {
    this.form = this.emptyForm();
  },

  methods: {
    emptyForm() {
      return {
        name: "",
        entity_type: "person",
        status: "actif",
        aliases: [],
        tags: [],
        labels: [],
        attributes: {
          person: { sexe: "", naissance: "", lieu_nais: "", etat_civil: "", profession: "", nom_pere: "", nom_mere: "" },
          organisation: { type_org: "", secteur_activite: "", pays_enregistrement: "", date_creation: "", parent_entity_id: "" },
          lieu: { type_lieu: "", province: "", territoire: "", geo_lat: null, geo_lon: null },
        },
        identifiers: [],
        contacts: [],
        locations: [],
        risk: { risk_score: null, risk_level: "", watchlist: false },
        classification: { level: "", compartments: [] },
      };
    },

    showSnackbar(msg, type = "info") {
      this.snackbarMessage = msg;
      this.snackbarColor = { success: "green", error: "red" }[type] || "orange";
      this.snackbar = true;
    },

    typeColor(type) {
      return { person: "blue darken-1", organisation: "purple darken-1", lieu: "teal darken-1" }[type] || "grey";
    },

    statusColor(s) {
      return { actif: "green", inactif: "grey darken-1", "archivé": "brown" }[s] || "grey";
    },

    riskColor(level) {
      return { faible: "green", "modéré": "amber darken-1", "élevé": "orange darken-2", critique: "red darken-2" }[level] || "grey";
    },

    classifColor(level) {
      return { PUBLIC: "green", INTERNE: "blue", CONFIDENTIEL: "orange darken-2", SECRET: "red darken-2" }[level] || "grey";
    },

    async performSearch() {
      this.loading = true;
      try {
        const res = await api.entities.search({
          query: this.search.text || "*",
          entity_type: this.search.entity_type || undefined,
          status: this.search.status || undefined,
          watchlist: this.search.watchlist || undefined,
          size: 50,
        });
        const data = res.data;
        const items = data.hits || data.items || [];
        this.total = data.total != null ? data.total : (data.count != null ? data.count : items.length);
        this.results = items.map((item) => ({ id: item._id || item.id, ...item }));
        this.showSnackbar(`${this.total} résultat(s)`, "success");
      } catch (e) {
        console.error(e);
        this.showSnackbar("Erreur lors de la recherche", "error");
      } finally {
        this.loading = false;
      }
    },

    openDetails(id) {
      this.$router.push({ name: "ProfileDetails", params: { id } });
    },

    openCreateDialog() {
      this.editingId = null;
      this.activeTab = 0;
      this.form = this.emptyForm();
      this.entityDialog = true;
    },

    openEditDialog(entity) {
      this.editingId = entity.id;
      this.activeTab = 0;
      const empty = this.emptyForm();
      const attrs = entity.attributes || {};
      this.form = {
        ...empty,
        name: entity.name || "",
        entity_type: entity.entity_type || "person",
        status: entity.status || "actif",
        aliases: entity.aliases ? [...entity.aliases] : [],
        tags: entity.tags ? [...entity.tags] : [],
        labels: entity.labels ? [...entity.labels] : [],
        attributes: {
          person: { ...empty.attributes.person, ...(attrs.person || {}) },
          organisation: { ...empty.attributes.organisation, ...(attrs.organisation || {}) },
          lieu: {
            ...empty.attributes.lieu,
            ...(attrs.lieu || {}),
            geo_lat: attrs.lieu && attrs.lieu.geo ? attrs.lieu.geo.lat : null,
            geo_lon: attrs.lieu && attrs.lieu.geo ? attrs.lieu.geo.lon : null,
          },
        },
        identifiers: (entity.identifiers || []).map((x) => ({ ...x })),
        contacts: (entity.contacts || []).map((x) => ({ ...x })),
        locations: (entity.locations || []).map((loc) => ({
          ...loc,
          geo_lat: loc.geo ? loc.geo.lat : null,
          geo_lon: loc.geo ? loc.geo.lon : null,
        })),
        risk: { ...empty.risk, ...(entity.risk || {}) },
        classification: {
          level: entity.classification ? (entity.classification.level || "") : "",
          compartments: entity.classification && entity.classification.compartments ? [...entity.classification.compartments] : [],
        },
      };
      this.entityDialog = true;
    },

    closeEntityDialog() {
      this.entityDialog = false;
      this.editingId = null;
    },

    buildPayload() {
      const f = this.form;
      const type = f.entity_type;
      const attrs = {};
      if (type === "person") {
        const p = Object.fromEntries(Object.entries(f.attributes.person).filter(function(e) { return e[1] !== "" && e[1] != null; }));
        if (Object.keys(p).length) attrs.person = p;
      } else if (type === "organisation") {
        const o = Object.fromEntries(Object.entries(f.attributes.organisation).filter(function(e) { return e[1] !== "" && e[1] != null; }));
        if (Object.keys(o).length) attrs.organisation = o;
      } else if (type === "lieu") {
        var _attrs = f.attributes.lieu;
        var geo_lat = _attrs.geo_lat;
        var geo_lon = _attrs.geo_lon;
        var l = Object.fromEntries(Object.entries({ type_lieu: _attrs.type_lieu, province: _attrs.province, territoire: _attrs.territoire }).filter(function(e) { return e[1] !== "" && e[1] != null; }));
        if (geo_lat != null && geo_lon != null) l.geo = { lat: geo_lat, lon: geo_lon };
        if (Object.keys(l).length) attrs.lieu = l;
      }
      const locations = f.locations.map(function(loc) {
        var geo_lat = loc.geo_lat;
        var geo_lon = loc.geo_lon;
        var out = Object.fromEntries(Object.entries({ role: loc.role, address: loc.address, province: loc.province, territoire: loc.territoire, groupement: loc.groupement, secteur: loc.secteur, valid_from: loc.valid_from, valid_to: loc.valid_to }).filter(function(e) { return e[1] !== "" && e[1] != null; }));
        if (geo_lat != null && geo_lon != null) out.geo = { lat: geo_lat, lon: geo_lon };
        return out;
      });
      return {
        name: f.name,
        entity_type: type,
        status: f.status || undefined,
        aliases: f.aliases && f.aliases.length ? f.aliases : undefined,
        tags: f.tags && f.tags.length ? f.tags : undefined,
        labels: f.labels && f.labels.length ? f.labels : undefined,
        attributes: Object.keys(attrs).length ? attrs : undefined,
        identifiers: f.identifiers.length ? f.identifiers : undefined,
        contacts: f.contacts.length ? f.contacts : undefined,
        locations: locations.length ? locations : undefined,
        risk: (f.risk.risk_level || f.risk.risk_score != null || f.risk.watchlist)
          ? { risk_level: f.risk.risk_level || undefined, risk_score: f.risk.risk_score != null ? f.risk.risk_score : undefined, watchlist: f.risk.watchlist || undefined }
          : undefined,
        classification: f.classification.level
          ? { level: f.classification.level, compartments: f.classification.compartments && f.classification.compartments.length ? f.classification.compartments : undefined }
          : undefined,
      };
    },

    async saveEntity() {
      if (!this.$refs.entityForm.validate()) {
        this.activeTab = 0;
        return;
      }
      this.saving = true;
      try {
        const payload = this.buildPayload();
        if (this.editingId) {
          await api.entities.update(this.editingId, payload);
          this.showSnackbar("Entité mise à jour avec succès", "success");
        } else {
          await api.entities.create(payload);
          this.showSnackbar("Entité créée avec succès", "success");
        }
        this.closeEntityDialog();
        // Elasticsearch refresh delay (~1 s) avant de relancer la recherche
        await new Promise((resolve) => setTimeout(resolve, 1200));
        this.performSearch();
      } catch (e) {
        console.error(e);
        this.showSnackbar("Erreur lors de l'enregistrement", "error");
      } finally {
        this.saving = false;
      }
    },

    askDelete(entity) {
      this.entityToDelete = entity;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      this.saving = true;
      try {
        await api.entities.delete(this.entityToDelete.id);
        this.showSnackbar("Entité supprimée", "success");
        this.deleteDialog = false;
        this.entityToDelete = null;
        // Elasticsearch refresh delay avant de relancer la recherche
        await new Promise((resolve) => setTimeout(resolve, 1200));
        this.performSearch();
      } catch (e) {
        console.error(e);
        this.showSnackbar("Erreur lors de la suppression", "error");
      } finally {
        this.saving = false;
      }
    },

    addIdentifier() { this.form.identifiers.push({ id_type: "CNI", id_value: "", country: "" }); },
    removeIdentifier(i) { this.form.identifiers.splice(i, 1); },
    addContact() { this.form.contacts.push({ type: "tel", value: "", valid_from: "", valid_to: "" }); },
    removeContact(i) { this.form.contacts.splice(i, 1); },
    addLocation() {
      this.form.locations.push({ role: "domicile", address: "", province: "", territoire: "", groupement: "", secteur: "", geo_lat: null, geo_lon: null, valid_from: "", valid_to: "" });
    },
    removeLocation(i) { this.form.locations.splice(i, 1); },
  },

  mounted() {
    this.performSearch();
  },
};
</script>

<style scoped>
.mt-5 { margin-top: 40px; }
</style>
