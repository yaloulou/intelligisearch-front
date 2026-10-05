<template>
  <v-container fluid class="mt-5">
    <v-card>
      <v-card-title class="headline">Détails de l'incident</v-card-title>
      <v-card-text>
        <v-row>
          <!-- Informations générales -->
          <v-col cols="12" sm="6">
            <strong>Province/Région :</strong>
            {{ incident.location?.province_region || "Non défini" }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Territoire/Ville :</strong>
            {{ incident.location?.territoire_ville || "Non défini" }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Date de l'incident :</strong>
            {{
              incident.event?.date_event
                ? formatDate(incident.event.date_event)
                : "Non défini"
            }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Type d'événement :</strong>
            {{ incident.event?.event_type || "Non défini" }}
          </v-col>

          <!-- Détails supplémentaires -->
          <v-col cols="12" sm="6">
            <strong>Localité/Village/Lieu précis :</strong>
            {{ incident.location?.localite_village_lieuprecis || "Non défini" }}
          </v-col>
          <v-col cols="12">
            <strong>Acteurs impliqués :</strong>
            <div v-if="displayActors.length" class="actors-detail-list">
              <div
                v-for="(actor, index) in displayActors"
                :key="`detail-actor-${index}`"
                class="actor-detail-row"
              >
                <span class="actor-detail-index">{{ index + 1 }}</span>
                <div>
                  <strong class="actor-detail-name">{{ actor.nom }}</strong>
                  <div v-if="actor.role || actor.assoc" class="actor-detail-meta">
                    <span v-if="actor.role">Rôle : {{ actor.role }}</span>
                    <span v-if="actor.assoc">Association : {{ actor.assoc }}</span>
                  </div>
                </div>
              </div>
            </div>
            <span v-else>Non défini</span>
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Latitude :</strong>
            {{ incident.location?.latitude || "Non défini" }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Longitude :</strong>
            {{ incident.location?.longitude || "Non défini" }}
          </v-col>

          <!-- Dégâts humains -->
          <v-col cols="12">
            <v-card class="my-4">
              <v-card-title>Dégâts Humains</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="3">
                    <strong>Nombre de morts :</strong>
                    {{ totalMorts(incident.degats_humains) }}
                  </v-col>
                  <v-col cols="12" sm="3">
                    <strong>Nombre de blessés :</strong>
                    {{ totalBlesses(incident.degats_humains) }}
                  </v-col>
                  <v-col cols="12" sm="3">
                    <strong>Nombre de disparus :</strong>
                    {{
                      displayNumber(incident.degats_humains?.enleves_disparus)
                    }}
                  </v-col>
                  <v-col cols="12" sm="3">
                    <strong>Nombre d'expulsés :</strong>
                    {{ displayNumber(incident.degats_humains?.expulses) }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Dégâts matériels -->
          <v-col cols="12">
            <v-card class="my-4">
              <v-card-title>Dégâts Matériels</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="4">
                    <strong>Infrastructures endommagées :</strong>
                    {{
                      displayNumber(incident.degats_materiels?.degat_infrastructures)
                    }}
                  </v-col>
                  <v-col cols="12" sm="4">
                    <strong>Véhicules endommagés :</strong>
                    {{
                      displayNumber(incident.degats_materiels?.degat_vehicules)
                    }}
                  </v-col>
                  <v-col cols="12" sm="4">
                    <strong>Bâtiments endommagés :</strong>
                    {{
                      displayNumber(incident.degats_materiels?.degat_batiments)
                    }}
                  </v-col>
                  <v-col cols="12">
                    <strong>Autres dégâts :</strong>
                    {{
                      incident.degats_materiels?.autres_degats || "Non défini"
                    }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Autres informations -->
          <v-col cols="12">
            <strong>Description de l'incident :</strong>
            {{ incident.event?.description || "Non défini" }}
          </v-col>
          <v-col cols="12">
            <strong>Catégorie :</strong>
            {{ incident.event?.categorie || "Non défini" }}
          </v-col>

          <!-- Comment Section -->
          
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      incident: {}, // Pour stocker les détails de l'incident
      comment: "", // Commentaires de l'utilisateur
    };
  },
  computed: {
    displayActors() {
      if (Array.isArray(this.incident.actors)) {
        return this.incident.actors.filter((actor) => actor && actor.nom);
      }

      return [
        {
          nom: this.incident.acteur1,
          role: "",
          assoc: this.incident.assoc_acteur1,
        },
        {
          nom: this.incident.acteur2,
          role: "",
          assoc: this.incident.assoc_acteur2,
        },
      ].filter((actor) => actor.nom);
    },
  },
  mounted() {
    this.fetchIncidentDetails();
  },
  methods: {
    async fetchIncidentDetails() {
      const incidentId = this.$route.params.id;
      try {
        const response = await api.intel.get(incidentId);
        this.incident = response.data || {};
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des détails de l'incident :",
          error
        );
      }
    },
    formatDate(date) {
      if (!date) return "Non défini";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    safeInt(value) {
      const parsed = parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    displayNumber(value) {
      return value === null || value === undefined || value === ""
        ? "Non défini"
        : this.safeInt(value);
    },
    totalMorts(degats = {}) {
      const hasDetailed = ["morts_civils", "morts_allies", "morts_ennemis"].some(
        (key) => degats && degats[key] !== null && degats[key] !== undefined && degats[key] !== ""
      );
      if (!hasDetailed && degats?.morts !== undefined) return this.safeInt(degats.morts);
      return this.safeInt(degats?.morts_civils) +
        this.safeInt(degats?.morts_allies) +
        this.safeInt(degats?.morts_ennemis);
    },
    totalBlesses(degats = {}) {
      const hasDetailed = ["blesses_civils", "blesses_allies", "blesses_ennemis"].some(
        (key) => degats && degats[key] !== null && degats[key] !== undefined && degats[key] !== ""
      );
      if (!hasDetailed && degats?.blesses !== undefined) return this.safeInt(degats.blesses);
      return this.safeInt(degats?.blesses_civils) +
        this.safeInt(degats?.blesses_allies) +
        this.safeInt(degats?.blesses_ennemis);
    },
    validateIncident(isValid) {
      // Placeholder function for validation action
      if (isValid) {
        console.log("Incident validé avec succès.");
      } else {
        console.log("Demande de plus d'éléments pour cet incident.");
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  max-width: 900px;
  margin: auto;
}

.v-col {
  margin-bottom: 16px;
}

.v-card-title {
  font-weight: bold;
}

.actors-detail-list {
  margin-top: 12px;
  border-top: 1px solid #e0e5eb;
}

.actor-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e0e5eb;
}

.actor-detail-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  background: #f1f3f6;
  color: #455a64;
  font-size: 0.75rem;
  font-weight: 700;
}

.actor-detail-name {
  color: #263238;
}

.actor-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin-top: 4px;
  color: #607d8b;
  font-size: 0.85rem;
}
</style>
