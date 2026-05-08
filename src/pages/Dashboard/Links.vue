<template>
  <v-container fluid class="links-page mt-6">
    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      bottom
      right
    >
      {{ snackbar.message }}
    </v-snackbar>

    <!-- Filters and Search -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Rechercher"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedLinkType"
                  :items="linkTypes"
                  label="Type de lien"
                  outlined
                  dense
                  clearable
                  @change="fetchLinks"
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="selectedFromEntity"
                  :items="entitySuggestions"
                  :loading="searchingEntities"
                  :search-input.sync="entitySearchFromFilter"
                  item-text="text"
                  item-value="value"
                  label="De l'entité"
                  outlined
                  dense
                  clearable
                  no-filter
                  @change="fetchLinks"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="selectedToEntity"
                  :items="entitySuggestions"
                  :loading="searchingEntities"
                  :search-input.sync="entitySearchToFilter"
                  item-text="text"
                  item-value="value"
                  label="Vers l'entité"
                  outlined
                  dense
                  clearable
                  no-filter
                  @change="fetchLinks"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Links Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <h3>Relations d'entités (links_v1)</h3>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openAddDialog">
              Nouveau lien
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="filteredLinks"
              item-key="link_id"
              class="elevation-1"
              :loading="loading"
              loading-text="Chargement des liens..."
              @click:row="selectLink"
            >
              <template v-slot:item.from_entity="{ item }">
                <span class="primary--text font-weight-bold">{{ getEntityName(item.from_entity) }}</span>
              </template>
              <template v-slot:item.link_type="{ item }">
                <v-chip small color="info">{{ item.link_type }}</v-chip>
              </template>
              <template v-slot:item.to_entity="{ item }">
                <span class="primary--text font-weight-bold">{{ getEntityName(item.to_entity) }}</span>
              </template>
              <template v-slot:item.confidence="{ item }">
                <v-chip 
                  x-small 
                  :color="getConfidenceColor(item.evaluation?.confidence)"
                >
                  {{ item.evaluation?.confidence || '-' }}%
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn x-small text @click.stop="selectLink(item)">
                  Détails
                </v-btn>
                <v-btn x-small text @click.stop="editLink(item)">
                  Modifier
                </v-btn>
                <v-btn x-small text color="error" @click.stop="deleteLink(item)">
                  Supprimer
                </v-btn>
              </template>
            </v-data-table>

            <v-divider class="my-6"></v-divider>
            <h4 class="mb-2">Graphe relationnel des entités</h4>
            <div class="d-flex flex-wrap mb-3">
              <v-chip x-small outlined color="primary" class="mr-2 mb-1">
                {{ graphData.nodes.length }} / {{ graphData.totalNodes }} entités affichées
              </v-chip>
              <v-chip x-small outlined color="info" class="mr-2 mb-1">
                {{ graphData.edges.length }} / {{ graphData.totalEdges }} relations affichées
              </v-chip>
            </div>

            <v-sheet v-if="graphData.nodes.length" outlined class="pa-2 graph-container">
              <svg
                class="relation-graph"
                viewBox="0 0 1000 520"
                role="img"
                aria-label="Graphe des relations entre entités"
              >
                <g>
                  <g
                    v-for="edge in graphData.edges"
                    :key="edge.id"
                    class="graph-edge-group"
                  >
                    <line
                      class="graph-edge"
                      :x1="edge.source.x"
                      :y1="edge.source.y"
                      :x2="edge.target.x"
                      :y2="edge.target.y"
                      :stroke="edge.color"
                      :stroke-width="edge.width"
                      stroke-linecap="round"
                    >
                      <title>{{ edge.label }}</title>
                    </line>
                    <text
                      class="graph-edge-note"
                      :x="edge.midX"
                      :y="edge.midY - 6"
                      text-anchor="middle"
                    >
                      {{ edge.noteShort }}
                    </text>
                  </g>
                </g>

                <g>
                  <g
                    v-for="node in graphData.nodes"
                    :key="node.id"
                    class="graph-node"
                  >
                    <circle
                      :cx="node.x"
                      :cy="node.y"
                      :r="node.radius"
                      :fill="node.color"
                      fill-opacity="0.92"
                    >
                      <title>{{ node.labelFull }} • {{ node.degree }} relation(s)</title>
                    </circle>
                    <text
                      :x="node.x"
                      :y="node.y + node.radius + 14"
                      text-anchor="middle"
                      class="graph-node-label"
                    >
                      {{ node.label }}
                    </text>
                  </g>
                </g>
              </svg>
            </v-sheet>

            <div v-else class="text-center grey--text py-4">
              Pas assez de relations pour afficher le graphe.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Link Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="900px">
      <v-card v-if="selectedLinkData">
        <v-card-title>
          <h3>{{ getEntityName(selectedLinkData.from_entity) }} → {{ getEntityName(selectedLinkData.to_entity) }}</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="detailsDialog = false">×</v-btn>
        </v-card-title>
        <v-card-text>
          <v-tabs v-model="detailsTab">
            <v-tab>Informations</v-tab>
            <v-tab>Évaluation</v-tab>
            <v-tab>Source</v-tab>

            <!-- Informations Tab -->
            <v-tab-item>
              <v-container>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <strong>Type de lien:</strong>
                    <v-chip class="mt-2">{{ selectedLinkData.link_type }}</v-chip>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Link ID:</strong>
                    <v-chip small class="mt-2">{{ selectedLinkData.link_id }}</v-chip>
                  </v-col>
                </v-row>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <strong>De l'entité:</strong>
                    <router-link 
                      :to="`/poldiplo?id=${selectedLinkData.from_entity}`" 
                      class="primary--text d-block mt-2"
                    >
                      {{ getEntityName(selectedLinkData.from_entity) }}
                    </router-link>
                    <v-chip small class="mt-1">{{ selectedLinkData.role_from }}</v-chip>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Vers l'entité:</strong>
                    <router-link 
                      :to="`/poldiplo?id=${selectedLinkData.to_entity}`" 
                      class="primary--text d-block mt-2"
                    >
                      {{ getEntityName(selectedLinkData.to_entity) }}
                    </router-link>
                    <v-chip small class="mt-1">{{ selectedLinkData.role_to }}</v-chip>
                  </v-col>
                </v-row>
                <v-divider class="my-4"></v-divider>
                <v-row>
                  <v-col cols="12" md="6">
                    <strong>Début:</strong> 
                    <p class="mt-2">{{ formatDate(selectedLinkData.time?.start) }}</p>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Fin:</strong>
                    <p class="mt-2">{{ formatDate(selectedLinkData.time?.end) || 'Actif' }}</p>
                  </v-col>
                </v-row>
                <v-divider class="my-4"></v-divider>
                <v-row>
                  <v-col cols="12">
                    <strong>Notes:</strong>
                    <p class="mt-2">{{ selectedLinkData.notes || '-' }}</p>
                  </v-col>
                </v-row>
                <v-row v-if="selectedLinkData.tags && selectedLinkData.tags.length">
                  <v-col cols="12">
                    <strong>Tags:</strong>
                    <div class="mt-2">
                      <v-chip
                        v-for="tag in selectedLinkData.tags"
                        :key="tag"
                        small
                        class="mr-2"
                        color="info"
                        text-color="white"
                      >
                        {{ tag }}
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>

            <!-- Évaluation Tab -->
            <v-tab-item>
              <v-container>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <strong>Confiance:</strong>
                    <v-progress-linear 
                      :value="selectedLinkData.evaluation?.confidence || 0"
                      :color="getConfidenceColor(selectedLinkData.evaluation?.confidence)"
                      class="mt-2"
                    ></v-progress-linear>
                    <p class="text-center mt-2">{{ selectedLinkData.evaluation?.confidence || 0 }}%</p>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Crédibilité d'information:</strong>
                    <v-chip class="mt-2">{{ selectedLinkData.evaluation?.info_credibility || '-' }}</v-chip>
                  </v-col>
                </v-row>
                <v-row class="mt-4">
                  <v-col cols="12">
                    <strong>Fiabilité de la source:</strong>
                    <v-chip class="mt-2">{{ selectedLinkData.evaluation?.source_reliability || '-' }}</v-chip>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>

            <!-- Source Tab -->
            <v-tab-item>
              <v-container>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <strong>Type de source:</strong>
                    <v-chip class="mt-2">{{ selectedLinkData.source?.source_type || '-' }}</v-chip>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Collecteur:</strong>
                    <v-chip class="mt-2">{{ selectedLinkData.source?.collector || '-' }}</v-chip>
                  </v-col>
                </v-row>
                <v-row class="mt-4">
                  <v-col cols="12">
                    <strong>Référence source:</strong>
                    <p class="mt-2">{{ selectedLinkData.source?.source_ref || '-' }}</p>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Link Dialog -->
    <v-dialog v-model="addLinkDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title>
          <h3>{{ editingLink ? 'Modifier' : 'Créer' }} un lien</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="addLinkDialog = false">×</v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="linkForm">
            <!-- Entities -->
            <h4 class="mt-4 mb-3">Entités</h4>
            <v-row>
              <v-col cols="12" md="8">
                <v-autocomplete
                  v-model="fromEntitySelected"
                  :items="entitySuggestions"
                  :loading="searchingEntities"
                  :search-input.sync="entitySearchFrom"
                  item-text="text"
                  item-value="value"
                  label="Rechercher l'entité source"
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
                        <v-list-item-title v-if="!entitySearchFrom || entitySearchFrom.length < 2">
                          Tapez au moins 2 caractères pour rechercher
                        </v-list-item-title>
                        <v-list-item-title v-else>
                          Aucune entité trouvée pour "{{ entitySearchFrom }}"
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                  <template v-slot:item="{ item }">
                    <v-list-item-avatar>
                      <v-icon x-small v-if="item.entity_type === 'person'">mdi-account</v-icon>
                      <v-icon x-small v-else-if="item.entity_type === 'organization'">mdi-office-building</v-icon>
                      <v-icon x-small v-else>mdi-map-marker</v-icon>
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
                  v-model="formLink.role_from"
                  :items="entityRoles"
                  label="Rôle"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" v-if="fromEntitySelected">
                <v-btn
                  color="primary"
                  small
                  @click="setFromEntity"
                >
                  Définir comme entité source
                </v-btn>
              </v-col>
            </v-row>

            <!-- Entité source sélectionnée -->
            <v-row v-if="formLink.from_entity">
              <v-col cols="12">
                <v-card outlined class="pa-3 mb-4">
                  <div class="d-flex align-center">
                    <v-icon small class="mr-2" v-if="selectedFromEntityInfo?.entity_type === 'person'">mdi-account</v-icon>
                    <v-icon small class="mr-2" v-else-if="selectedFromEntityInfo?.entity_type === 'organization'">mdi-office-building</v-icon>
                    <v-icon small class="mr-2" v-else>mdi-map-marker</v-icon>
                    <div>
                      <strong>Entité source:</strong> {{ selectedFromEntityInfo?.name || formLink.from_entity }}
                      <br />
                      <small>Rôle: {{ formLink.role_from }}</small>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn icon small @click="clearFromEntity">
                      <v-icon small>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Entité cible -->
            <v-divider class="my-4"></v-divider>
            <v-row>
              <v-col cols="12" md="8">
                <v-autocomplete
                  v-model="toEntitySelected"
                  :items="entitySuggestions"
                  :loading="searchingEntities"
                  :search-input.sync="entitySearchTo"
                  item-text="text"
                  item-value="value"
                  label="Rechercher l'entité cible"
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
                        <v-list-item-title v-if="!entitySearchTo || entitySearchTo.length < 2">
                          Tapez au moins 2 caractères pour rechercher
                        </v-list-item-title>
                        <v-list-item-title v-else>
                          Aucune entité trouvée pour "{{ entitySearchTo }}"
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                  <template v-slot:item="{ item }">
                    <v-list-item-avatar>
                      <v-icon x-small v-if="item.entity_type === 'person'">mdi-account</v-icon>
                      <v-icon x-small v-else-if="item.entity_type === 'organization'">mdi-office-building</v-icon>
                      <v-icon x-small v-else>mdi-map-marker</v-icon>
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
                  v-model="formLink.role_to"
                  :items="entityRoles"
                  label="Rôle"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" v-if="toEntitySelected">
                <v-btn
                  color="primary"
                  small
                  @click="setToEntity"
                >
                  Définir comme entité cible
                </v-btn>
              </v-col>
            </v-row>

            <!-- Entité cible sélectionnée -->
            <v-row v-if="formLink.to_entity">
              <v-col cols="12">
                <v-card outlined class="pa-3">
                  <div class="d-flex align-center">
                    <v-icon small class="mr-2" v-if="selectedToEntityInfo?.entity_type === 'person'">mdi-account</v-icon>
                    <v-icon small class="mr-2" v-else-if="selectedToEntityInfo?.entity_type === 'organization'">mdi-office-building</v-icon>
                    <v-icon small class="mr-2" v-else>mdi-map-marker</v-icon>
                    <div>
                      <strong>Entité cible:</strong> {{ selectedToEntityInfo?.name || formLink.to_entity }}
                      <br />
                      <small>Rôle: {{ formLink.role_to }}</small>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn icon small @click="clearToEntity">
                      <v-icon small>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Link Type -->
            <h4 class="mt-4 mb-3">Type de lien</h4>
            <v-select
              v-model="formLink.link_type"
              :items="linkTypes"
              label="Type de lien"
              outlined
              dense
              class="mb-4"
              required
            ></v-select>

            <!-- Time -->
            <h4 class="mt-4 mb-3">Dates</h4>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formLink.time.start"
                  label="Début"
                  outlined
                  dense
                  type="datetime-local"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formLink.time.end"
                  label="Fin (optionnel)"
                  outlined
                  dense
                  type="datetime-local"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Evaluation -->
            <h4 class="mt-4 mb-3">Évaluation</h4>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="formLink.evaluation.confidence"
                  label="Confiance (%)"
                  outlined
                  dense
                  type="number"
                  min="0"
                  max="100"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formLink.evaluation.source_reliability"
                  :items="['Fiable', 'Modéré', 'Peu fiable', 'Non évalué']"
                  label="Fiabilité source"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formLink.evaluation.info_credibility"
                  :items="['Crédible', 'Probable', 'Douteuse', 'Non évaluée']"
                  label="Crédibilité info"
                  outlined
                  dense
                ></v-select>
              </v-col>
            </v-row>

            <!-- Source -->
            <h4 class="mt-4 mb-3">Source</h4>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formLink.source.source_type"
                  :items="['Humaine', 'Signal', 'Observation', 'Document', 'Autre']"
                  label="Type de source"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formLink.source.collector"
                  label="Collecteur"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              v-model="formLink.source.source_ref"
              label="Référence source"
              outlined
              dense
              class="mb-4"
            ></v-text-field>

            <!-- Notes and Tags -->
            <h4 class="mt-4 mb-3">Informations supplémentaires</h4>
            <v-textarea
              v-model="formLink.notes"
              label="Notes"
              outlined
              dense
              class="mb-4"
              rows="3"
            ></v-textarea>
            <v-combobox
              v-model="formLink.tags"
              label="Tags"
              outlined
              dense
              multiple
              chips
              hint="Appuyez sur Entrée pour ajouter"
            ></v-combobox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="addLinkDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="saveLink">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/services/api";

export default {
  name: 'Links',
  data() {
    return {
      search: '',
      selectedLinkType: null,
      selectedFromEntity: null,
      selectedToEntity: null,
      detailsDialog: false,
      addLinkDialog: false,
      detailsTab: 0,
      selectedLinkData: null,
      editingLink: null,
      loading: false,
      searchingEntities: false,
      entitySuggestions: [],
      entitySearchFromFilter: null,
      entitySearchToFilter: null,
      entitySearchFrom: null,
      entitySearchTo: null,
      fromEntitySelected: null,
      toEntitySelected: null,
      selectedFromEntityInfo: null,
      selectedToEntityInfo: null,
      entityRoles: ['collaborateur', 'supérieur', 'subordonné', 'allié', 'rival', 'contact', 'membre', 'leader', 'autre'],
      linkTypes: [
        'Association', 'Collaboration', 'Hiérarchie', 'Financement',
        'Communication', 'Relation familiale', 'Fournisseur', 'Client',
        'Lien criminel', 'Conflit', 'Alliance', 'Autre'
      ],
      headers: [
        { text: 'De', value: 'from_entity', sortable: true },
        { text: 'Type', value: 'link_type', sortable: true },
        { text: 'Vers', value: 'to_entity', sortable: true },
        { text: 'Confiance', value: 'confidence', sortable: true, align: 'center' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ],
      formLink: {
        from_entity: '',
        to_entity: '',
        link_type: '',
        role_from: 'collaborateur',
        role_to: 'collaborateur',
        time: { start: '', end: '' },
        source: { source_type: '', source_ref: '', collector: '' },
        evaluation: { confidence: 50, source_reliability: '', info_credibility: '' },
        notes: '',
        tags: []
      },
      links: [],
      entityCache: {},
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      }
    };
  },
  watch: {
    entitySearchFromFilter(val) {
      this.searchEntities(val);
    },
    entitySearchToFilter(val) {
      this.searchEntities(val);
    },
    entitySearchFrom(val) {
      this.searchEntities(val);
    },
    entitySearchTo(val) {
      this.searchEntities(val);
    },
  },
  computed: {
    filteredLinks() {
      return this.links.filter(link => {
        const matchesSearch = (this.getEntityName(link.from_entity) || '').toLowerCase().includes(this.search.toLowerCase()) ||
                              (this.getEntityName(link.to_entity) || '').toLowerCase().includes(this.search.toLowerCase());
        const matchesType = !this.selectedLinkType || (link.link_type === this.selectedLinkType);
        const matchesFrom = !this.selectedFromEntity || (link.from_entity === this.selectedFromEntity);
        const matchesTo = !this.selectedToEntity || (link.to_entity === this.selectedToEntity);
        return matchesSearch && matchesType && matchesFrom && matchesTo;
      });
    },
    graphData() {
      const links = this.filteredLinks || [];
      if (!links.length) {
        return { nodes: [], edges: [], totalNodes: 0, totalEdges: 0 };
      }

      const degree = {};
      const uniqueNodes = {};

      links.forEach((link) => {
        const fromId = link.from_entity;
        const toId = link.to_entity;
        if (!fromId || !toId) return;

        degree[fromId] = (degree[fromId] || 0) + 1;
        degree[toId] = (degree[toId] || 0) + 1;

        uniqueNodes[fromId] = true;
        uniqueNodes[toId] = true;
      });

      const sortedIds = Object.keys(uniqueNodes).sort((a, b) => (degree[b] || 0) - (degree[a] || 0));
      const maxNodes = 28;
      const selectedIds = sortedIds.slice(0, maxNodes);
      const selectedSet = new Set(selectedIds);

      const width = 1000;
      const height = 520;
      const centerX = width / 2;
      const centerY = height / 2;
      const innerRadius = 130;
      const outerRadius = 220;
      const innerCount = Math.min(8, selectedIds.length);
      const maxDegree = Math.max(...selectedIds.map((id) => degree[id] || 1), 1);

      const nodes = selectedIds.map((id, index) => {
        const onInnerRing = index < innerCount;
        const ringIndex = onInnerRing ? index : index - innerCount;
        const ringCount = onInnerRing ? innerCount : Math.max(1, selectedIds.length - innerCount);
        const radius = onInnerRing ? innerRadius : outerRadius;
        const angle = (2 * Math.PI * ringIndex) / ringCount - Math.PI / 2;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const nodeDegree = degree[id] || 1;
        const labelFull = this.getEntityName(id) || id;

        return {
          id,
          x,
          y,
          degree: nodeDegree,
          radius: Math.min(24, 10 + Math.sqrt(nodeDegree) * 2.2),
          color: this.getGraphNodeColor(nodeDegree, maxDegree),
          labelFull,
          label: this.truncateGraphLabel(labelFull, 18),
        };
      });

      const nodeMap = {};
      nodes.forEach((node) => {
        nodeMap[node.id] = node;
      });

      const maxEdges = 180;
      const edges = links
        .filter((link) => selectedSet.has(link.from_entity) && selectedSet.has(link.to_entity))
        .slice(0, maxEdges)
        .map((link, index) => {
          const source = nodeMap[link.from_entity];
          const target = nodeMap[link.to_entity];
          if (!source || !target || source.id === target.id) return null;

          const note = (link.notes || '').toString().trim() || 'Aucune note';
          const fromName = this.getEntityName(link.from_entity);
          const toName = this.getEntityName(link.to_entity);

          return {
            id: `${link.link_id || 'edge'}-${index}`,
            source,
            target,
            midX: (source.x + target.x) / 2,
            midY: (source.y + target.y) / 2,
            color: this.getGraphLinkColor(link.link_type),
            width: this.getGraphLinkWidth(link.evaluation?.confidence),
            note,
            noteShort: this.truncateGraphNote(note, 42),
            label: `${fromName} → ${toName} (${link.link_type || 'Lien'})\nNote: ${note}`,
          };
        })
        .filter(Boolean);

      return {
        nodes,
        edges,
        totalNodes: sortedIds.length,
        totalEdges: links.length,
      };
    }
  },
  created() {
    this.fetchLinks();
  },
  methods: {
    showSnackbar(message, color = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
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

        this.entitySuggestions = items.map((item) => ({
          text: item.name || item.text || 'Sans nom',
          value: item.id,
          entity_type: item.entity_type || 'unknown',
          entity_id: item.id,
          aliases: item.aliases,
        }));

        // Remplir le cache
        items.forEach((item) => {
          this.$set(this.entityCache, item.id, item.name || item.text || 'Sans nom');
        });
      } catch (e) {
        console.error('Erreur recherche entités:', e);
        this.showSnackbar('Erreur lors de la recherche', 'error');
        this.entitySuggestions = [];
      } finally {
        this.searchingEntities = false;
      }
    },
    getConfidenceColor(confidence) {
      if (!confidence) return 'grey';
      if (confidence >= 80) return 'success';
      if (confidence >= 50) return 'warning';
      return 'error';
    },
    truncateGraphLabel(value, maxLength = 18) {
      const text = value || '';
      return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
    },
    truncateGraphNote(value, maxLength = 42) {
      const text = (value || '').replace(/\s+/g, ' ').trim();
      if (!text) return 'Aucune note';
      return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
    },
    getGraphNodeColor(degree, maxDegree) {
      const ratio = maxDegree > 0 ? degree / maxDegree : 0;
      if (ratio >= 0.66) return 'var(--v-primary-base)';
      if (ratio >= 0.33) return 'var(--v-info-base)';
      return 'var(--v-secondary-base)';
    },
    getGraphLinkColor(linkType) {
      const value = (linkType || '').toLowerCase();
      if (value.includes('conflit')) return 'var(--v-error-base)';
      if (value.includes('alliance') || value.includes('collaboration')) return 'var(--v-success-base)';
      if (value.includes('hiérarchie')) return 'var(--v-warning-base)';
      if (value.includes('communication')) return 'var(--v-info-base)';
      return 'var(--v-secondary-base)';
    },
    getGraphLinkWidth(confidence) {
      const value = Number(confidence);
      if (Number.isNaN(value)) return 1.6;
      const clamped = Math.max(0, Math.min(100, value));
      return 1.2 + clamped / 45;
    },
    getEntityName(entityId) {
      return this.entityCache[entityId] || entityId;
    },
    async hydrateEntityNamesFromLinks(links) {
      const idsSet = new Set();
      (links || []).forEach((link) => {
        if (link.from_entity) idsSet.add(link.from_entity);
        if (link.to_entity) idsSet.add(link.to_entity);
      });
      const ids = Array.from(idsSet);

      const missingIds = ids.filter(id => !this.entityCache[id]);
      if (!missingIds.length) return;

      try {
        await Promise.all(
          missingIds.map(async (id) => {
            try {
              const res = await api.entities.get(id);
              this.$set(this.entityCache, id, res.data?.name || id);
            } catch {
              // entité introuvable, garder l'id
            }
          })
        );
      } catch (e) {
        console.error('Erreur enrichissement noms entités:', e);
      }
    },
    async fetchLinks() {
      this.loading = true;
      try {
        const res = await api.links.search({
          linkType: this.selectedLinkType,
          fromEntity: this.selectedFromEntity,
          toEntity: this.selectedToEntity,
          size: 500,
        });

        this.links = (res.data?.items || []).map((item) => ({
          ...item,
          _id: item._id || item.id,
        }));

        await this.hydrateEntityNamesFromLinks(this.links);
      } catch (e) {
        console.error("Erreur fetch links:", e);
        this.showSnackbar('Erreur lors du chargement des liens', 'error');
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    selectLink(link) {
      this.selectedLinkData = JSON.parse(JSON.stringify(link));
      this.detailsDialog = true;
    },
    openAddDialog() {
      this.editingLink = null;
      this.formLink = {
        from_entity: '',
        to_entity: '',
        link_type: '',
        role_from: 'collaborateur',
        role_to: 'collaborateur',
        time: { start: '', end: '' },
        source: { source_type: '', source_ref: '', collector: '' },
        evaluation: { confidence: 50, source_reliability: '', info_credibility: '' },
        notes: '',
        tags: []
      };
      // Nettoyer les champs de recherche
      this.entitySearchFrom = null;
      this.entitySearchTo = null;
      this.fromEntitySelected = null;
      this.toEntitySelected = null;
      this.selectedFromEntityInfo = null;
      this.selectedToEntityInfo = null;
      this.entitySuggestions = [];
      this.addLinkDialog = true;
    },
    async editLink(link) {
      this.editingLink = link;
      this.formLink = JSON.parse(JSON.stringify(link));
      
      // Pré-charger et afficher les entités sélectionnées pour l'édition
      if (link.from_entity) {
        this.selectedFromEntityInfo = await this.loadEntityInfo(link.from_entity);
      }
      if (link.to_entity) {
        this.selectedToEntityInfo = await this.loadEntityInfo(link.to_entity);
      }
      
      // Réinitialiser les champs de sélection
      this.fromEntitySelected = null;
      this.toEntitySelected = null;
      this.entitySearchFrom = null;
      this.entitySearchTo = null;
      
      this.addLinkDialog = true;
    },
    async loadEntityInfo(entityId) {
      if (this.entityCache[entityId]) {
        // L'entité est déjà en cache, retourner l'info
        return {
          value: entityId,
          text: this.entityCache[entityId],
          entity_type: 'unknown'
        };
      }
      
      try {
        const res = await api.entities.get(entityId);

        const source = res.data;
        this.$set(this.entityCache, entityId, source.name || 'Sans nom');

        // Ajouter à entitySuggestions s'il n'y est pas déjà
        const exists = this.entitySuggestions.some(s => s.value === entityId);
        if (!exists) {
          this.entitySuggestions.push({
            text: source.name || 'Sans nom',
            value: entityId,
            entity_type: source.entity_type || 'unknown',
            entity_id: source.id || entityId,
            attributes: source.attributes,
            aliases: source.aliases,
          });
        }

        return {
          value: entityId,
          text: source.name || 'Sans nom',
          entity_type: source.entity_type || 'unknown',
          entity_id: source.id || entityId,
          aliases: source.aliases
        };
      } catch (e) {
        console.error(`Erreur chargement entité ${entityId}:`, e);
        return null;
      }
    },
    setFromEntity() {
      if (!this.fromEntitySelected) return;
      this.formLink.from_entity = this.fromEntitySelected.value;
      this.selectedFromEntityInfo = this.fromEntitySelected;
      this.fromEntitySelected = null;
      this.entitySearchFrom = null;
    },
    clearFromEntity() {
      this.formLink.from_entity = '';
      this.selectedFromEntityInfo = null;
      this.fromEntitySelected = null;
      this.entitySearchFrom = null;
    },
    setToEntity() {
      if (!this.toEntitySelected) return;
      this.formLink.to_entity = this.toEntitySelected.value;
      this.selectedToEntityInfo = this.toEntitySelected;
      this.toEntitySelected = null;
      this.entitySearchTo = null;
    },
    clearToEntity() {
      this.formLink.to_entity = '';
      this.selectedToEntityInfo = null;
      this.toEntitySelected = null;
      this.entitySearchTo = null;
    },
    async deleteLink(link) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) return;

      try {
        await api.links.delete(link._id);
        this.showSnackbar('Lien supprimé avec succès', 'success');
        await this.fetchLinks();
      } catch (e) {
        console.error("Erreur suppression link:", e);
        this.showSnackbar('Erreur lors de la suppression', 'error');
      }
    },
    async saveLink() {
      if (!this.formLink.from_entity || !this.formLink.to_entity || !this.formLink.link_type) {
        this.showSnackbar('Veuillez remplir les champs obligatoires', 'error');
        return;
      }

      try {
        const formatDateTime = (dt) => {
          if (!dt || dt === '') return null;
          const date = new Date(dt);
          if (isNaN(date.getTime())) return null;
          return date.toISOString();
        };

        const linkToSave = {
          from_entity: this.formLink.from_entity || '',
          to_entity: this.formLink.to_entity || '',
          link_type: this.formLink.link_type || '',
          role_from: this.formLink.role_from || 'collaborateur',
          role_to: this.formLink.role_to || 'collaborateur',
          time: {
            start: formatDateTime(this.formLink.time.start),
            end: formatDateTime(this.formLink.time.end),
          },
          source: {
            source_type: this.formLink.source.source_type || '',
            source_ref: this.formLink.source.source_ref || '',
            collector: this.formLink.source.collector || ''
          },
          evaluation: {
            confidence: parseInt(this.formLink.evaluation.confidence) || 0,
            source_reliability: this.formLink.evaluation.source_reliability || '',
            info_credibility: this.formLink.evaluation.info_credibility || ''
          },
          notes: this.formLink.notes || '',
          tags: Array.isArray(this.formLink.tags) ? this.formLink.tags : []
        };

        if (this.editingLink && this.editingLink._id) {
          await api.links.update(this.editingLink._id, linkToSave);
        } else {
          await api.links.create(linkToSave);
        }

        const successMessage = this.editingLink ? "Lien modifié avec succès" : "Lien créé avec succès";
        this.showSnackbar(successMessage, 'success');
        this.addLinkDialog = false;
        await this.fetchLinks();
      } catch (e) {
        console.error("Erreur lors de l'enregistrement:", e);
        const errorMessage = e.response?.data?.error?.reason || e.message || "Erreur lors de l'enregistrement";
        console.error("Détail de l'erreur:", errorMessage);
        this.showSnackbar(`Erreur: ${errorMessage}`, 'error');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.links-page {
  .v-chip {
    margin: 2px;
  }

  .graph-container {
    overflow: hidden;
  }

  .relation-graph {
    width: 100%;
    height: 520px;
    display: block;
  }

  .graph-edge {
    opacity: 0.45;
    transition: opacity 0.15s ease;
  }

  .graph-edge-group:hover .graph-edge {
    opacity: 0.95;
  }

  .graph-edge-note {
    font-size: 10px;
    font-weight: 500;
    fill: var(--v-secondary-base);
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }

  .graph-edge-group:hover .graph-edge-note {
    opacity: 1;
  }

  .graph-node-label {
    font-size: 11px;
    font-weight: 500;
    fill: var(--v-secondary-base);
    pointer-events: none;
  }
}
</style>
