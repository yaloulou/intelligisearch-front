<template>
  <v-container fluid class="pa-5">
    <v-row>
      <v-col cols="12">
        <h2 class="mb-2">Gestion des Informations</h2>
        <v-alert type="info" text outlined class="mb-4">
          <strong>Qu'est-ce qu'une information ?</strong><br>
          Une information est un fait ou un événement constaté concernant une entité (personne, organisation, lieu) : 
          un déplacement, une rencontre, une communication, une transaction, une présence en un lieu, etc. 
          Chaque information doit être datée, sourcée et évaluée selon sa fiabilité et crédibilité.
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Rechercher une information"
              single-line
              hide-details
              clearable
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openObservationDialog()">
              <v-icon left>mdi-plus</v-icon>
              Nouvelle information
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- Filtres -->
            <v-row class="mb-3">
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="filterType"
                  :items="obsTypes"
                  label="Type d'information"
                  clearable
                  dense
                  outlined
                  @change="fetchObservations"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="filterReliability"
                  :items="reliabilityLevels"
                  item-text="text"
                  item-value="value"
                  label="Fiabilité"
                  clearable
                  dense
                  outlined
                  @change="fetchObservations"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filterDateFrom"
                  label="Date de début"
                  type="date"
                  dense
                  outlined
                  clearable
                  @change="fetchObservations"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filterDateTo"
                  label="Date de fin"
                  type="date"
                  dense
                  outlined
                  clearable
                  @change="fetchObservations"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Liste des informations -->
            <v-data-table
              :headers="headers"
              :items="observations"
              :search="search"
              :loading="loading"
              loading-text="Chargement des informations..."
              class="elevation-1"
              :items-per-page="10"
            >
              <template v-slot:item.time.observed_at="{ item }">
                {{ formatDate(item.time?.observed_at) }}
              </template>

              <template v-slot:item.entity_refs="{ item }">
                <v-chip
                  v-for="(ref, i) in item.entity_refs"
                  :key="i"
                  small
                  class="mr-1"
                  @click="viewEntity(ref.entity_id)"
                >
                  {{ ref.role }}
                </v-chip>
              </template>

              <template v-slot:item.evaluation="{ item }">
                <v-chip
                  small
                  :color="getReliabilityColor(item.evaluation?.source_reliability)"
                  text-color="white"
                >
                  {{ item.evaluation?.source_reliability || 'N/A' }}
                </v-chip>
                <v-chip small class="ml-1">
                  {{ item.evaluation?.info_credibility || 'N/A' }}
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-icon small class="mr-2" @click="viewObservation(item)">
                  mdi-eye
                </v-icon>
                <v-icon small class="mr-2" @click="editObservation(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small @click="deleteObservation(item)">
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog pour ajouter/modifier une information -->
    <v-dialog v-model="observationDialog" max-width="900px" persistent scrollable>
      <v-card>
        <v-card-title>
          <span class="headline">{{ editMode ? 'Modifier' : 'Nouvelle' }} information</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeObservationDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text style="max-height: 70vh;">
          <v-alert type="info" text dense class="mb-4">
            <v-icon small class="mr-2">mdi-information</v-icon>
            <strong>Une information</strong> est un fait documenté (qui, quoi, quand, où). 
            Décrivez un événement concret, datez-le précisément et indiquez vos sources.
          </v-alert>

          <v-form ref="observationForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentObservation.obs_type"
                  :items="obsTypes"
                  label="Type d'information *"
                  required
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentObservation.time.observed_at"
                  label="Date d'information *"
                  type="datetime-local"
                  required
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="currentObservation.summary"
                  label="Résumé de l'information *"
                  rows="3"
                  required
                  outlined
                ></v-textarea>
              </v-col>
            </v-row>

            <!-- Entités liées -->
            <v-divider class="my-4"></v-divider>
            <h4 class="mb-3">Entités liées</h4>
            <v-row>
              <v-col cols="12" md="8">
                <v-autocomplete
                  v-model="entityToAdd"
                  :items="entitySuggestions"
                  :loading="searchingEntities"
                  :search-input.sync="entitySearch"
                  item-text="text"
                  item-value="value"
                  label="Rechercher une entité"
                  placeholder="Tapez au moins 2 caractères"
                  return-object
                  clearable
                  outlined
                  dense
                  no-filter
                  hint="Recherche dans la base de données entities_v1"
                  persistent-hint
                >
                  <template v-slot:no-data>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title v-if="!entitySearch || entitySearch.length < 2">
                          Tapez au moins 2 caractères pour rechercher
                        </v-list-item-title>
                        <v-list-item-title v-else>
                          Aucune entité trouvée pour "{{ entitySearch }}"
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                  <template v-slot:item="{ item }">
                    <v-list-item-avatar>
                      <v-icon v-if="item.entity_type === 'person'">mdi-account</v-icon>
                      <v-icon v-else-if="item.entity_type === 'organization'">mdi-office-building</v-icon>
                      <v-icon v-else>mdi-map-marker</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ item.text }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <span class="font-weight-medium">{{ item.entity_type }}</span>
                        <span v-if="item.aliases && item.aliases.length"> • Alias: {{ Array.isArray(item.aliases) ? item.aliases.join(', ') : item.aliases }}</span>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="roleToAdd"
                  :items="entityRoles"
                  label="Rôle"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-btn
                  color="primary"
                  small
                  :disabled="!entityToAdd || !roleToAdd"
                  @click="addEntityToList"
                >
                  <v-icon left small>mdi-plus</v-icon>
                  Ajouter l'entité
                </v-btn>
              </v-col>
            </v-row>

            <!-- Liste des entités sélectionnées -->
            <v-row v-if="selectedEntities.length > 0">
              <v-col cols="12">
                <v-list dense outlined class="mt-2">
                  <v-subheader>Entités sélectionnées ({{ selectedEntities.length }})</v-subheader>
                  <v-list-item v-for="(entity, index) in selectedEntities" :key="index">
                    <v-list-item-avatar>
                      <v-icon v-if="entity.entity_type === 'person'">mdi-account</v-icon>
                      <v-icon v-else-if="entity.entity_type === 'organization'">mdi-office-building</v-icon>
                      <v-icon v-else>mdi-map-marker</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ entity.name }}</v-list-item-title>
                      <v-list-item-subtitle>
                        Rôle: {{ entity.role }} • Type: {{ entity.entity_type }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon small @click="removeEntity(index)">
                        <v-icon small color="error">mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>
            <h4 class="mb-3">Localisation</h4>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentObservation.location.province"
                  label="Province"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentObservation.location.territoire"
                  label="Territoire"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="currentObservation.location.address"
                  label="Adresse"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>
            <h4 class="mb-3">Source</h4>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentObservation.source.source_type"
                  :items="sourceTypes"
                  label="Type de source"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentObservation.source.source_name"
                  label="Nom de la source"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentObservation.source.collector"
                  label="Collecteur"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentObservation.source.unit"
                  label="Unité"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>
            <h4 class="mb-3">Évaluation</h4>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="currentObservation.evaluation.source_reliability"
                  :items="reliabilityLevels"
                  item-text="text"
                  item-value="value"
                  label="Fiabilité de la source"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="currentObservation.evaluation.info_credibility"
                  :items="credibilityLevels"
                  item-text="text"
                  item-value="value"
                  label="Crédibilité de l'info"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-slider
                  v-model="currentObservation.evaluation.confidence"
                  label="Confiance"
                  :min="0"
                  :max="100"
                  thumb-label
                ></v-slider>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeObservationDialog">Annuler</v-btn>
          <v-btn color="primary" :loading="savingObservation" @click="saveObservation">
            {{ editMode ? 'Modifier' : 'Enregistrer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualisation -->
    <v-dialog v-model="viewDialog" max-width="700px">
      <v-card v-if="selectedObservation">
        <v-card-title>
          <span class="headline">Détails de l'information</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="viewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-simple-table>
            <tbody>
              <tr>
                <td><strong>Type :</strong></td>
                <td>{{ selectedObservation.obs_type }}</td>
              </tr>
              <tr>
                <td><strong>Date :</strong></td>
                <td>{{ formatDate(selectedObservation.time?.observed_at) }}</td>
              </tr>
              <tr>
                <td><strong>Résumé :</strong></td>
                <td>{{ selectedObservation.summary }}</td>
              </tr>
              <tr>
                <td><strong>Localisation :</strong></td>
                <td>
                  {{ selectedObservation.location?.address || '—' }}
                  <span v-if="selectedObservation.location?.province">, {{ selectedObservation.location.province }}</span>
                  <span v-if="selectedObservation.location?.territoire">, {{ selectedObservation.location.territoire }}</span>
                </td>
              </tr>
              <tr>
                <td><strong>Source :</strong></td>
                <td>{{ selectedObservation.source?.source_name || '—' }} ({{ selectedObservation.source?.source_type || '—' }})</td>
              </tr>
              <tr>
                <td><strong>Fiabilité :</strong></td>
                <td>{{ selectedObservation.evaluation?.source_reliability || '—' }}</td>
              </tr>
              <tr>
                <td><strong>Crédibilité :</strong></td>
                <td>{{ selectedObservation.evaluation?.info_credibility || '—' }}</td>
              </tr>
              <tr>
                <td><strong>Confiance :</strong></td>
                <td>{{ selectedObservation.evaluation?.confidence || '—' }}%</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmation de suppression -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cette information ?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" text @click="confirmDelete">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar pour les notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      loading: false,
      search: "",
      observations: [],
      headers: [
        { text: "Type", value: "obs_type" },
        { text: "Résumé", value: "summary" },
        { text: "Date", value: "time.observed_at" },
        { text: "Lieu", value: "location.province" },
        { text: "Entités", value: "entity_refs", sortable: false },
        { text: "Évaluation", value: "evaluation", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],

      // Filtres
      filterType: null,
      filterReliability: null,
      filterDateFrom: null,
      filterDateTo: null,

      // Dialog observation
      observationDialog: false,
      editMode: false,
      savingObservation: false,
      currentObservation: this.getEmptyObservation(),

      // Entités
      selectedEntities: [],
      entitySuggestions: [],
      entitySearch: null,
      searchingEntities: false,
      entityToAdd: null,
      roleToAdd: "subject",
      entityRoles: [
        "subject",
        "witness",
        "informant",
        "suspect",
        "victim",
        "accomplice",
        "contact",
        "other",
      ],

      // View/Delete dialogs
      viewDialog: false,
      deleteDialog: false,
      selectedObservation: null,
      observationToDelete: null,

      obsTypes: [
        "déplacement",
        "rencontre",
        "communication",
        "transaction",
        "présence",
        "activité_suspecte",
        "autre",
      ],
      sourceTypes: [
        "humint",
        "sigint",
        "osint",
        "techint",
        "imint",
        "rapport",
        "interrogatoire",
        "surveillance",
      ],
      reliabilityLevels: [
        { text: "A - Totalement fiable", value: "A" },
        { text: "B - Habituellement fiable", value: "B" },
        { text: "C - Assez fiable", value: "C" },
        { text: "D - Habituellement non fiable", value: "D" },
        { text: "E - Non fiable", value: "E" },
        { text: "F - Fiabilité inconnue", value: "F" },
      ],
      credibilityLevels: [
        { text: "1 - Confirmé", value: "1" },
        { text: "2 - Probablement vrai", value: "2" },
        { text: "3 - Possiblement vrai", value: "3" },
        { text: "4 - Douteux", value: "4" },
        { text: "5 - Improbable", value: "5" },
        { text: "6 - Véracité inconnue", value: "6" },
      ],

      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  created() {
    this.fetchObservations();
  },
  watch: {
    entitySearch(val) {
      this.searchEntities(val);
    },
  },
  methods: {
    getEmptyObservation() {
      return {
        obs_type: "",
        summary: "",
        entity_refs: [],
        time: {
          observed_at: "",
          reported_at: "",
        },
        location: {
          address: "",
          province: "",
          territoire: "",
        },
        source: {
          source_type: "",
          source_name: "",
          source_ref: "",
          collector: "",
          unit: "",
          collection_method: "",
        },
        evaluation: {
          source_reliability: "",
          info_credibility: "",
          confidence: 50,
        },
      };
    },
    async fetchObservations() {
      this.loading = true;
      try {
        const res = await api.observations.search({
          obs_type: this.filterType,
          source_reliability: this.filterReliability,
          dateFrom: this.filterDateFrom,
          dateTo: this.filterDateTo,
          size: 500,
        });

        this.observations = (res.data?.items || []).map((item) => ({
          ...item,
          _id: item._id || item.id,
        }));
      } catch (e) {
        console.error("Erreur fetch observations:", e);
        this.showSnackbar("Erreur lors du chargement des informations", "error");
      } finally {
        this.loading = false;
      }
    },
    async searchEntities(val) {
      if (!val || val.length < 2) {
        this.entitySuggestions = [];
        return;
      }

      this.searchingEntities = true;

      try {
        const res = await api.entities.search(val, 20);
        const items = res.data?.items || [];

        this.entitySuggestions = items.map((h) => ({
          text: h.name || h.text || "Sans nom",
          value: h.id,
          entity_type: h.entity_type || "unknown",
          entity_id: h.id,
          attributes: h.attributes,
          aliases: h.aliases,
        }));
      } catch (e) {
        console.error("Erreur recherche entités:", e);
        this.entitySuggestions = [];
      } finally {
        this.searchingEntities = false;
      }
    },
    addEntityToList() {
      if (!this.entityToAdd || !this.roleToAdd) return;

      // Vérifier si l'entité n'est pas déjà dans la liste
      const exists = this.selectedEntities.some(
        (e) => e.entity_id === this.entityToAdd.value
      );

      if (exists) {
        this.showSnackbar("Cette entité est déjà dans la liste", "warning");
        return;
      }

      this.selectedEntities.push({
        entity_id: this.entityToAdd.value,
        name: this.entityToAdd.text,
        entity_type: this.entityToAdd.entity_type,
        role: this.roleToAdd,
      });

      // Réinitialiser les champs
      this.entityToAdd = null;
      this.roleToAdd = "subject";
      this.entitySearch = null;
    },
    openObservationDialog(observation = null) {
      if (observation) {
        this.editMode = true;
        this.currentObservation = { ...observation };
        // Charger les entités avec leurs informations complètes
        this.loadEntitiesDetails(observation.entity_refs || []);
      } else {
        this.editMode = false;
        this.currentObservation = this.getEmptyObservation();
        this.selectedEntities = [];
      }
      this.observationDialog = true;
    },
    async loadEntitiesDetails(entityRefs) {
      // Charger les détails des entités depuis Elasticsearch
      this.selectedEntities = [];
      for (const ref of entityRefs) {
        try {
          const res = await api.entities.get(ref.entity_id);
          if (res.data) {
            this.selectedEntities.push({
              entity_id: ref.entity_id,
              name: res.data.name || "Sans nom",
              entity_type: res.data.entity_type || "unknown",
              role: ref.role || "subject",
            });
          }
        } catch (e) {
          console.error("Erreur chargement entité:", ref.entity_id, e);
        }
      }
    },
    closeObservationDialog() {
      this.observationDialog = false;
      this.editMode = false;
      this.currentObservation = this.getEmptyObservation();
      this.selectedEntities = [];
      this.entityToAdd = null;
      this.roleToAdd = "subject";
      this.entitySearch = null;
      this.entitySuggestions = [];
    },
    removeEntity(index) {
      this.selectedEntities.splice(index, 1);
    },
    async saveObservation() {
      if (!this.currentObservation.obs_type || !this.currentObservation.summary) {
        this.showSnackbar("Veuillez remplir les champs obligatoires", "error");
        return;
      }

      this.savingObservation = true;

      try {
        // Construire entity_refs à partir des entités sélectionnées
        const entityRefs = this.selectedEntities.map(entity => ({
          entity_id: entity.entity_id,
          role: entity.role,
        }));

        const observation = {
          ...this.currentObservation,
          entity_refs: entityRefs,
          time: {
            observed_at: this.currentObservation.time.observed_at || new Date().toISOString(),
            reported_at: new Date().toISOString(),
          },
          audit: this.editMode ? {
            ...this.currentObservation.audit,
            updated_at: new Date().toISOString(),
            updated_by: "system",
          } : {
            created_at: new Date().toISOString(),
            created_by: "system",
          },
        };

        if (this.editMode && this.currentObservation._id) {
          await api.observations.update(this.currentObservation._id, observation);
        } else {
          await api.observations.create(observation);
        }

        this.showSnackbar(
          this.editMode ? "Information modifiée avec succès" : "Information ajoutée avec succès",
          "success"
        );
        this.closeObservationDialog();
        await this.fetchObservations();
      } catch (e) {
        console.error("Erreur lors de l'enregistrement:", e);
        this.showSnackbar("Erreur lors de l'enregistrement de l'information", "error");
      } finally {
        this.savingObservation = false;
      }
    },
    viewObservation(observation) {
      this.selectedObservation = observation;
      this.viewDialog = true;
    },
    editObservation(observation) {
      this.openObservationDialog(observation);
    },
    deleteObservation(observation) {
      this.observationToDelete = observation;
      this.deleteDialog = true;
    },
    async confirmDelete() {
      if (!this.observationToDelete) return;

      try {
        await api.observations.delete(this.observationToDelete._id);

        this.showSnackbar("Information supprimée avec succès", "success");
        this.deleteDialog = false;
        this.observationToDelete = null;
        await this.fetchObservations();
      } catch (e) {
        console.error("Erreur lors de la suppression:", e);
        this.showSnackbar("Erreur lors de la suppression", "error");
      }
    },
    viewEntity(entityId) {
      this.$router.push(`/profile/${entityId}`);
    },
    formatDate(date) {
      if (!date) return "—";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    getReliabilityColor(level) {
      const colors = {
        A: "green",
        B: "light-green",
        C: "orange",
        D: "deep-orange",
        E: "red",
        F: "grey",
      };
      return colors[level] || "grey";
    },
    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.headline {
  font-weight: 600;
}
</style>
