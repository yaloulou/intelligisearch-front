<template>
  <v-container fluid class="dashboard-container pa-0">

    <!-- ══════════════ HERO HEADER ══════════════ -->
    <div class="hero-header">
      <div class="hero-content">
        <h1 class="hero-title">Enregistrement de Renseignements Sécuritaires</h1>
        <p class="hero-subtitle">
          Collectez et documentez les incidents de sécurité avec précision et rigueur
        </p>
        <div class="hero-chips">
          <v-chip small dark color="rgba(255,255,255,0.15)" class="mr-2">Données confidentielles</v-chip>
          <v-chip small dark color="rgba(255,255,255,0.15)">Formulaire sécurisé</v-chip>
        </div>
      </div>
    </div>

    <!-- ══════════════ PROGRESS STEPS ══════════════ -->
    <div class="steps-bar">
      <div class="step-item"><span>Géographie</span></div>
      <div class="step-separator"></div>
      <div class="step-item"><span>Incident</span></div>
      <div class="step-separator"></div>
      <div class="step-item"><span>Acteurs</span></div>
      <div class="step-separator"></div>
      <div class="step-item"><span>Dégâts humains</span></div>
      <div class="step-separator"></div>
      <div class="step-item"><span>Dégâts matériels</span></div>
    </div>

    <!-- ══════════════ MAIN FORM ══════════════ -->
    <div class="form-wrapper">
      <v-form ref="form" v-model="formValid" lazy-validation>

        <!-- ── Section 1 : Contexte Géographique ── -->
        <div class="section-card section-geo">
          <div class="section-head">
            <div>
              <span class="section-number">01</span>
              <h2 class="section-title">Contexte Géographique</h2>
            </div>
            <v-chip small class="ml-auto chip-required">Champs requis</v-chip>
          </div>

          <div class="section-body">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.province_region"
                  label="Province / Région"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-map"
                  placeholder="Ex : Nord-Kivu, Kasaï..."
                  color="blue darken-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.territoire_ville"
                  label="Territoire / Ville"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-city"
                  placeholder="Ex : Goma, Bukavu..."
                  color="blue darken-3"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.secteur_chefferie_commune"
                  label="Secteur / Chefferie / Commune"
                  outlined
                  dense
                  prepend-inner-icon="mdi-office-building"
                  placeholder="Secteur administratif"
                  color="blue darken-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.groupement_quartier"
                  label="Groupement / Quartier"
                  outlined
                  dense
                  prepend-inner-icon="mdi-home-group"
                  placeholder="Groupement ou quartier"
                  color="blue darken-3"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.localite_village_lieuprecis"
                  label="Lieu Précis — Village / Localité"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-pin"
                  placeholder="Décrivez le lieu exact de l'incident"
                  color="blue darken-3"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.pays"
                  label="Pays"
                  outlined
                  dense
                  prepend-inner-icon="mdi-flag"
                  placeholder="Ex : République Démocratique du Congo"
                  color="blue darken-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.latitude"
                  label="Latitude (optionnel)"
                  type="number"
                  outlined
                  dense
                  prepend-inner-icon="mdi-crosshairs-gps"
                  step="0.0001"
                  placeholder="Ex : −2.5000"
                  color="blue darken-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.longitude"
                  label="Longitude (optionnel)"
                  type="number"
                  outlined
                  dense
                  prepend-inner-icon="mdi-crosshairs-gps"
                  step="0.0001"
                  placeholder="Ex : 28.5000"
                  color="blue darken-3"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- ── Section 2 : Détails de l'Incident ── -->
        <div class="section-card section-incident">
          <div class="section-head">
            <div>
              <span class="section-number">02</span>
              <h2 class="section-title">Détails de l'Incident</h2>
            </div>
          </div>

          <div class="section-body">
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
                      prepend-inner-icon="mdi-calendar-alert"
                      color="deep-orange darken-1"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="form.date_event"
                    no-title
                    @input="menu = false"
                    color="deep-orange darken-1"
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
                  prepend-inner-icon="mdi-lightning-bolt"
                  placeholder="Ex : Expulsion, Attaque, Cambriolage..."
                  color="deep-orange darken-1"
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
                  prepend-inner-icon="mdi-map-search"
                  placeholder="Ex : Très précis, Approximatif..."
                  color="deep-orange darken-1"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.source"
                  label="Source d'Information"
                  outlined
                  dense
                  prepend-inner-icon="mdi-source-branch"
                  placeholder="Ex : Témoin direct, Rapport officiel..."
                  color="deep-orange darken-1"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.categorie"
                  label="Catégorie de l'Incident"
                  outlined
                  dense
                  prepend-inner-icon="mdi-tag-multiple"
                  placeholder="Ex : Violence, Déplacement, Conflit..."
                  color="deep-orange darken-1"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="form.description"
              label="Description Détaillée de l'Incident"
              outlined
              rows="5"
              :rules="[rules.required]"
              counter
              maxlength="2000"
              prepend-inner-icon="mdi-text-box-edit"
              placeholder="Décrivez l'incident avec précision : circonstances, déroulement, contexte..."
              color="deep-orange darken-1"
            ></v-textarea>
          </div>
        </div>

        <!-- ── Section 3 : Acteurs Impliqués ── -->
        <div class="section-card section-actors">
          <div class="section-head">
            <div>
              <span class="section-number">03</span>
              <h2 class="section-title">Acteurs Impliqués</h2>
            </div>
          </div>

          <div class="section-body">
            <v-row>
              <v-col cols="12">
                <p class="actor-label"><strong>Acteur Principal</strong></p>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.acteur1"
                  label="Nom / Désignation"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-account-alert"
                  placeholder="Ex : Forces de sécurité, Milices armées..."
                  color="red darken-2"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.assoc_acteur1"
                  label="Entité Associée"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-link-variant"
                  placeholder="Organisation ou entité associée"
                  color="red darken-2"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <v-row>
              <v-col cols="12">
                <p class="actor-label">
                  <strong>Acteur Secondaire</strong>
                  <v-chip x-small class="ml-2 chip-optional">optionnel</v-chip>
                </p>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.acteur2"
                  label="Nom / Désignation"
                  outlined
                  dense
                  prepend-inner-icon="mdi-account"
                  placeholder="Deuxième acteur impliqué"
                  color="red darken-1"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.assoc_acteur2"
                  label="Entité Associée"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-link-variant"
                  placeholder="Organisation ou entité associée"
                  color="red darken-1"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- ── Section 4 : Dégâts Humains ── -->
        <div class="section-card section-human">
          <div class="section-head">
            <div>
              <span class="section-number">04</span>
              <h2 class="section-title">Dégâts Humains</h2>
            </div>
          </div>

          <div class="section-body">
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.morts_civils"
                  label="Décès"
                  type="number"
                  outlined
                  dense
                  :rules="[rules.nonNegative]"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.blesses_civils"
                  label="Blessés"
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
                  label="Disparus"
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
                  label="Expulsés"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.morts_allies"
                  label="Morts allies"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.morts_ennemis"
                  label="Morts ennemis"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.blesses_allies"
                  label="Blesses allies"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.blesses_ennemis"
                  label="Blesses ennemis"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.arrestations_interpellations"
                  label="Arrestations/Interpellations"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="form.degats_humains.violences_sexuelles"
                  label="Violences sexuelles"
                  type="number"
                  outlined
                  dense
                  min="0"
                  :rules="[rules.nonNegative]"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- ── Section 5 : Dégâts Matériels ── -->
        <div class="section-card section-material">
          <div class="section-head">
            <div>
              <span class="section-number">05</span>
              <h2 class="section-title">Dégâts Matériels</h2>
            </div>
          </div>

          <div class="section-body">
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
                  prepend-inner-icon="mdi-car-wrench"
                  color="amber darken-3"
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
                  prepend-inner-icon="mdi-domain"
                  color="amber darken-3"
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
                  prepend-inner-icon="mdi-bridge"
                  color="amber darken-3"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="form.degats_materiels.autres_degats"
              label="Autres Dégâts Matériels"
              outlined
              rows="3"
              counter
              maxlength="1000"
              prepend-inner-icon="mdi-text-box"
              placeholder="Décrivez les autres dégâts matériels observés..."
              color="amber darken-3"
            ></v-textarea>
          </div>
        </div>

        <!-- ── Action Buttons ── -->
        <div class="action-bar">
          <v-btn
            depressed
            large
            class="btn-submit"
            @click="submitForm"
            :loading="submitting"
            :disabled="!formValid || submitting"
          >
            Enregistrer les données
          </v-btn>
          <v-btn
            outlined
            large
            class="btn-reset ml-4"
            @click="resetForm"
          >
            Réinitialiser
          </v-btn>
        </div>

      </v-form>
    </div>

    <!-- ══════════════ DIALOG SUCCÈS ══════════════ -->
    <v-dialog v-model="successDialog" max-width="480" persistent>
      <v-card class="dialog-card">
        <div class="dialog-header dialog-header--success">
          <h2 class="dialog-header-title">Enregistrement réussi</h2>
        </div>
        <v-card-text class="text-center pt-6 pb-4 px-8">
          <p class="dialog-body">
            Les données sécuritaires ont été enregistrées avec succès dans la base de données.
          </p>
          <v-chip small label color="#e8f5e9" text-color="#2e7d32" class="mt-3">{{ documentId }}</v-chip>
        </v-card-text>
        <v-card-actions class="pb-6 px-6 justify-center">
          <v-btn outlined color="success" class="mr-3" @click="closeSuccessDialog">Fermer</v-btn>
          <v-btn depressed color="success" dark @click="submitAnotherForm">Nouvel incident</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════ DIALOG ERREUR ══════════════ -->
    <v-dialog v-model="errorDialog" max-width="480">
      <v-card class="dialog-card">
        <div class="dialog-header dialog-header--error">
          <h2 class="dialog-header-title">Erreur d'enregistrement</h2>
        </div>
        <v-card-text class="text-center pt-6 pb-4 px-8">
          <p class="dialog-body mt-3">{{ errorMessage }}</p>
        </v-card-text>
        <v-card-actions class="pb-6 px-6 justify-center">
          <v-btn depressed color="error" dark @click="errorDialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
//import axios from "axios";
import api from "@/services/api";

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
          morts_civils: 0,
          morts_allies: 0,
          morts_ennemis: 0,
          blesses_civils: 0,
          blesses_allies: 0,
          blesses_ennemis: 0,
          enleves_disparus: 0,
          expulses: 0,
          arrestations_interpellations: 0,
          violences_sexuelles: 0,
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

      // Conversion des types numériques
      const dataToSubmit = {
        ...this.form,
        degats_humains: {
          morts_civils: parseInt(this.form.degats_humains.morts_civils) || 0,
          morts_allies: parseInt(this.form.degats_humains.morts_allies) || 0,
          morts_ennemis: parseInt(this.form.degats_humains.morts_ennemis) || 0,
          blesses_civils: parseInt(this.form.degats_humains.blesses_civils) || 0,
          blesses_allies: parseInt(this.form.degats_humains.blesses_allies) || 0,
          blesses_ennemis: parseInt(this.form.degats_humains.blesses_ennemis) || 0,
          enleves_disparus: parseInt(this.form.degats_humains.enleves_disparus) || 0,
          expulses: parseInt(this.form.degats_humains.expulses) || 0,
          arrestations_interpellations: parseInt(this.form.degats_humains.arrestations_interpellations) || 0,
          violences_sexuelles: parseInt(this.form.degats_humains.violences_sexuelles) || 0,
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

      api.intel
        .create(dataToSubmit)
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
          morts_civils: 0,
          morts_allies: 0,
          morts_ennemis: 0,
          blesses_civils: 0,
          blesses_allies: 0,
          blesses_ennemis: 0,
          enleves_disparus: 0,
          expulses: 0,
          arrestations_interpellations: 0,
          violences_sexuelles: 0,
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
/* ══════════════════════════════════════════════════
   GLOBAL
══════════════════════════════════════════════════ */
.dashboard-container {
  background: #f0f2f5;
  min-height: 100vh;
}

/* ══════════════════════════════════════════════════
   HERO HEADER
══════════════════════════════════════════════════ */
.hero-header {
  background: #1a2744;
  padding: 2.5rem 2rem;
  text-align: center;
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.2px;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 1rem;
}

.hero-chips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* ══════════════════════════════════════════════════
   STEPS BAR
══════════════════════════════════════════════════ */
.steps-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-bottom: 1px solid #dde3ec;
  padding: 0.75rem 2rem;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.step-item {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: #546e7a;
  padding: 0.25rem 0.75rem;
  border: 1px solid #cfd8dc;
  background: #f5f7f8;
}

.step-separator {
  width: 20px;
  height: 1px;
  background: #cfd8dc;
}

/* ══════════════════════════════════════════════════
   FORM WRAPPER
══════════════════════════════════════════════════ */
.form-wrapper {
  max-width: 1100px;
  margin: 1.75rem auto;
  padding: 0 1.25rem 3rem;
}

/* ══════════════════════════════════════════════════
   SECTION CARDS
══════════════════════════════════════════════════ */
.section-card {
  background: #ffffff;
  border: 1px solid #dde3ec;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

/* Section Head */
.section-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e8eaed;
  background: #f7f8fa;
}

.section-number {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #9eaac4;
  display: block;
  line-height: 1;
  margin-bottom: 2px;
  text-transform: uppercase;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a2744;
  margin: 0;
  line-height: 1.2;
}

.chip-required {
  font-size: 0.7rem !important;
  color: #c62828 !important;
  background: #ffebee !important;
  border: 1px solid #ef9a9a !important;
  border-radius: 0 !important;
}

.chip-optional {
  font-size: 0.65rem !important;
  color: #616161 !important;
  background: #eeeeee !important;
  border-radius: 0 !important;
}

/* Section Body */
.section-body {
  padding: 1.5rem;
}

/* ══════════════════════════════════════════════════
   ACTOR LABEL
══════════════════════════════════════════════════ */
.actor-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #37474f;
  margin-bottom: 0.5rem;
}

/* ══════════════════════════════════════════════════
   ACTION BAR
══════════════════════════════════════════════════ */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  background: #ffffff;
  border: 1px solid #dde3ec;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn-submit {
  background: #1a2744 !important;
  color: #ffffff !important;
  border-radius: 0 !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
  text-transform: none !important;
  padding: 0 1.5rem !important;
}

.btn-reset {
  border-radius: 0 !important;
  font-weight: 600 !important;
  text-transform: none !important;
  color: #546e7a !important;
  border-color: #b0bec5 !important;
}

/* ══════════════════════════════════════════════════
   DIALOGS
══════════════════════════════════════════════════ */
.dialog-card {
  border-radius: 0 !important;
  overflow: hidden;
}

.dialog-header {
  padding: 1.25rem 1.5rem;
}

.dialog-header--success { background: #2e7d32; }
.dialog-header--error   { background: #c62828; }

.dialog-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.dialog-body {
  font-size: 0.95rem;
  color: #546e7a;
  line-height: 1.6;
}

/* ══════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════ */
@media (max-width: 960px) {
  .hero-title  { font-size: 1.4rem; }
  .hero-header { padding: 2rem 1.25rem; }
  .steps-bar   { padding: 0.6rem 1rem; }
}

@media (max-width: 600px) {
  .hero-title    { font-size: 1.15rem; }
  .hero-subtitle { font-size: 0.85rem; }
  .form-wrapper  { padding: 1rem 0.75rem 2rem; }
  .section-body  { padding: 1rem; }
  .steps-bar     { display: none; }
  .action-bar    { justify-content: center; }
  .btn-submit, .btn-reset { width: 100%; margin-left: 0 !important; }
}
</style>
