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
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedEventType"
                  :items="eventTypes"
                  label="Type d'événement"
                  outlined
                  dense
                  clearable
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
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Events Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <h3>Événements (events_v1)</h3>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openAddDialog">
              <v-icon left>mdi-plus</v-icon>
              Nouvel événement
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="filteredEvents"
              item-key="event_id"
              class="elevation-1"
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
                <v-icon
                  small
                  :color="hasImpact(item) ? 'error' : 'grey'"
                >
                  mdi-alert
                </v-icon>
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
                <v-icon small class="mr-2" @click.stop="editEvent(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small @click.stop="deleteEvent(item)">
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Event Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="1000px">
      <v-card v-if="selectedEventData">
        <v-card-title>
          <h3>{{ selectedEventData.title }}</h3>
          <v-spacer></v-spacer>
          <v-icon @click="detailsDialog = false">mdi-close</v-icon>
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
                    <strong>🕐 Début:</strong> {{ formatDate(selectedEventData.time.start) }}
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>🕐 Fin:</strong> {{ formatDate(selectedEventData.time.end) }}
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
                  v-if="selectedEventData.participants.length"
                  :headers="participantsHeaders"
                  :items="selectedEventData.participants"
                  class="mt-4"
                  hide-default-footer
                >
                  <template v-slot:item.entity_id="{ item }">
                    <router-link :to="`/poldiplo?id=${item.entity_id}`" class="primary--text">
                      {{ item.entity_id }}
                    </router-link>
                  </template>
                  <template v-slot:item.role="{ item }">
                    <v-chip small>{{ item.role }}</v-chip>
                  </template>
                </v-data-table>
                <div v-else class="text-center grey--text py-6">
                  <v-icon large class="mb-2">mdi-account-multiple-outline</v-icon>
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
                        <v-icon large class="error--text mb-2">mdi-alert</v-icon>
                        <h4>Morts</h4>
                        <h3 class="error--text">{{ selectedEventData.impact.morts || 0 }}</h3>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card flat class="impact-card warning-light">
                      <v-card-text class="text-center">
                        <v-icon large class="warning--text mb-2">mdi-hospital-box</v-icon>
                        <h4>Blessés</h4>
                        <h3 class="warning--text">{{ selectedEventData.impact.blesses || 0 }}</h3>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card flat class="impact-card info-light">
                      <v-card-text class="text-center">
                        <v-icon large class="info--text mb-2">mdi-magnify</v-icon>
                        <h4>Enlevés/Disparus</h4>
                        <h3 class="info--text">{{ selectedEventData.impact.enleves_disparus || 0 }}</h3>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card flat class="impact-card secondary-light">
                      <v-card-text class="text-center">
                        <v-icon large class="secondary--text mb-2">mdi-home-export-outline</v-icon>
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
                      <v-list-item-icon><v-icon color="warning">mdi-car</v-icon></v-list-item-icon>
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
                      <v-list-item-icon><v-icon color="error">mdi-home</v-icon></v-list-item-icon>
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
                      <v-list-item-icon><v-icon color="info">mdi-bridge</v-icon></v-list-item-icon>
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
                    <strong>✓ Créé:</strong>
                    <p class="mt-2">{{ formatDate(selectedEventData.audit.created_at) }}</p>
                  </v-col>
                  <v-col cols="12" md="6">
                    <strong>↻ Modifié:</strong>
                    <p class="mt-2">{{ formatDate(selectedEventData.audit.updated_at) }}</p>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Event Dialog -->
    <v-dialog v-model="addEventDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title>
          <h3>{{ editingEvent ? 'Modifier' : 'Créer' }} un événement</h3>
          <v-spacer></v-spacer>
          <v-icon @click="addEventDialog = false">mdi-close</v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="eventForm">
            <!-- Basic Info -->
            <h4 class="mt-4 mb-3">📋 Informations de base</h4>
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
              label="Type d'événement"
              outlined
              dense
              class="mb-4"
              required
            ></v-select>

            <!-- Time Info -->
            <h4 class="mt-4 mb-3">🕐 Dates et heures</h4>
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
            <h4 class="mt-4 mb-3">📍 Localisation</h4>
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
            <h4 class="mt-4 mb-3">⚠️ Impact humain</h4>
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

            <h4 class="mt-4 mb-3">🏢 Dégâts matériels</h4>
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
            <h4 class="mt-4 mb-3">🔐 Classification</h4>
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
export default {
  name: 'Events',
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
      participantsHeaders: [
        { text: 'ID Entité', value: 'entity_id' },
        { text: 'Rôle', value: 'role' }
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
      events: [
        {
          event_id: 'EVT-001',
          event_type: 'Incident',
          title: 'Attaque à Goma',
          description: 'Incident sécuritaire majeur dans le centre-ville',
          time: {
            start: '2026-02-20T14:30:00',
            end: '2026-02-20T16:45:00'
          },
          location: {
            province: 'Nord-Kivu',
            territoire: 'Goma',
            address: 'Centre-ville de Goma',
            geo: { lat: -1.6833, lon: 29.2333 }
          },
          participants: [
            { entity_id: 'ENT-001', role: 'Agresseur' },
            { entity_id: 'ENT-002', role: 'Victime' }
          ],
          impact: {
            morts: 5,
            blesses: 12,
            enleves_disparus: 2,
            expulses: 50,
            degat_vehicules: 3,
            degat_batiments: 2,
            degat_infrastructures: 1,
            autres_degats: 'Dégâts électriques, routes bloquées'
          },
          tags: ['sécurité', 'urgent', 'civil'],
          classification: {
            level: 'CONFIDENTIEL',
            compartments: ['DRC', 'SECURITY']
          },
          audit: {
            created_at: '2026-02-21T08:00:00',
            updated_at: '2026-02-21T10:30:00'
          }
        },
        {
          event_id: 'EVT-002',
          event_type: 'Manifestation',
          title: 'Manifestation à Kinshasa',
          description: 'Manifestation politique contre les politiques gouvernementales',
          time: {
            start: '2026-02-25T10:00:00',
            end: '2026-02-25T18:00:00'
          },
          location: {
            province: 'Kasai',
            territoire: 'Kinshasa',
            address: 'Place de la Monnaie',
            geo: { lat: -4.3369, lon: 15.3136 }
          },
          participants: [
            { entity_id: 'ENT-003', role: 'Organisateur' },
            { entity_id: 'ENT-004', role: 'Participant' }
          ],
          impact: {
            morts: 0,
            blesses: 3,
            enleves_disparus: 0,
            expulses: 200,
            degat_vehicules: 0,
            degat_batiments: 0,
            degat_infrastructures: 0,
            autres_degats: ''
          },
          tags: ['politique', 'manifestation'],
          classification: {
            level: 'OUVERT',
            compartments: []
          },
          audit: {
            created_at: '2026-02-25T11:00:00',
            updated_at: '2026-02-25T19:00:00'
          }
        }
      ]
    };
  },
  computed: {
    filteredEvents() {
      return this.events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(this.search.toLowerCase()) ||
                              event.description.toLowerCase().includes(this.search.toLowerCase());
        const matchesType = !this.selectedEventType || event.event_type === this.selectedEventType;
        const matchesClassification = !this.selectedClassification || event.classification.level === this.selectedClassification;
        return matchesSearch && matchesType && matchesClassification;
      });
    }
  },
  methods: {
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
    selectEvent(event) {
      this.selectedEventData = JSON.parse(JSON.stringify(event));
      this.detailsDialog = true;
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
      this.addEventDialog = true;
    },
    editEvent(event) {
      this.editingEvent = event;
      this.formEvent = JSON.parse(JSON.stringify(event));
      this.addEventDialog = true;
    },
    deleteEvent(event) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        const index = this.events.indexOf(event);
        if (index > -1) {
          this.events.splice(index, 1);
          this.$forceUpdate();
        }
      }
    },
    saveEvent() {
      if (this.editingEvent) {
        const index = this.events.indexOf(this.editingEvent);
        if (index > -1) {
          this.formEvent.audit.updated_at = new Date().toISOString();
          this.$set(this.events, index, this.formEvent);
        }
      } else {
        this.formEvent.event_id = `EVT-${String(this.events.length + 1).padStart(3, '0')}`;
        this.formEvent.audit = {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.events.push(this.formEvent);
      }
      this.addEventDialog = false;
    }
  }
};
</script>

<style src="./Events.scss" lang="scss"></style>
