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
          <v-col cols="12" sm="6">
            <strong>Acteurs impliqués :</strong>
            {{ incident.actors?.[0]?.nom || "Non défini" }} /
            {{ incident.actors?.[1]?.nom || "Non défini" }}
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
                    {{ incident.degats_humains?.morts || "Non défini" }}
                  </v-col>
                  <v-col cols="12" sm="3">
                    <strong>Nombre de blessés :</strong>
                    {{ incident.degats_humains?.blesses || "Non défini" }}
                  </v-col>
                  <v-col cols="12" sm="3">
                    <strong>Nombre de disparus :</strong>
                    {{
                      incident.degats_humains?.enleves_disparus || "Non défini"
                    }}
                  </v-col>
                  <v-col cols="12" sm="3">
                    <strong>Nombre d'expulsés :</strong>
                    {{ incident.degats_humains?.expulses || "Non défini" }}
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
                      incident.degats_materiels?.degat_infrastructures ||
                      "Non défini"
                    }}
                  </v-col>
                  <v-col cols="12" sm="4">
                    <strong>Véhicules endommagés :</strong>
                    {{
                      incident.degats_materiels?.degat_vehicules || "Non défini"
                    }}
                  </v-col>
                  <v-col cols="12" sm="4">
                    <strong>Bâtiments endommagés :</strong>
                    {{
                      incident.degats_materiels?.degat_batiments || "Non défini"
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
          <v-col cols="12">
            <v-textarea
              v-model="comment"
              label="Ajouter un commentaire"
              outlined
              dense
              placeholder="Écrivez votre commentaire ici..."
              class="mt-3"
            ></v-textarea>
          </v-col>

          <!-- Validation Buttons -->
          <v-col cols="12" class="d-flex justify-space-between mt-3">
            <v-btn color="success" @click="validateIncident(true)">
              <v-icon left>mdi-check-circle</v-icon> Valider l'information
            </v-btn>
            <v-btn color="error" @click="validateIncident(false)">
              <v-icon left>mdi-close-circle</v-icon> Demander plus d'éléments
            </v-btn>
          </v-col>
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
</style>
