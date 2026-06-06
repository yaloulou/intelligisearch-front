<template>
  <v-container fluid class="events-page mt-6">
    <!-- Filters and Search -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Rechercher par titre"
                  outlined
                  dense
                  clearable
                  @click:append="fetchEvents"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedEventType"
                  :items="eventTypes"
                  label="Type de renseignement"
                  outlined
                  dense
                  clearable
                  @change="fetchEvents"
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedClassification"
                  :items="classificationLevels"
                  label="Classification"
                  outlined
                  dense
                  clearable
                  @change="fetchEvents"
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Renseignements Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <h3>Renseignements</h3>
            <v-spacer></v-spacer>
            <v-btn color="primary" v-if="canCreate('event')" @click="openAddDialog">
              Nouveau renseignement
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="filteredEvents"
              item-key="event_id"
              class="elevation-1"
              :loading="loading"
              loading-text="Chargement des renseignements..."
              @click:row="selectEvent"
            >
              <template v-slot:item.event_type="{ item }">
                <v-chip small :color="getEventTypeColor(item.event_type)">
                  {{ item.event_type }}
                </v-chip>
              </template>
              <template v-slot:item.start="{ item }">
                {{ formatDate(item.time.start) }}
              </template>
              <template v-slot:item.impact="{ item }">
                <v-chip
                  x-small
                  :color="hasImpact(item) ? 'error' : 'grey'"
                >
                  {{ hasImpact(item) ? 'Oui' : 'Non' }}
                </v-chip>
              </template>
              <template v-slot:item.classification="{ item }">
                <v-chip
                  x-small
                  :color="`classification-${item.classification.level.toLowerCase()}`"
                >
                  {{ item.classification.level }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn x-small text @click.stop="selectEvent(item)">
                  Détails
                </v-btn>
                <v-btn x-small text v-if="canCreate('event')" @click.stop="editEvent(item)">
                  Modifier
                </v-btn>
                <v-btn x-small text color="error" v-if="canDelete('event')" @click.stop="deleteEvent(item)">
                  Supprimer
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Renseignement Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="1000px">
      <v-card v-if="selectedEventData">
        <v-card-title>
          <h3>{{ selectedEventData.title }}</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="detailsDialog = false">×</v-btn>
        </v-card-title>
        <v-card-text>
          <v-tabs v-model="detailsTab">
            <v-tab>Informations</v-tab>
            <v-tab>Participants</v-tab>
            <v-tab>Impact</v-tab>
            <v-tab>Localisation</v-tab>
            <v-tab>Audit</v-tab>

            <!-- Informations Tab -->
            <v-tab-item>
              <v-container>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <strong>Event ID:</strong> 
                    <v-chip small>{{ selectedEventData.event_id }}</v-chip>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Type:</strong> 
                    <v-chip :color="getEventTypeColor(selectedEventData.event_type)">
                      {{ selectedEventData.event_type }}
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <strong>Titre:</strong>
                    <h4>{{ selectedEventData.title }}</h4>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <strong>Description:</strong>
                    <p>{{ selectedEventData.description }}</p>
                  </v-col>
                </v-row>
                <v-divider class="my-4"></v-divider>
                <v-row>
                  <v-col cols="12" md="6">
                    <strong>Début:</strong> {{ formatDate(selectedEventData.time.start) }}
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Fin:</strong> {{ formatDate(selectedEventData.time.end) }}
                  </v-col>
                </v-row>
                <v-divider class="my-4"></v-divider>
                <v-row>
                  <v-col cols="12" md="6">
                    <strong>Classification:</strong>
                    <v-chip 
                      :color="`classification-${selectedEventData.classification.level.toLowerCase()}`"
                      class="mt-2"
                    >
                      {{ selectedEventData.classification.level }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Compartiments:</strong>
                    <div class="mt-2">
                      <v-chip
                        v-for="comp in selectedEventData.classification.compartments"
                        :key="comp"
                        small
                        class="mr-2"
                      >
                        {{ comp }}
                      </v-chip>
                      <span v-if="!selectedEventData.classification.compartments.length" class="grey--text">Aucun</span>
                    </div>
                  </v-col>
                </v-row>
                <v-row class="mt-4">
                  <v-col cols="12">
                    <strong>Tags:</strong>
                    <div class="mt-2">
                      <v-chip
                        v-for="tag in selectedEventData.tags"
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

            <!-- Participants Tab -->
            <v-tab-item>
              <v-container>
                <v-data-table
                  v-if="participantsEnriched.length"
                  :headers="participantsHeaders"
                  :items="participantsEnriched"
                  class="mt-4"
                  hide-default-footer
                >
                  <template v-slot:item.name="{ item }">
                    <router-link :to="`/poldiplo?id=${item.entity_id}`" class="primary--text">
                      {{ item.name }}
                    </router-link>
                  </template>
                  <template v-slot:item.entity_type="{ item }">
                    <v-chip x-small
                      :color="item.entity_type === 'person' ? 'blue' : item.entity_type === 'organization' ? 'green' : 'grey'"
                      text-color="white"
                    >
                      {{ item.entity_type }}
                    </v-chip>
                  </template>
                  <template v-slot:item.role="{ item }">
                    <v-chip small color="info" text-color="white">{{ item.role }}</v-chip>
                  </template>
                  <template v-slot:item.aliases="{ item }">
                    <div v-if="item.aliases && item.aliases.length">
                      <v-chip
                        v-for="alias in item.aliases.slice(0, 2)"
                        :key="alias"
                        x-small
                        class="mr-1 mb-1"
                      >
                        {{ alias }}
                      </v-chip>
                      <span v-if="item.aliases.length > 2" class="text-caption grey--text">+{{ item.aliases.length - 2 }}</span>
                    </div>
                    <span v-else class="grey--text">-</span>
                  </template>
                </v-data-table>
                <div v-else class="text-center grey--text py-6">
                  <p>Aucun participant enregistré</p>
                </div>
              </v-container>
            </v-tab-item>

            <!-- Impact Tab -->
            <v-tab-item>
              <v-container>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <v-card flat class="impact-card error-light">
                      <v-card-text class="text-center">
                        <h4>Morts</h4>
                        <h3 class="error--text">{{ selectedEventData.impact.morts || 0 }}</h3>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card flat class="impact-card warning-light">
                      <v-card-text class="text-center">
                        <h4>Blessés</h4>
                        <h3 class="warning--text">{{ selectedEventData.impact.blesses || 0 }}</h3>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card flat class="impact-card info-light">
                      <v-card-text class="text-center">
                        <h4>Enlevés/Disparus</h4>
                        <h3 class="info--text">{{ selectedEventData.impact.enleves_disparus || 0 }}</h3>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card flat class="impact-card secondary-light">
                      <v-card-text class="text-center">
                        <h4>Expulsés</h4>
                        <h3 class="secondary--text">{{ selectedEventData.impact.expulses || 0 }}</h3>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <v-divider class="my-6"></v-divider>

                <h4 class="mb-4">Dégâts matériels</h4>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Véhicules</v-list-item-title>
                        <v-list-item-subtitle class="font-weight-bold text-h6">
                          {{ selectedEventData.impact.degat_vehicules || 0 }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Bâtiments</v-list-item-title>
                        <v-list-item-subtitle class="font-weight-bold text-h6">
                          {{ selectedEventData.impact.degat_batiments || 0 }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Infrastructures</v-list-item-title>
                        <v-list-item-subtitle class="font-weight-bold text-h6">
                          {{ selectedEventData.impact.degat_infrastructures || 0 }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>

                <v-row v-if="selectedEventData.impact.autres_degats" class="mt-4">
                  <v-col cols="12">
                    <v-alert type="info" outlined>
                      <strong>Autres dégâts:</strong> {{ selectedEventData.impact.autres_degats }}
                    </v-alert>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>

            <!-- Localisation Tab -->
            <v-tab-item>
              <v-container>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <strong>Province:</strong>
                    <v-chip class="mt-2">{{ selectedEventData.location.province }}</v-chip>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Territoire:</strong>
                    <v-chip class="mt-2">{{ selectedEventData.location.territoire }}</v-chip>
                  </v-col>
                </v-row>
                <v-row class="mt-4">
                  <v-col cols="12">
                    <strong>Adresse:</strong>
                    <p class="mt-2">{{ selectedEventData.location.address }}</p>
                  </v-col>
                </v-row>
                <v-row v-if="selectedEventData.location.geo" class="mt-4">
                  <v-col cols="12">
                    <strong>Coordonnées GPS:</strong>
                    <v-chip class="mt-2">
                      {{ selectedEventData.location.geo.lat }}, {{ selectedEventData.location.geo.lon }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>

            <!-- Audit Tab -->
            <v-tab-item>
              <v-container>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <strong>Créé:</strong>
                    <p class="mt-2">{{ formatDate(selectedEventData.audit.created_at) }}</p>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>Modifié:</strong>
                    <p class="mt-2">{{ formatDate(selectedEventData.audit.updated_at) }}</p>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
      </v-card>
    </v-dialog>

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

    <!-- Add/Edit Renseignement Dialog -->
    <v-dialog v-model="addEventDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title>
          <h3>{{ editingEvent ? 'Modifier' : 'Créer' }} un renseignement</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="addEventDialog = false">×</v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="eventForm">
            <!-- Basic Info -->
            <h4 class="mt-4 mb-3">Informations de base</h4>
            <v-text-field
              v-model="formEvent.title"
              label="Titre"
              outlined
              dense
              class="mb-4"
              required
            ></v-text-field>
            <v-textarea
              v-model="formEvent.description"
              label="Description"
              outlined
              dense
              class="mb-4"
              rows="3"
            ></v-textarea>
            <v-select
              v-model="formEvent.event_type"
              :items="eventTypes"
              label="Type de renseignement"
              outlined
              dense
              class="mb-4"
              required
            ></v-select>

            <!-- Time Info -->
            <h4 class="mt-4 mb-3">Dates et heures</h4>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formEvent.time.start"
                  label="Début"
                  outlined
                  dense
                  type="datetime-local"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formEvent.time.end"
                  label="Fin"
                  outlined
                  dense
                  type="datetime-local"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Location Info -->
            <h4 class="mt-4 mb-3">Localisation</h4>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formEvent.location.province"
                  label="Province"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formEvent.location.territoire"
                  label="Territoire"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              v-model="formEvent.location.address"
              label="Adresse"
              outlined
              dense
              class="mb-4"
            ></v-text-field>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formEvent.location.geo.lat"
                  label="Latitude"
                  outlined
                  dense
                  type="number"
                  step="0.0001"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formEvent.location.geo.lon"
                  label="Longitude"
                  outlined
                  dense
                  type="number"
                  step="0.0001"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Impact Info -->
            <h4 class="mt-4 mb-3">Impact humain</h4>
            <v-row>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model.number="formEvent.impact.morts"
                  label="Morts"
                  outlined
                  dense
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model.number="formEvent.impact.blesses"
                  label="Blessés"
                  outlined
                  dense
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model.number="formEvent.impact.enleves_disparus"
                  label="Enlevés/Disparus"
                  outlined
                  dense
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model.number="formEvent.impact.expulses"
                  label="Expulsés"
                  outlined
                  dense
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
            </v-row>

            <h4 class="mt-4 mb-3">Dégâts matériels</h4>
            <v-row>
              <v-col cols="6" md="4">
                <v-text-field
                  v-model.number="formEvent.impact.degat_vehicules"
                  label="Véhicules"
                  outlined
                  dense
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="6" md="4">
                <v-text-field
                  v-model.number="formEvent.impact.degat_batiments"
                  label="Bâtiments"
                  outlined
                  dense
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="6" md="4">
                <v-text-field
                  v-model.number="formEvent.impact.degat_infrastructures"
                  label="Infrastructures"
                  outlined
                  dense
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-textarea
              v-model="formEvent.impact.autres_degats"
              label="Autres dégâts"
              outlined
              dense
              class="mb-4"
              rows="2"
            ></v-textarea>

            <!-- Classification -->
            <h4 class="mt-4 mb-3">Classification</h4>
            <v-select
              v-model="formEvent.classification.level"
              :items="classificationLevels"
              label="Niveau de classification"
              outlined
              dense
              class="mb-4"
            ></v-select>
            <v-combobox
              v-model="formEvent.classification.compartments"
              label="Compartiments"
              outlined
              dense
              multiple
              chips
              class="mb-4"
              hint="Appuyez sur Entrée pour ajouter"
            ></v-combobox>

            <!-- Entités liées (Participants) -->
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
                      <v-icon x-small v-if="entity.entity_type === 'person'">mdi-account</v-icon>
                      <v-icon x-small v-else-if="entity.entity_type === 'organization'">mdi-office-building</v-icon>
                      <v-icon x-small v-else>mdi-map-marker</v-icon>
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

            <!-- Tags -->
            <v-combobox
              v-model="formEvent.tags"
              label="Tags"
              outlined
              dense
              multiple
              chips
              class="mb-4"
              hint="Appuyez sur Entrée pour ajouter"
            ></v-combobox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="addEventDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="saveEvent">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/services/api";
import { PermissionsMixin } from "@/mixins/permissions";

export default {
  name: 'Events',
  mixins: [PermissionsMixin],
  data() {
    return {
      search: '',
      selectedEventType: null,
      selectedClassification: null,
      detailsDialog: false,
      addEventDialog: false,
      detailsTab: 0,
      selectedEventData: null,
      editingEvent: null,
      loading: false,
      searchingEntities: false,
      entityToAdd: null,
      entitySearch: null,
      entitySuggestions: [],
      roleToAdd: 'participant',
      selectedEntities: [],
      entityRoles: ['participant', 'observateur', 'responsable', 'victime', 'suspect', 'auteur', 'mediateur', 'autre'],
      participantsHeaders: [
        { text: 'Nom', value: 'name' },
        { text: 'Type', value: 'entity_type' },
        { text: 'Rôle', value: 'role' },
        { text: 'Alias', value: 'aliases', sortable: false }
      ],
      headers: [
        { text: 'Titre', value: 'title', sortable: true },
        { text: 'Type', value: 'event_type', sortable: true },
        { text: 'Début', value: 'start', sortable: true },
        { text: 'Province', value: 'location.province', sortable: true },
        { text: 'Impact', value: 'impact', sortable: false, align: 'center' },
        { text: 'Classification', value: 'classification.level', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ],
      eventTypes: ['Incident', 'Opération', 'Action', 'Attaque', 'Manifestation', 'Autre'],
      classificationLevels: ['OUVERT', 'CONFIDENTIEL', 'SECRET', 'TRÈS SECRET'],
      formEvent: {
        title: '',
        description: '',
        event_type: '',
        time: { start: '', end: '' },
        location: { province: '', territoire: '', address: '', geo: { lat: 0, lon: 0 } },
        participants: [],
        impact: {
          morts: 0,
          blesses: 0,
          enleves_disparus: 0,
          expulses: 0,
          degat_vehicules: 0,
          degat_batiments: 0,
          degat_infrastructures: 0,
          autres_degats: ''
        },
        tags: [],
        classification: { level: 'OUVERT', compartments: [] },
        audit: { created_at: '', updated_at: '' }
      },
      events: [],
      participantsEnriched: [],
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      }
    };
  },
  watch: {
    entitySearch(val) {
      this.searchEntities(val);
    },
  },
  computed: {
    filteredEvents() {
      return this.events.filter(event => {
        const matchesSearch = (event.title || '').toLowerCase().includes(this.search.toLowerCase()) ||
                              (event.description || '').toLowerCase().includes(this.search.toLowerCase());
        const matchesType = !this.selectedEventType || (event.event_type === this.selectedEventType);
        const matchesClassification = !this.selectedClassification || (event.classification?.level === this.selectedClassification);
        return matchesSearch && matchesType && matchesClassification;
      });
    }
  },
  created() {
    this.fetchEvents();
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

        this.entitySuggestions = items.map((h) => ({
          text: h.name || h.text || 'Sans nom',
          value: h.id,
          entity_type: h.entity_type || 'unknown',
          entity_id: h.id,
          attributes: h.attributes,
          aliases: h.aliases,
        }));
      } catch (e) {
        console.error('Erreur recherche entités:', e);
        this.showSnackbar('Erreur lors de la recherche d\'entités', 'error');
        this.entitySuggestions = [];
      } finally {
        this.searchingEntities = false;
      }
    },
    async fetchEvents() {
      this.loading = true;
      try {
        const params = { size: 500 };
        if (this.selectedEventType) params.event_type = this.selectedEventType;
        if (this.selectedClassification) params.classification_level = this.selectedClassification;
        const res = await api.events.search(params);

        this.events = (res.data?.items || []).map((item) => ({
          ...item,
          _id: item._id || item.id,
        }));
      } catch (e) {
        console.error("Erreur fetch events:", e);
        this.showSnackbar('Erreur lors du chargement des renseignements', 'error');
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    getEventTypeColor(eventType) {
      const colors = {
        'Incident': 'error',
        'Opération': 'warning',
        'Action': 'info',
        'Attaque': 'deep-orange',
        'Manifestation': 'blue-grey',
        'Autre': 'grey'
      };
      return colors[eventType] || 'grey';
    },
    hasImpact(event) {
      const imp = event.impact;
      return imp.morts > 0 || imp.blesses > 0 || imp.enleves_disparus > 0 ||
             imp.expulses > 0 || imp.degat_vehicules > 0 || imp.degat_batiments > 0 ||
             imp.degat_infrastructures > 0;
    },
    async selectEvent(event) {
      this.selectedEventData = JSON.parse(JSON.stringify(event));
      await this.enrichParticipants();
      this.detailsDialog = true;
    },
    async enrichParticipants() {
      if (!this.selectedEventData || !this.selectedEventData.participants.length) {
        this.participantsEnriched = [];
        return;
      }

      try {
        const enriched = [];
        for (const participant of this.selectedEventData.participants) {
        try {
            const res = await api.entities.get(participant.entity_id);
            const source = res.data;
            enriched.push({
              entity_id: participant.entity_id,
              name: source.name || 'Sans nom',
              entity_type: source.entity_type || 'unknown',
              role: participant.role,
              aliases: source.aliases || []
            });
          } catch (e) {
            // Si l'entité n'existe plus, utiliser juste l'ID
            enriched.push({
              entity_id: participant.entity_id,
              name: 'Entité supprimée',
              entity_type: 'unknown',
              role: participant.role,
              aliases: []
            });
          }
        }
        this.participantsEnriched = enriched;
      } catch (e) {
        console.error('Erreur enrichissement participants:', e);
        this.participantsEnriched = this.selectedEventData.participants;
      }
    },
    openAddDialog() {
      this.editingEvent = null;
      this.formEvent = {
        title: '',
        description: '',
        event_type: '',
        time: { start: '', end: '' },
        location: { province: '', territoire: '', address: '', geo: { lat: 0, lon: 0 } },
        participants: [],
        impact: {
          morts: 0,
          blesses: 0,
          enleves_disparus: 0,
          expulses: 0,
          degat_vehicules: 0,
          degat_batiments: 0,
          degat_infrastructures: 0,
          autres_degats: ''
        },
        tags: [],
        classification: { level: 'OUVERT', compartments: [] },
        audit: { created_at: '', updated_at: '' }
      };
      this.selectedEntities = [];
      this.entityToAdd = null;
      this.entitySearch = null;
      this.roleToAdd = 'participant';
      this.addEventDialog = true;
    },
    editEvent(event) {
      this.editingEvent = event;
      this.formEvent = JSON.parse(JSON.stringify(event));
      this.selectedEntities = event.participants?.map(p => ({
        entity_id: p.entity_id,
        name: p.name || p.entity_id,
        entity_type: p.entity_type || 'unknown',
        role: p.role || 'participant'
      })) || [];
      this.entityToAdd = null;
      this.entitySearch = null;
      this.roleToAdd = 'participant';
      this.addEventDialog = true;
    },
    addParticipant() {
      this.formEvent.participants.push({ entity_id: '', role: '' });
    },
    addEntityToList() {
      if (!this.entityToAdd || !this.roleToAdd) return;

      // Vérifier si l'entité n'est pas déjà dans la liste
      const exists = this.selectedEntities.some(
        (e) => e.entity_id === this.entityToAdd.value
      );

      if (exists) {
        this.$vuetify.framework.notifier.notify({ 
          message: 'Cette entité est déjà dans la liste', 
          color: 'warning' 
        });
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
      this.roleToAdd = 'participant';
      this.entitySearch = null;
    },
    removeEntity(index) {
      this.selectedEntities.splice(index, 1);
    },
    async deleteEvent(event) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce renseignement ?')) return;

      try {
        await api.events.delete(event._id);
        this.showSnackbar('Événement supprimé avec succès', 'success');
        await this.fetchEvents();
      } catch (e) {
        console.error("Erreur suppression event:", e);
        this.showSnackbar('Erreur lors de la suppression', 'error');
      }
    },
    async saveEvent() {
      if (!this.formEvent.title || !this.formEvent.event_type) {
        this.showSnackbar('Veuillez remplir les champs obligatoires', 'error');
        return;
      }

      try {
        // Convertir les datetime-local en ISO 8601
        const formatDateTime = (dt) => {
          if (!dt || dt === '') return new Date().toISOString();
          const date = new Date(dt);
          if (isNaN(date.getTime())) return new Date().toISOString();
          return date.toISOString();
        };

        // Convertir selectedEntities en participants (uniquement les champs du mapping)
        const participants = this.selectedEntities.map(entity => ({
          entity_id: entity.entity_id,
          role: entity.role
        }));

        // Construire l'objet event avec validation des types
        const eventToSave = {
          title: this.formEvent.title || '',
          description: this.formEvent.description || '',
          event_type: this.formEvent.event_type || '',
          time: {
            start: formatDateTime(this.formEvent.time.start),
            end: formatDateTime(this.formEvent.time.end),
          },
          location: {
            province: this.formEvent.location.province || '',
            territoire: this.formEvent.location.territoire || '',
            address: this.formEvent.location.address || '',
            geo: {
              lat: parseFloat(this.formEvent.location.geo.lat) || 0,
              lon: parseFloat(this.formEvent.location.geo.lon) || 0,
            }
          },
          impact: {
            morts: parseInt(this.formEvent.impact.morts) || 0,
            blesses: parseInt(this.formEvent.impact.blesses) || 0,
            enleves_disparus: parseInt(this.formEvent.impact.enleves_disparus) || 0,
            expulses: parseInt(this.formEvent.impact.expulses) || 0,
            degat_vehicules: parseInt(this.formEvent.impact.degat_vehicules) || 0,
            degat_batiments: parseInt(this.formEvent.impact.degat_batiments) || 0,
            degat_infrastructures: parseInt(this.formEvent.impact.degat_infrastructures) || 0,
            autres_degats: this.formEvent.impact.autres_degats || ''
          },
          participants: participants,
          tags: Array.isArray(this.formEvent.tags) ? this.formEvent.tags : [],
          classification: {
            level: this.formEvent.classification.level || 'OUVERT',
            compartments: Array.isArray(this.formEvent.classification.compartments) ? this.formEvent.classification.compartments : []
          },
          audit: this.editingEvent ? {
            ...this.formEvent.audit,
            updated_at: new Date().toISOString(),
          } : {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };

        if (this.editingEvent && this.editingEvent._id) {
          await api.events.update(this.editingEvent._id, eventToSave);
        } else {
          await api.events.create(eventToSave);
        }

        const successMessage = this.editingEvent ? "Renseignement modifié avec succès" : "Renseignement créé avec succès";
        this.showSnackbar(successMessage, 'success');
        this.addEventDialog = false;
        this.selectedEntities = [];
        this.entityToAdd = null;
        this.entitySearch = null;
        await this.fetchEvents();
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

<style src="./Events.scss" lang="scss"></style>
