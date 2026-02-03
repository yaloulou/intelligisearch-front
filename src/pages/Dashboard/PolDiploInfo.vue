<template>
  <v-container fluid class="mt-5">
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      top
      right
    >
      {{ snackbarMessage }}
    </v-snackbar>
    <v-card class="pa-5" elevation="3">
      <v-card-title class="headline">
        Création de profil d'un acteur politique/diplomatique
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <!-- Nom Complet -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="actor.nom_complet"
                label="Nom Complet"
                outlined
                :rules="[(v) => !!v || 'Ce champ est requis']"
                required
              ></v-text-field>
            </v-col>

            <!-- Position Actuelle -->
            <!-- <v-col cols="12" md="6">
              <v-text-field
                v-model="actor.position_actuelle"
                label="Position Actuelle"
                outlined
                :rules="[(v) => !!v || 'Ce champ est requis']"
                required
              ></v-text-field>
            </v-col> -->

            <!-- Pays -->
            <v-col cols="12" md="4">
              <v-select
                v-model="actor.pays"
                :items="countryOptions"
                label="Pays"
                outlined
                :rules="[(v) => !!v || 'Ce champ est requis']"
                required
              ></v-select>
            </v-col>

            <!-- Organisation -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="actor.organisation"
                label="Organisation"
                outlined
                :rules="[(v) => !!v || 'Ce champ est requis']"
                required
              ></v-text-field>
            </v-col>

            <!-- Biographie -->
            <v-col cols="12">
              <v-textarea
                v-model="actor.biographie"
                label="Biographie"
                outlined
                :rules="[(v) => !!v || 'Ce champ est requis']"
                required
              ></v-textarea>
            </v-col>

            <!-- Date de Naissance -->
            <v-col cols="12" md="6">
              <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="actor.date_de_naissance"
                    label="Date de Naissance"
                    outlined
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    :rules="[(v) => !!v || 'Ce champ est requis']"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="actor.date_de_naissance"
                  @input="menu = false"
                ></v-date-picker>
              </v-menu>
            </v-col>

            <!-- Dangérosité (Hostilité) -->
            <v-col cols="12" md="6">
              <v-slider
                v-model="actor.hostilite"
                label="Niveau de Ménace"
                min="0"
                max="3"
                step="1"
                thumb-label="always"
                ticks="always"
                outlined
              ></v-slider>
            </v-col>

            <!-- Roles Section -->
            <v-col cols="12">
              <v-select
                v-model="actor.role"
                :items="roleOptions"
                label="Rôles Actuels"
                outlined
                multiple
                :rules="[(v) => !!v || 'Sélectionner au moins un rôle']"
              ></v-select>
            </v-col>

            <!-- Sélection de Photo -->
            <v-col cols="12" md="6">
              <v-file-input
                v-model="selectedPhoto"
                label="Sélectionner une photo"
                outlined
                prepend-icon="mdi-camera"
                accept="image/*"
                @change="onPhotoSelected"
                :rules="[(v) => !!v || 'Une photo est requise']"
              ></v-file-input>
              <v-img
                v-if="actor.photoPreview"
                :src="actor.photoPreview"
                max-height="200px"
                contain
                class="mt-3"
              ></v-img>
            </v-col>
          </v-row>

          <!-- Événements Importants -->
          <v-row>
            <v-col cols="12">
              <h3>Événements Importants</h3>
              <v-btn color="primary" @click="addEvenement">
                <v-icon left>mdi-plus</v-icon> Ajouter un événement
              </v-btn>
              <v-row
                v-for="(evenement, index) in actor.evenements_importants"
                :key="index"
                class="mt-3"
              >
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="evenement.titre"
                    label="Titre de l'événement"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-textarea
                    v-model="evenement.description"
                    label="Description de l'événement"
                    outlined
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="4">
                  <v-menu
                    ref="menu"
                    v-model="evenement.date_menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="evenement.date"
                        label="Date"
                        readonly
                        outlined
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="evenement.date"
                      @input="evenement.date_menu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Historique de Carrière -->
          <v-row>
            <v-col cols="12">
              <h3>Historique de Carrière</h3>
              <v-btn color="primary" @click="addHistoriqueCarriere">
                <v-icon left>mdi-plus</v-icon> Ajouter un poste
              </v-btn>
              <v-row
                v-for="(poste, index) in actor.historique_carriere"
                :key="index"
                class="mt-3"
              >
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="poste.poste"
                    label="Poste"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="poste.organisation"
                    label="Organisation"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-menu
                    ref="menu"
                    v-model="poste.date_debut_menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="poste.date_debut"
                        label="Date de Début"
                        readonly
                        outlined
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="poste.date_debut"
                      @input="poste.date_debut_menu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="2">
                  <v-menu
                    ref="menu"
                    v-model="poste.date_fin_menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="poste.date_fin"
                        label="Date de Fin"
                        readonly
                        outlined
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="poste.date_fin"
                      @input="poste.date_fin_menu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Contacts -->
          <v-row>
            <v-col cols="12">
              <h3>Contacts</h3>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="actor.contacts.telephone"
                label="Numéro de Téléphone"
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="actor.contacts.email"
                label="Email"
                outlined
              ></v-text-field>
            </v-col>

            <!-- État Civil -->
            <v-row>
              <v-col cols="12">
                <h3>État Civil</h3>
              </v-col>

              <!-- Statut Matrimonial -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="actor.etat_civil.statut_matrimonial"
                  :items="[
                    'Célibataire',
                    'Marié(e)',
                    'Divorcé(e)',
                    'Veuf/Veuve',
                  ]"
                  label="Statut Matrimonial"
                  outlined
                ></v-select>
              </v-col>

              <!-- Conjoints -->
              <v-col cols="12">
                <h4>Conjoints</h4>
                <v-btn color="primary" @click="addConjoint">
                  <v-icon left>mdi-plus</v-icon> Ajouter un conjoint
                </v-btn>
                <v-row
                  v-for="(conjoint, index) in actor.etat_civil.conjoints"
                  :key="index"
                  class="mt-3"
                >
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="conjoint.nom"
                      label="Nom du conjoint"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-menu
                      ref="menu"
                      v-model="conjoint.date_naissance_menu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="conjoint.date_naissance"
                          label="Date de Naissance"
                          readonly
                          outlined
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="conjoint.date_naissance"
                        @input="conjoint.date_naissance_menu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="conjoint.contact"
                      label="Contact du conjoint"
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Enfants -->
              <v-col cols="12">
                <h4>Enfants</h4>
                <v-btn color="primary" @click="addEnfant">
                  <v-icon left>mdi-plus</v-icon> Ajouter un enfant
                </v-btn>
                <v-row
                  v-for="(enfant, index) in actor.etat_civil.enfants"
                  :key="index"
                  class="mt-3"
                >
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="enfant.nom"
                      label="Nom de l'enfant"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-menu
                      ref="menu"
                      v-model="enfant.date_naissance_menu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="enfant.date_naissance"
                          label="Date de Naissance"
                          readonly
                          outlined
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="enfant.date_naissance"
                        @input="enfant.date_naissance_menu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="enfant.contact"
                      label="Contact de l'enfant"
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Réseaux Sociaux -->
            <v-col cols="12">
              <v-btn color="primary" @click="addReseauSocial">
                <v-icon left>mdi-plus</v-icon> Ajouter Réseau Social
              </v-btn>
              <v-row
                v-for="(reseau, index) in actor.contacts.reseaux_sociaux"
                :key="index"
                class="mt-3"
              >
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="reseau.platforme"
                    label="Plateforme"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="reseau.lien"
                    label="Lien"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Bouton de soumission -->
          <v-row>
            <v-col cols="12" class="text-center">
              <v-btn color="primary" @click="submitForm" :disabled="!valid">
                <v-icon left>mdi-send</v-icon> Soumettre
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      valid: false,
      menu: false,
      selectedPhoto: null, // The selected photo file
      actor: {
        nom_complet: "",
        position_actuelle: "",
        pays: "",
        organisation: "",
        biographie: "",
        date_de_naissance: "",
        hostilite: 0, // Default danger level
        role: [],
        photo_url: null, // Will store the photo name/URL
        photoPreview: null, // For displaying the selected image
        evenements_importants: [],
        historique_carriere: [],
        contacts: {
          telephone: "",
          email: "",
          reseaux_sociaux: [],
        },
        etat_civil: {
          statut_matrimonial: "",
          conjoints: [],
          enfants: [],
        },
      },
      snackbar: false,
      snackbarMessage: "",
      snackbarColor: "",
      roleOptions: ["député", "ministre", "sénateur"],
      countryOptions: [
        "Afghanistan",
        "Albanie",
        "Algérie",
        "Andorre",
        "Angola",
        "Antigua-et-Barbuda",
        "Argentine",
        "Arménie",
        "Australie",
        "Autriche",
        "Azerbaïdjan",
        "Bahamas",
        "Bahreïn",
        "Bangladesh",
        "Barbade",
        "Biélorussie",
        "Belgique",
        "Bénin",
        "Bhoutan",
        "Bolivie",
        "Bosnie-Herzégovine",
        "Botswana",
        "Brésil",
        "Brunei",
        "Bulgarie",
        "Burkina Faso",
        "Burundi",
        "Cambodge",
        "Cameroun",
        "Canada",
        "Cap-Vert",
        "République centrafricaine",
        "Tchad",
        "Chili",
        "Chine",
        "Colombie",
        "Comores",
        "Congo",
        "République Démocratique du Congo",
        "Costa Rica",
        // Add more countries as needed
      ],
    };
  },
  methods: {
    onPhotoSelected(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedPhoto = file;
        this.actor.photoPreview = URL.createObjectURL(file); // Preview the image
      }
    },
    async uploadPhoto() {
      if (!this.selectedPhoto) return null;

      const formData = new FormData();
      formData.append("photo", this.selectedPhoto); // Add the photo file

      try {
        const response = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Return the uploaded photo URL
        return response.data.filename; // Assuming the server returns the filename
      } catch (error) {
        console.error("Error uploading the photo:", error);
        this.showSnackbar("Erreur lors de l'envoi de la photo", "error");
        return null;
      }
    },
    addEvenement() {
      this.actor.evenements_importants.push({
        titre: "",
        description: "",
        date: "",
        date_menu: false,
      });
    },
    addHistoriqueCarriere() {
      this.actor.historique_carriere.push({
        poste: "",
        organisation: "",
        date_debut: "",
        date_fin: "",
        date_debut_menu: false,
        date_fin_menu: false,
      });
    },
    addConjoint() {
      this.actor.etat_civil.conjoints.push({
        nom: "",
        date_naissance: "",
        contact: "",
        date_naissance_menu: false,
      });
    },
    addEnfant() {
      this.actor.etat_civil.enfants.push({
        nom: "",
        date_naissance: "",
        contact: "",
        date_naissance_menu: false,
      });
    },
    addReseauSocial() {
      this.actor.contacts.reseaux_sociaux.push({
        platforme: "",
        lien: "",
      });
    },
    async submitForm() {
      if (this.valid) {
        try {
          // First, upload the photo if selected
          const photoUrl = await this.uploadPhoto();
          if (photoUrl) {
            this.actor.photo_url = photoUrl; // Save the photo name/URL in actor data
          }

          /* const username = "elastic";
          const password = "Lisu2024";
 */
          const response = await axios.post(
            "http://localhost:9200/lisu_acteurs_pol_diplo/_doc",
            this.actor, // Send actor data to Elasticsearch
            {
              auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 201 || response.status === 200) {
            this.showSnackbar("Données enregistrées avec succès", "success");
          } else {
            this.showSnackbar(
              "Erreur lors de l'enregistrement des données",
              "error"
            );
          }
        } catch (error) {
          console.error("Erreur lors de l'enregistrement des données:", error);
          this.showSnackbar(
            "Erreur de communication avec Elasticsearch",
            "error"
          );
        }
      } else {
        this.showSnackbar(
          "Veuillez compléter tous les champs obligatoires",
          "warning"
        );
      }
    },
    showSnackbar(message, type) {
      this.snackbarMessage = message;
      this.snackbarColor =
        type === "success" ? "green" : type === "error" ? "red" : "orange";
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.mt-5 {
  margin-top: 40px;
}

.v-file-input {
  cursor: pointer;
}

.v-img {
  max-width: 150px;
}
</style>
