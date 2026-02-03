<template>
  <v-container fluid class="mt-5">
    <!-- Search Bar -->
    <!-- Search Bar -->
    <v-row justify="center" class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="Rechercher un acteur"
          append-icon="mdi-magnify"
          @keyup.enter="searchActor"
          outlined
          dense
          placeholder="Entrez le nom complet"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Filters Section -->
    <v-row justify="center" class="mb-4">
      <!-- Role Filter -->
      <v-col cols="12" md="4" class="d-flex align-center mb-2">
        <v-select
          v-model="searchRole"
          :items="roleOptions"
          label="Filtrer par rôle"
          outlined
          dense
          class="flex-grow-1"
        ></v-select>
        <v-icon
          v-if="searchRole"
          @click="resetRoleFilter"
          color="red"
          class="ml-2 cursor-pointer"
        >
          mdi-close-circle
        </v-icon>
      </v-col>

      <!-- Hostilité Filter -->
      <v-col cols="12" md="4" class="d-flex align-center mb-2">
        <v-select
          v-model="searchHostilite"
          :items="hostiliteOptions"
          label="Niveau d'hostilité"
          outlined
          dense
          class="flex-grow-1"
        ></v-select>
        <v-icon
          v-if="searchHostilite !== null"
          @click="resetHostiliteFilter"
          color="red"
          class="ml-2 cursor-pointer"
        >
          mdi-close-circle
        </v-icon>
      </v-col>
    </v-row>

    <!-- Search Button -->
    <v-row justify="center" class="mb-4">
      <v-col cols="12" md="4">
        <v-btn
          @click="searchActor"
          color="primary"
          block
          class="search-button elevation-2"
        >
          <v-icon left>mdi-magnify</v-icon> Rechercher
        </v-btn>
      </v-col>
    </v-row>

    <!-- Search Results Table -->
    <v-row v-if="actors.length > 0">
      <v-col cols="12">
        <v-data-table
          :headers="tableHeaders"
          :items="actors"
          :items-per-page="5"
          class="elevation-1"
        >
          <template v-slot:item.nom_complet="{ item }">
            <strong>{{ item.nom_complet }}</strong>
          </template>
          <template v-slot:item.position_actuelle="{ item }">
            {{ item.position_actuelle }}
          </template>
          <template v-slot:item.pays="{ item }">
            {{ item.pays }}
          </template>
          <template v-slot:item.organisation="{ item }">
            {{ item.organisation }}
          </template>
          <template v-slot:item.role="{ item }">
            <span v-if="item.role && item.role.length > 0">{{
              item.role.join(", ")
            }}</span>
            <span v-else>Non défini</span>
          </template>
          <template v-slot:item.hostilite="{ item }">
            <v-chip :color="getHostiliteColor(item.hostilite)" dark small>
              {{ item.hostilite }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon
              @click="openEditDialog(item)"
              color="green"
              class="cursor-pointer"
            >
              mdi-pencil
            </v-icon>
          </template>
          <template v-slot:item.details="{ item }">
            <v-icon
              @click="goToDetails(item.id)"
              color="primary"
              class="cursor-pointer"
            >
              mdi-file-document
            </v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Edit Actor Dialog -->
    <v-dialog v-model="editDialog" max-width="800px">
      <v-card>
        <v-card-title class="headline"
          >Modifier les informations de l'acteur</v-card-title
        >
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field
              v-model="editActor.nom_complet"
              label="Nom Complet"
              outlined
              dense
              required
            ></v-text-field>
            <v-text-field
              v-model="editActor.position_actuelle"
              label="Position Actuelle"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="editActor.pays"
              label="Pays"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="editActor.organisation"
              label="Organisation"
              outlined
              dense
            ></v-text-field>

            <!-- Hostilité Slider -->
            <v-row>
              <v-col cols="12">
                <v-slider
                  v-model="editActor.hostilite"
                  label="Niveau d'Alerte"
                  min="0"
                  max="3"
                  step="1"
                  thumb-label="always"
                  ticks
                  dense
                ></v-slider>
              </v-col>
            </v-row>

            <!-- Role Selection -->
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editActor.role"
                  :items="roleOptions"
                  label="Rôles Actuels"
                  outlined
                  multiple
                  dense
                ></v-select>
              </v-col>
            </v-row>

            <v-text-field
              v-model="editActor.date_de_naissance"
              label="Date de Naissance"
              outlined
              dense
              required
            ></v-text-field>
            <v-textarea
              v-model="editActor.biographie"
              label="Biographie"
              outlined
              dense
            ></v-textarea>

            <v-row justify="center">
              <v-col cols="12" class="text-center">
                <v-avatar size="150">
                  <v-img
                    v-if="editActor.photo_url"
                    :src="`http://localhost:5000/uploads/${editActor.photo_url}`"
                    alt="Photo de profil"
                  />
                  <v-icon v-else size="150" color="grey">mdi-account</v-icon>
                </v-avatar>
                <v-file-input
                  label="Télécharger une nouvelle photo"
                  v-model="newPhoto"
                  accept="image/*"
                  outlined
                  dense
                ></v-file-input>
              </v-col>
            </v-row>

            <!-- Important Events Section -->
            <v-row>
              <v-col cols="12">
                <h4>Événements Importants</h4>
                <v-btn color="primary" small @click="addImportantEvent"
                  >Ajouter un événement</v-btn
                >
                <div
                  v-for="(event, index) in editActor.evenements_importants"
                  :key="index"
                >
                  <v-text-field
                    v-model="event.titre"
                    label="Titre de l'événement"
                    outlined
                    dense
                  ></v-text-field>
                  <v-text-field
                    v-model="event.date"
                    label="Date de l'événement"
                    outlined
                    dense
                  ></v-text-field>
                  <v-textarea
                    v-model="event.description"
                    label="Description de l'événement"
                    outlined
                    dense
                  ></v-textarea>
                  <v-btn color="red" small @click="removeImportantEvent(index)"
                    >Supprimer</v-btn
                  >
                </div>
              </v-col>
            </v-row>

            <!-- Career History Section -->
            <v-row>
              <v-col cols="12">
                <h4>Carrière</h4>
                <v-btn color="primary" small @click="addCarriere"
                  >Ajouter un poste</v-btn
                >
                <div
                  v-for="(event, index) in editActor.historique_carriere"
                  :key="index"
                >
                  <v-text-field
                    v-model="event.poste"
                    label="Poste"
                    outlined
                    dense
                  ></v-text-field>
                  <v-text-field
                    v-model="event.organisation"
                    label="Organisation"
                    outlined
                    dense
                  ></v-text-field>
                  <v-text-field
                    v-model="event.date_debut"
                    label="Début"
                    outlined
                    dense
                  ></v-text-field>
                  <v-text-field
                    v-model="event.date_fin"
                    label="Fin"
                    outlined
                    dense
                  ></v-text-field>
                  <v-btn color="red" small @click="removeCarriere(index)"
                    >Supprimer</v-btn
                  >
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <h4>État Civil</h4>

                <!-- Statut Matrimonial -->
                <v-select
                  v-model="editActor.etat_civil.statut_matrimonial"
                  :items="[
                    'Célibataire',
                    'Marié(e)',
                    'Divorcé(e)',
                    'Veuf(ve)',
                    'Autre',
                  ]"
                  label="Statut Matrimonial"
                  outlined
                  dense
                ></v-select>

                <!-- Conjoints Section -->
                <v-row>
                  <v-col cols="12">
                    <h5>Conjoints</h5>
                    <v-btn color="primary" small @click="addConjoint"
                      >Ajouter un conjoint</v-btn
                    >
                    <div
                      v-for="(conjoint, index) in editActor.etat_civil
                        .conjoints"
                      :key="index"
                      class="mt-2"
                    >
                      <v-text-field
                        v-model="conjoint.nom"
                        label="Nom du conjoint"
                        outlined
                        dense
                      ></v-text-field>
                      <v-text-field
                        v-model="conjoint.date_naissance"
                        label="Date de Naissance"
                        type="date"
                        outlined
                        dense
                      ></v-text-field>
                      <v-text-field
                        v-model="conjoint.contact"
                        label="Contact"
                        outlined
                        dense
                      ></v-text-field>
                      <v-btn color="red" small @click="removeConjoint(index)"
                        >Supprimer</v-btn
                      >
                    </div>
                  </v-col>
                </v-row>

                <!-- Enfants Section -->
                <v-row>
                  <v-col cols="12">
                    <h5>Enfants</h5>
                    <v-btn color="primary" small @click="addEnfant"
                      >Ajouter un enfant</v-btn
                    >
                    <div
                      v-for="(enfant, index) in editActor.etat_civil.enfants"
                      :key="index"
                      class="mt-2"
                    >
                      <v-text-field
                        v-model="enfant.nom"
                        label="Nom de l'enfant"
                        outlined
                        dense
                      ></v-text-field>
                      <v-text-field
                        v-model="enfant.date_naissance"
                        label="Date de Naissance"
                        type="date"
                        outlined
                        dense
                      ></v-text-field>
                      <v-text-field
                        v-model="enfant.contact"
                        label="Contact"
                        outlined
                        dense
                      ></v-text-field>
                      <v-btn color="red" small @click="removeEnfant(index)"
                        >Supprimer</v-btn
                      >
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Contacts Section -->
            <v-row>
              <v-col cols="12">
                <h4>Contacts</h4>
                <v-text-field
                  v-model="editActor.contacts.email"
                  label="Email"
                  outlined
                  dense
                ></v-text-field>
                <div
                  v-for="(reseau, index) in editActor.contacts.reseaux_sociaux"
                  :key="index"
                >
                  <v-text-field
                    v-model="reseau.platforme"
                    label="Plateforme"
                    outlined
                    dense
                  ></v-text-field>
                  <v-text-field
                    v-model="reseau.lien"
                    label="Lien"
                    outlined
                    dense
                  ></v-text-field>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="saveEdit"
            >Enregistrer</v-btn
          >
          <v-btn color="red darken-1" text @click="closeEditDialog"
            >Annuler</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- No Results Message -->
    <v-row v-if="noResults && actors.length === 0">
      <v-col cols="12">
        <v-alert type="warning"
          >Aucun acteur trouvé pour "{{ searchQuery }}"</v-alert
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      searchQuery: "",
      searchRole: null,
      searchHostilite: null,
      actors: [],
      noResults: false,
      editDialog: false,
      editActor: {
        photo_url: "",
        etat_civil: {
          statut_matrimonial: "",
          conjoints: [],
        },
        conjoints: [],
        enfants: [],
        contacts: {
          email: "",
          reseaux_sociaux: [],
        },
        evenements_importants: [],
        historique_carriere: [],
      },
      newPhoto: null, // Variable to store the new photo file
      tableHeaders: [
        { text: "Nom Complet", value: "nom_complet" },
        { text: "Pays", value: "pays" },
        { text: "Organisation", value: "organisation" },
        { text: "Rôle", value: "role" },
        { text: "Alerte", value: "hostilite", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
        { text: "Détails", value: "details", sortable: false },
      ],
      roleOptions: ["député", "ministre", "sénateur", "conseiller"],
      hostiliteOptions: ["0", "1", "2", "3"],
    };
  },
  methods: {
    async searchActor() {
      try {
        // Create search query based on the fields
        let query = "";
        if (this.searchQuery) {
          query += `nom_complet:"${this.searchQuery}"`;
        }
        if (this.searchRole) {
          if (query.length > 0) query += " AND ";
          query += `role:"${this.searchRole}"`;
        }
        if (this.searchHostilite !== null) {
          if (query.length > 0) query += " AND ";
          query += `hostilite:${this.searchHostilite}`;
        }

        const response = await axios.get(
          "http://localhost:9200/lisu_acteurs_pol_diplo/_search",
          {
            auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
            params: { q: query },
          }
        );
        const hits = response.data.hits.hits;
        this.actors =
          hits.length > 0
            ? hits.map((hit) => ({ id: hit._id, ...hit._source }))
            : [];
        this.noResults = hits.length === 0;
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      }
    },
    resetRoleFilter() {
      this.searchRole = null; // Reset the role filter
      //this.searchActor(); // Re-perform the search to update the list without the role filter
    },

    resetHostiliteFilter() {
      this.searchHostilite = null; // Reset the hostilité filter
      //this.searchActor(); // Re-perform the search to update the list without the hostilité filter
    },

    getHostiliteColor(hostilite) {
      if (hostilite === 0) return "grey";
      if (hostilite === 1) return "yellow";
      if (hostilite === 2) return "orange";
      return "red";
    },
    goToDetails(id) {
      this.$router.push({ name: "ProfileDetails", params: { id } });
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString() : "Non défini";
    },
    openEditDialog(actor) {
      // Deep copy to avoid direct binding
      this.editActor = JSON.parse(JSON.stringify(actor));

      // Ensure contacts object and its properties exist
      if (!this.editActor.contacts) {
        this.editActor.contacts = { email: "", reseaux_sociaux: [] };
      } else {
        if (!this.editActor.contacts.email) {
          this.editActor.contacts.email = "";
        }
        if (!Array.isArray(this.editActor.contacts.reseaux_sociaux)) {
          this.editActor.contacts.reseaux_sociaux = [];
        }
      }

      //Etat_civil

      if (!this.editActor.etat_civil) {
        this.editActor.etat_civil = {
          statut_matrimonial: "",
          conjoints: [],
        };
      } else {
        if (!this.editActor.etat_civil.statut_matrimonial) {
          this.editActor.etat_civil.statut_matrimonial = "";
        }
        if (!Array.isArray(this.editActor.etat_civil.conjoints)) {
          this.editActor.etat_civil.conjoints = [];
        }
      }

      this.editDialog = true;
    },
    closeEditDialog() {
      this.editDialog = false;
      this.editActor = {
        etat_civil: {
          statut_matrimonial: "",
          conjoints: [],
        },
        contacts: { email: "", reseaux_sociaux: [] },
        evenements_importants: [],
        historique_carriere: [],
        role: [],
        hostilite: 0,
      };
    },
    addImportantEvent() {
      this.editActor.evenements_importants.push({
        titre: "",
        date: "",
        description: "",
      });
    },
    removeImportantEvent(index) {
      this.editActor.evenements_importants.splice(index, 1);
    },
    addCarriere() {
      this.editActor.historique_carriere.push({
        poste: "",
        organisation: "",
        date_debut: "",
        date_fin: "",
      });
    },
    addConjoint() {
      this.editActor.etat_civil.conjoints.push({
        nom: "",
        date_naissance: "",
        contact: "",
      });
    },
    removeConjoint(index) {
      this.editActor.etat_civil.conjoints.splice(index, 1);
    },
    addEnfant() {
      this.editActor.etat_civil.enfants.push({
        nom: "",
        date_naissance: "",
        contact: "",
      });
    },
    removeEnfant(index) {
      this.editActor.etat_civil.enfants.splice(index, 1);
    },
    removeCarriere(index) {
      this.editActor.historique_carriere.splice(index, 1);
    },
    async saveEdit() {
      try {
        if (this.newPhoto) {
          const formData = new FormData();
          formData.append("photo", this.newPhoto);

          const uploadResponse = await axios.post(
            "http://localhost:5000/upload",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          // Update the photo URL with the response from the server
          this.editActor.photo_url = uploadResponse.data.filename;
        }

        await axios.put(
          `http://localhost:9200/lisu_acteurs_pol_diplo/_doc/${this.editActor.id}`,
          this.editActor,
          { auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        } }
        );
        this.searchActor(); // Refresh the table with updated data
        this.closeEditDialog();
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'acteur:", error);
      }
    },
  },
};
</script>

<style scoped>
.search-button {
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.v-data-table {
  margin-top: 24px;
}

.cursor-pointer {
  cursor: pointer;
}

.v-alert {
  margin-top: 20px;
}
</style>
