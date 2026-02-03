<template>
  <v-container fluid class="mt-5">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- Card to display actor details -->
        <v-card v-if="actor">
          <!-- Photo Section -->
          <v-row justify="center">
            <v-col cols="12" class="text-center">
              <v-avatar size="250">
                <v-img
                  v-if="actor.photo_url"
                  :src="`http://localhost:5000/uploads/${actor.photo_url}`"
                  alt="Photo de profil"
                />
                <v-icon v-else size="250" color="grey">mdi-account</v-icon>
              </v-avatar>
            </v-col>
          </v-row>

          <v-card-title>{{ actor.nom_complet }}</v-card-title>
          <v-card-subtitle
            >{{ actor.position_actuelle }} à {{ actor.pays }}</v-card-subtitle
          >

          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <strong>Date de naissance :</strong>
                {{ formatDate(actor.date_de_naissance) || "Non défini" }}
              </v-col>
              <v-col cols="12" sm="6">
                <strong>Organisation :</strong>
                {{ actor.organisation || "Non défini" }}
              </v-col>

              <!-- Biographie -->
              <v-col cols="12">
                <strong>Biographie :</strong>
                <p>{{ actor.biographie || "Non défini" }}</p>
              </v-col>

              <!-- Parcours politique -->
              <v-col
                cols="12"
                v-if="
                  actor.parcours_politiques && actor.parcours_politiques.length
                "
              >
                <v-card class="my-4">
                  <v-card-title>Parcours politique</v-card-title>
                  <v-card-text>
                    <v-row
                      v-for="parcours in actor.parcours_politiques"
                      :key="parcours.parti"
                    >
                      <v-col cols="12" sm="4"
                        ><strong>Parti :</strong> {{ parcours.parti }}</v-col
                      >
                      <v-col cols="12" sm="4"
                        ><strong>Rôle :</strong> {{ parcours.role }}</v-col
                      >
                      <v-col cols="12" sm="4">
                        <strong>Période :</strong>
                        {{ formatDate(parcours.date_adhesion) }} -
                        {{ formatDate(parcours.date_depart) || "Présent" }}
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Événements Importants -->
              <v-col
                cols="12"
                v-if="
                  actor.evenements_importants &&
                  actor.evenements_importants.length
                "
              >
                <v-card class="my-4">
                  <v-card-title>Événements Importants</v-card-title>
                  <v-card-text>
                    <v-row
                      v-for="event in actor.evenements_importants"
                      :key="event.titre"
                    >
                      <v-col cols="12" sm="4"
                        ><strong>Titre :</strong> {{ event.titre }}</v-col
                      >
                      <v-col cols="12" sm="4"
                        ><strong>Date :</strong>
                        {{ formatDate(event.date) }}</v-col
                      >
                      <v-col cols="12" sm="4"
                        ><strong>Description :</strong>
                        {{ event.description }}</v-col
                      >
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Position Politique -->
              <v-col cols="12" v-if="actor.position_politique">
                <v-card class="my-4">
                  <v-card-title>Position Politique</v-card-title>
                  <v-card-text>{{
                    actor.position_politique || "Non défini"
                  }}</v-card-text>
                </v-card>
              </v-col>

              <!-- Contacts -->
              <v-col cols="12" v-if="actor.contacts">
                <v-card class="my-4">
                  <v-card-title>Contacts</v-card-title>
                  <v-card-text>
                    <strong>Email :</strong>
                    {{ actor.contacts.email || "Non défini" }}<br />
                    <strong>Réseaux Sociaux :</strong>
                    <ul
                      v-if="
                        actor.contacts.reseaux_sociaux &&
                        actor.contacts.reseaux_sociaux.length
                      "
                    >
                      <li
                        v-for="reseau in actor.contacts.reseaux_sociaux"
                        :key="reseau.platforme"
                      >
                        {{ reseau.platforme }}:
                        <a :href="reseau.lien">{{ reseau.lien }}</a>
                      </li>
                    </ul>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Historique de Carrière -->
              <v-col
                cols="12"
                v-if="
                  actor.historique_carriere && actor.historique_carriere.length
                "
              >
                <v-card class="my-4">
                  <v-card-title>Historique de Carrière</v-card-title>
                  <v-card-text>
                    <v-row
                      v-for="poste in actor.historique_carriere"
                      :key="poste.poste"
                    >
                      <v-col cols="12" sm="4"
                        ><strong>Poste :</strong> {{ poste.poste }}</v-col
                      >
                      <v-col cols="12" sm="4"
                        ><strong>Organisation :</strong>
                        {{ poste.organisation }}</v-col
                      >
                      <v-col cols="12" sm="4">
                        <strong>Période :</strong>
                        {{ formatDate(poste.date_debut) }} -
                        {{ formatDate(poste.date_fin) || "Présent" }}
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Relations Diplomatiques -->
              <v-col
                cols="12"
                v-if="
                  actor.relations_diplomatiques &&
                  actor.relations_diplomatiques.length
                "
              >
                <v-card class="my-4">
                  <v-card-title>Relations Diplomatiques</v-card-title>
                  <v-card-text>
                    <v-row
                      v-for="relation in actor.relations_diplomatiques"
                      :key="relation.pays"
                    >
                      <v-col cols="12" sm="6"
                        ><strong>Pays :</strong> {{ relation.pays }}</v-col
                      >
                      <v-col cols="12" sm="6"
                        ><strong>Type de relation :</strong>
                        {{ relation.relation_type }}</v-col
                      >
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Conflits et Controverses -->
              <v-col
                cols="12"
                v-if="
                  actor.conflits_controverses &&
                  actor.conflits_controverses.length
                "
              >
                <v-card class="my-4">
                  <v-card-title>Conflits et Controverses</v-card-title>
                  <v-card-text>
                    <v-row
                      v-for="conflit in actor.conflits_controverses"
                      :key="conflit.titre"
                    >
                      <v-col cols="12" sm="4"
                        ><strong>Titre :</strong> {{ conflit.titre }}</v-col
                      >
                      <v-col cols="12" sm="4"
                        ><strong>Date :</strong>
                        {{ formatDate(conflit.date) }}</v-col
                      >
                      <v-col cols="12" sm="4"
                        ><strong>Description :</strong>
                        {{ conflit.description }}</v-col
                      >
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- État civil -->
              <v-col cols="12" v-if="actor.etat_civil">
                <v-card class="my-4">
                  <v-card-title>État civil</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <strong>Statut matrimonial :</strong>
                        {{
                          actor.etat_civil?.statut_matrimonial || "Non défini"
                        }}
                      </v-col>
                      <!-- Conjoints -->
                      <v-col
                        cols="12"
                        v-if="
                          actor.etat_civil.conjoints &&
                          actor.etat_civil.conjoints.length
                        "
                      >
                        <strong>Conjoints :</strong>
                        <ul>
                          <li
                            v-for="conjoint in actor.etat_civil.conjoints"
                            :key="conjoint.nom"
                          >
                            {{ conjoint.nom }} - Né le
                            {{ formatDate(conjoint.date_naissance) }} -
                            {{ conjoint.contact || "Non défini" }}
                          </li>
                        </ul>
                      </v-col>
                      <!-- Enfants -->
                      <v-col
                        cols="12"
                        v-if="
                          actor.etat_civil.enfants &&
                          actor.etat_civil.enfants.length
                        "
                      >
                        <strong>Enfants :</strong>
                        <ul>
                          <li
                            v-for="enfant in actor.etat_civil.enfants"
                            :key="enfant.nom"
                          >
                            {{ enfant.nom }} - Né le
                            {{ formatDate(enfant.date_naissance) }} -
                            {{ enfant.contact || "Non défini" }}
                          </li>
                        </ul>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Error message if the actor is not found -->
        <v-alert v-else type="error">Acteur non trouvé</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      actor: null, // Store the actor data fetched from Elasticsearch
    };
  },
  created() {
    this.fetchActor();
  },
  methods: {
    // Fetch actor details based on the ID from the route
    async fetchActor() {
      const id = this.$route.params.id; // Get the actor's ID from the URL
      try {
        const response = await axios.get(
          `http://localhost:9200/lisu_acteurs_pol_diplo/_doc/${id}`,
          {
            auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        }, // Use your Elasticsearch credentials
          }
        );
        this.actor = response.data._source; // Assign the fetched actor data
      } catch (error) {
        console.error("Erreur lors de la récupération de l'acteur:", error);
      }
    },
    // Function to format dates
    formatDate(date) {
      if (!date) return "Non défini";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    },
  },
};
</script>

<style scoped>
.v-card {
  margin-bottom: 24px;
}

.v-card-title {
  font-weight: bold;
  font-size: 1.5rem;
}

.v-alert {
  margin-top: 20px;
}

.v-avatar {
  margin-bottom: 20px;
}
</style>
