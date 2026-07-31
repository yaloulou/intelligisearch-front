<template>
  <v-container fluid class="mt-5">
    <v-row justify="center">
      <v-col cols="12" md="9">
        <v-card v-if="entity" class="pa-4">
          <v-row>
            <v-col cols="12" md="4" class="text-center">
              <v-avatar size="220">
                <v-img v-if="photoUrl" :src="photoUrl" />
                <v-icon v-else size="220" color="grey">{{ entityIcon }}</v-icon>
              </v-avatar>
              <div class="mt-3 text-caption grey--text">
                {{ entityTypeLabel }} • {{ entity.status || "—" }}
              </div>
            </v-col>

            <v-col cols="12" md="8">
              <h2 class="mb-2">{{ entity.name || "Sans nom" }}</h2>

              <v-divider class="my-3"></v-divider>

              <template v-if="isOrganization">
                <h3 class="mb-2">Informations générales</h3>
                <v-row>
                  <v-col cols="12" sm="6">
                    <strong>Type :</strong> {{ entityTypeLabel }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Statut :</strong> {{ entity.status || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Type d'organisation :</strong> {{ organizationAttributes.type_org || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Secteur d'activité :</strong> {{ organizationAttributes.secteur_activite || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Pays d'enregistrement :</strong> {{ organizationAttributes.pays_enregistrement || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Date de création :</strong> {{ formatDate(organizationAttributes.date_creation) }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Entité parente :</strong> {{ organizationAttributes.parent_entity_id || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Téléphone :</strong> {{ firstPhone(entity.contacts) || "—" }}
                  </v-col>
                  <v-col v-if="entity.aliases && entity.aliases.length" cols="12">
                    <strong>Alias :</strong> {{ entity.aliases.join(", ") }}
                  </v-col>
                  <v-col v-if="entity.tags && entity.tags.length" cols="12">
                    <strong>Tags :</strong>
                    <v-chip v-for="tag in entity.tags" :key="tag" x-small class="ml-1">{{ tag }}</v-chip>
                  </v-col>
                </v-row>

                <v-divider class="my-3"></v-divider>

                <h3 class="mb-2">Watch List</h3>
                <v-row>
                  <v-col cols="12">
                    <v-chip :color="entity.risk && entity.risk.watchlist ? 'orange' : 'grey'" dark>
                      {{ entity.risk && entity.risk.watchlist ? "Surveillée" : "Non surveillée" }}
                    </v-chip>
                  </v-col>
                </v-row>

                <v-divider class="my-3"></v-divider>

                <h3 class="mb-2">Risques associés</h3>
                <v-row>
                  <v-col cols="12" sm="6">
                    <strong>Niveau de risque :</strong> {{ riskValue("risk_level") }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Score de risque :</strong> {{ riskValue("risk_score") }}
                  </v-col>
                </v-row>
              </template>

              <template v-else>
                <v-row>
                  <v-col cols="12" sm="6">
                    <strong>Sexe :</strong> {{ personAttributes.sexe || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Naissance :</strong> {{ formatDate(personAttributes.naissance) }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Lieu de naissance :</strong> {{ personAttributes.lieu_nais || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>État civil :</strong> {{ personAttributes.etat_civil || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Profession :</strong> {{ personAttributes.profession || "—" }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Téléphone :</strong> {{ firstPhone(entity.contacts) || "—" }}
                  </v-col>
                </v-row>

                <v-divider class="my-3"></v-divider>

                <div v-if="Array.isArray(entity.locations) && entity.locations.length">
                  <h3 class="mb-2">Localisations</h3>
                  <v-list dense>
                    <v-list-item v-for="(loc, i) in entity.locations" :key="i">
                      <v-list-item-content>
                        <v-list-item-title>
                          <strong>{{ loc.role || "—" }}</strong>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ loc.address || "" }}
                          <span v-if="loc.province"> • {{ loc.province }}</span>
                          <span v-if="loc.territoire"> • {{ loc.territoire }}</span>
                          <span v-if="loc.secteur"> • {{ loc.secteur }}</span>
                          <span v-if="loc.groupement"> • {{ loc.groupement }}</span>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </div>

                <div v-if="Array.isArray(entity.identifiers) && entity.identifiers.length" class="mt-4">
                  <h3 class="mb-2">Identifiants</h3>
                  <v-simple-table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Valeur</th>
                        <th>Pays</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(idn, i) in entity.identifiers" :key="i">
                        <td>{{ idn.id_type || "—" }}</td>
                        <td>{{ idn.id_value || "—" }}</td>
                        <td>{{ idn.country || "—" }}</td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </div>
              </template>
            </v-col>
          </v-row>
        </v-card>

        <v-alert v-else type="error">Entité non trouvée</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from "@/services/api";
import config from "@/config";

export default {
  data() {
    return {
      entity: null,
    };
  },
  computed: {
    normalizedEntityType() {
      return (this.entity?.entity_type || "").toLowerCase();
    },
    isOrganization() {
      return ["organisation", "organization"].includes(this.normalizedEntityType);
    },
    entityTypeLabel() {
      if (this.isOrganization) return "organisation";
      return this.entity?.entity_type || "—";
    },
    entityIcon() {
      if (this.isOrganization) return "mdi-office-building";
      if (this.normalizedEntityType === "lieu") return "mdi-map-marker";
      return "mdi-account";
    },
    personAttributes() {
      const attrs = this.entity?.attributes || {};
      return attrs.person || attrs;
    },
    organizationAttributes() {
      const attrs = this.entity?.attributes || {};
      return attrs.organisation || attrs.organization || attrs;
    },
    photoUrl() {
      const media = this.entity?.media;
      if (!Array.isArray(media) || !media.length) return null;

      const first = media[0];
      if (first?.url) return first.url;
      if (first?.file_path) return `${config.UPLOADS_BASE}/${first.file_path}`;
      return null;
    },
  },
  created() {
    this.fetchEntity();
  },
  methods: {
    async fetchEntity() {
      const id = this.$route.params.id;
      try {
        const res = await api.entities.get(id);
        this.entity = res.data || null;
      } catch (e) {
        console.error("Erreur fetch entity:", e);
        this.entity = null;
      }
    },
    formatDate(date) {
      if (!date) return "—";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    },
    firstPhone(contacts) {
      if (!Array.isArray(contacts)) return null;
      const p = contacts.find((c) => ["phone", "tel"].includes((c?.type || "").toLowerCase()));
      return p?.value || null;
    },
    riskValue(key) {
      const value = this.entity?.risk?.[key];
      return value === null || value === undefined || value === "" ? "—" : value;
    },
  },
};
</script>

<style scoped>
.mt-5 {
  margin-top: 40px;
}
</style>
