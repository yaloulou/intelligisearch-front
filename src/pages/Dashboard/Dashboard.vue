<template>
  <v-container fluid class="dashboard-container">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="header-section">
          <h1 class="display-2 font-weight-bold mb-2">
            Enregistrement de Renseignements Sécuritaires
          </h1>
          <p class="subtitle-1">
            Collectez et documentez les incidents de sécurité en détail
          </p>
        </div>
      </v-col>
    </v-row>

    <v-card class="elevation-3 form-card">
      <v-card-text class="pa-8">
        <v-form ref="form" v-model="formValid" lazy-validation>
          <!-- Section 1: Contexte Géographique -->
          <div class="section-container mb-8">
            <h2 class="section-header mb-6">
              Contexte Géographique
            </h2>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.province_region"
                  label="Province/Région"
                  outlined
                  dense
                  :rules="[rules.required]"
                  placeholder="Ex: Nord-Kivu, Kasai..."
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.territoire_ville"
                  label="Territoire/Ville"
                  outlined
                  dense
                  :rules="[rules.required]"
                  placeholder="Ex: Goma, Bukavu..."
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.secteur_chefferie_commune"
                  label="Secteur/Chefferie/Commune"
                  outlined
                  dense
                  placeholder="Secteur administratif"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.groupement_quartier"
                  label="Groupement/Quartier"
                  outlined
                  dense
                  placeholder="Groupement ou quartier"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.localite_village_lieuprecis"
                  label="Lieu Précis (Village/Localité)"
                  outlined
                  dense
                  :rules="[rules.required]"
                  placeholder="Décrivez le lieu exact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.latitude"
                  label="Latitude (optionnel)"
                  type="number"
                  outlined
                  dense
                  step="0.0001"
                  placeholder="Ex: -2.5"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.longitude"
                  label="Longitude (optionnel)"
                  type="number"
                  outlined
                  dense
                  step="0.0001"
                  placeholder="Ex: 28.5"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.pays"
                  label="Pays"
                  outlined
                  dense
                  placeholder="Ex: République Démocratique du Congo"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Section 2: Détails de l'Incident -->
          <v-divider class="my-6"></v-divider>
          
          <div class="section-container mb-8">
            <h2 class="section-header mb-6">
              Détails de l'Incident
            </h2>

            <v-row>
              <v-col cols="12" md="6">
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="form.date_event"
                      label="Date de l'Incident"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      outlined
                      dense
                      :rules="[rules.required]"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="form.date_event"
                    no-title
                    @input="menu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.event"
                  label="Type d'Événement"
                  outlined
                  dense
                  :rules="[rules.required]"
                  placeholder="Ex: Expulsion, Attaque, Cambriolage..."
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.geoprecision"
                  label="Précision Géographique"
                  outlined
                  dense
                  placeholder="Ex: Très précis, Approximatif..."
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.source"
                  label="Source d'Information"
                  outlined
                  dense
                  placeholder="Ex: Témoin direct, Rapport officiel..."
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="form.categorie"
              label="Catégorie de l'Incident"
              outlined
              dense
              class="mb-4"
              placeholder="Ex: Violence, Déplacement, Conflit..."
            ></v-text-field>

            <v-textarea
              v-model="form.description"
              label="Description Détaillée de l'Incident"
              outlined
              dense
              rows="4"
              :rules="[rules.required]"
              counter
              maxlength="2000"
              placeholder="Décrivez l'incident en détail..."
            ></v-textarea>
          </div>

          <!-- Section 3: Acteurs Impliqués -->
          <v-divider class="my-6"></v-divider>

          <div class="section-container mb-8">
            <h2 class="section-header mb-6">
              Acteurs Impliqués
            </h2>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.acteur1"
                  label="Acteur Principal"
                  outlined
                  dense
                  :rules="[rules.required]"
                  placeholder="Ex: Forces de sécurité, Milices armées..."
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.assoc_acteur1"
                  label="Acteur Associé 1"
                  outlined
                  dense
                  :rules="[rules.required]"
                  placeholder="Entité associée"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.acteur2"
                  label="Acteur Secondaire (optionnel)"
                  outlined
                  dense
                  placeholder="Deuxième acteur impliqué"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.assoc_acteur2"
                  label="Acteur Associé 2"
                  outlined
                  dense
                  :rules="[rules.required]"
                  placeholder="Entité associée"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Section 4: Dégâts Humains -->
          <v-divider class="my-6"></v-divider>

          <div class="section-container mb-8">
            <h2 class="section-header mb-6">
              Dégâts Humains
            </h2>

            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.morts"
                  label="Nombre de Morts"
                  type="number"
                  outlined
                  dense
                  :rules="[rules.nonNegative]"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.blesses"
                  label="Nombre de Blessés"
                  type="number"
                  outlined
                  dense
                  :rules="[rules.nonNegative]"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.enleves_disparus"
                  label="Nombre de Disparus"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.expulses"
                  label="Nombre d'Expulsés"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Section 5: Dégâts Matériels -->
          <v-divider class="my-6"></v-divider>

          <div class="section-container mb-8">
            <h2 class="section-header mb-6">
              Dégâts Matériels
            </h2>

            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model.number="form.degats_materiels.degat_vehicules"
                  label="Véhicules Endommagés"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model.number="form.degats_materiels.degat_batiments"
                  label="Bâtiments Endommagés"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model.number="form.degats_materiels.degat_infrastructures"
                  label="Infrastructures Endommagées"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="form.degats_materiels.autres_degats"
              label="Autres Dégâts"
              outlined
              dense
              rows="3"
              counter
              maxlength="1000"
              placeholder="Décrivez les autres dégâts matériels..."
            ></v-textarea>
          </div>

          <!-- Boutons d'action -->
          <v-divider class="my-6"></v-divider>

          <v-row class="mt-8">
            <v-col cols="12" class="d-flex gap-3">
              <v-btn
                color="primary"
                size="large"
                @click="submitForm"
                :loading="submitting"
                :disabled="!formValid || submitting"
              >
                Enregistrer les données
              </v-btn>
              <v-btn
                outlined
                color="primary"
                size="large"
                @click="resetForm"
              >
                Réinitialiser
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Dialog de confirmation - Succès -->
    <v-dialog v-model="successDialog" max-width="500" persistent>
      <v-card class="success-card">
        <v-card-text class="text-center pa-8">
          <h2 class="headline font-weight-bold mb-4">Succès !</h2>
          <p class="body-1 mb-6">
            Les données ont été enregistrées avec succès dans la base de données.
          </p>
          <p class="caption grey--text">
            ID du document: <code class="font-weight-bold">{{ documentId }}</code>
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeSuccessDialog">
            Fermer
          </v-btn>
          <v-btn color="primary" @click="submitAnotherForm">
            Ajouter un autre incident
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog d'erreur -->
    <v-dialog v-model="errorDialog" max-width="500">
      <v-card class="error-card">
        <v-card-text class="text-center pa-8">
          <h2 class="headline font-weight-bold mb-4">Erreur</h2>
          <p class="body-1 mb-4">{{ errorMessage }}</p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="errorDialog = false">
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      formValid: false,
      form: {
        // Contexte géographique
        province_region: "",
        territoire_ville: "",
        secteur_chefferie_commune: "",
        groupement_quartier: "",
        localite_village_lieuprecis: "",
        latitude: null,
        longitude: null,
        pays: "République Démocratique du Congo",
        
        // Détails de l'incident
        date_event: "",
        event: "",
        geoprecision: "",
        source: "",
        categorie: "",
        description: "",
        
        // Acteurs impliqués
        acteur1: "",
        acteur2: "",
        assoc_acteur1: "",
        assoc_acteur2: "",
        
        // Dégâts
        degats_humains: {
          morts: 0,
          blesses: 0,
          enleves_disparus: 0,
          expulses: 0,
        },
        degats_materiels: {
          degat_vehicules: 0,
          degat_batiments: 0,
          degat_infrastructures: 0,
          autres_degats: "",
        },
      },
      rules: {
        required: (v) => !!v || "Ce champ est obligatoire",
        nonNegative: (v) => v >= 0 || "La valeur doit être positive",
      },
      menu: false,
      successDialog: false,
      errorDialog: false,
      submitting: false,
      documentId: null,
      errorMessage: "",
    };
  },
  methods: {
    submitForm() {
      if (!this.$refs.form.validate()) {
        this.showError("Veuillez corriger les erreurs du formulaire.");
        return;
      }

      this.submitting = true;

      const authOptions = {
        auth: {
          username: "elastic",
          password: "ZuCI2sJBt3M=CMph9Y47",
        },
      };

      // Conversion des types numériques
      const dataToSubmit = {
        ...this.form,
        degats_humains: {
          morts: parseInt(this.form.degats_humains.morts) || 0,
          blesses: parseInt(this.form.degats_humains.blesses) || 0,
          enleves_disparus: parseInt(this.form.degats_humains.enleves_disparus) || 0,
          expulses: parseInt(this.form.degats_humains.expulses) || 0,
        },
        degats_materiels: {
          degat_vehicules: parseInt(this.form.degats_materiels.degat_vehicules) || 0,
          degat_batiments: parseInt(this.form.degats_materiels.degat_batiments) || 0,
          degat_infrastructures: parseInt(this.form.degats_materiels.degat_infrastructures) || 0,
          autres_degats: this.form.degats_materiels.autres_degats,
        },
        latitude: this.form.latitude ? parseFloat(this.form.latitude) : null,
        longitude: this.form.longitude ? parseFloat(this.form.longitude) : null,
      };

      axios
        .post(
          "http://41.79.235.212:9200/intel_v1/_doc/",
          dataToSubmit,
          authOptions
        )
        .then((response) => {
          console.log("✅ Données enregistrées avec succès:", response.data);
          this.documentId = response.data._id;
          this.successDialog = true;
          this.submitting = false;
        })
        .catch((error) => {

          console.error("❌ Erreur lors de l'envoi des données:", error);
          this.showError(
            error.response?.data?.error?.reason ||
            "Erreur lors de l'enregistrement des données. Veuillez vérifier votre connexion."
          );
          this.submitting = false;
        });
    },

    resetForm() {
      this.$refs.form.reset();
      this.form = {
        // Contexte géographique
        province_region: "",
        territoire_ville: "",
        secteur_chefferie_commune: "",
        groupement_quartier: "",
        localite_village_lieuprecis: "",
        latitude: null,
        longitude: null,
        pays: "République Démocratique du Congo",
        
        // Détails de l'incident
        date_event: "",
        event: "",
        geoprecision: "",
        source: "",
        categorie: "",
        description: "",
        
        // Acteurs impliqués
        acteur1: "",
        acteur2: "",
        assoc_acteur1: "",
        assoc_acteur2: "",
        
        // Dégâts
        degats_humains: {
          morts: 0,
          blesses: 0,
          enleves_disparus: 0,
          expulses: 0,
        },
        degats_materiels: {
          degat_vehicules: 0,
          degat_batiments: 0,
          degat_infrastructures: 0,
          autres_degats: "",
        },
      };
    },

    closeSuccessDialog() {
      this.successDialog = false;
    },

    submitAnotherForm() {
      this.closeSuccessDialog();
      this.resetForm();
      // Scroll vers le haut
      this.$vuetify.goTo(0);
    },

    showError(message) {
      this.errorMessage = message;
      this.errorDialog = true;
    },
  },
};
</script>

<style scoped>
.dashboard-container {
  background: #ffffff;
  min-height: 100vh;
  padding: 2rem 0;
}

/* Header Section */
.header-section {
  background: #ffffff;
  color: #333;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.header-section h1 {
  margin: 0;
  font-size: 2rem;
}

.header-section p {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 0.95rem;
}

/* Form Card */
.form-card {
  border-radius: 0;
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e0e0e0;
}

/* Section Container */
.section-container {
  padding: 2rem;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.section-header {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
  margin: 0;
}

/* Input Fields */
.v-text-field,
.v-textarea,
.v-select {
  margin-bottom: 1rem;
}

/* Buttons */
.v-btn {
  border-radius: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* Success Card */
.success-card {
  border-radius: 0;
  border-top: none;
}

.success-card code {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 0;
  font-family: monospace;
}

/* Error Card */
.error-card {
  border-radius: 0;
  border-top: none;
}

/* Divider */
.v-divider {
  margin: 0;
  border-color: #e0e0e0;
}

/* Responsive */
@media (max-width: 960px) {
  .header-section {
    padding: 1.5rem;
  }

  .header-section h1 {
    font-size: 1.5rem;
  }

  .section-container {
    padding: 1.5rem;
  }

  .section-header {
    font-size: 1.1rem;
  }

  .form-card {
    margin: 0 1rem;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 1rem 0;
  }

  .header-section {
    padding: 1rem;
  }

  .header-section h1 {
    font-size: 1.25rem;
  }

  .section-container {
    padding: 1rem;
  }

  .section-header {
    font-size: 1rem;
  }

  .gap-3 {
    gap: 0.5rem !important;
  }

  .v-btn {
    width: 100%;
  }
}

/* Utility classes */
.gap-3 {
  gap: 1rem;
}
</style>
