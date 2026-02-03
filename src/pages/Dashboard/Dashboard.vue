<template>
  <v-container fluid>
    <v-card class="elevation-2 pa-6">
      <v-card-title class="headline"
        >Enregistrement de Renseignements Sécuritaires</v-card-title
      >
      <v-card-text>
        <v-row>
          <!-- Contexte Général -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.province_region"
              label="Province/Région"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.territoire_ville"
              label="Territoire/Ville"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
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
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  outlined
                  dense
                  required
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="form.date_event"
                no-title
                @input="menu = false"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <!-- Détails de l'Incident -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.event"
              label="Événement"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.localite_village_lieuprecis"
              label="Lieu Précis"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.acteur1"
              label="Acteur Impliqué 1"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.assoc_acteur1"
              label="Acteur Associé 1"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.acteur2"
              label="Acteur Impliqué 2"
              outlined
              dense
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.assoc_acteur2"
              label="Acteur Associé 2"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>

          <!-- Dégâts Humains -->
          <v-col cols="12" class="section-title">Dégâts Humains</v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="form.degats_humains.morts"
              label="Nombre de Morts"
              type="number"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="form.degats_humains.blesses"
              label="Nombre de Blessés"
              type="number"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="form.degats_humains.enleves_disparus"
              label="Nombre de Disparus"
              type="number"
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="form.degats_humains.expulses"
              label="Nombre d'Expulsés"
              type="number"
              outlined
              dense
            ></v-text-field>
          </v-col>

          <!-- Dégâts Matériels -->
          <v-col cols="12" class="section-title">Dégâts Matériels</v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="form.degats_materiels.degat_vehicules"
              label="Véhicules Endommagés"
              type="number"
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="form.degats_materiels.degat_batiments"
              label="Bâtiments Endommagés"
              type="number"
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="form.degats_materiels.degat_infrastructures"
              label="Infrastructures Endommagées"
              type="number"
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.degats_materiels.autres_degats"
              label="Autres Dégâts"
              outlined
              dense
            ></v-textarea>
          </v-col>

          <!-- Champs de Texte Longs -->
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Description de l'Incident"
              outlined
              dense
              required
            ></v-textarea>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.categorie"
              label="Catégorie"
              outlined
              dense
            ></v-textarea>
          </v-col>
        </v-row>

        <v-btn color="primary" @click="submitForm" class="mt-4"
          >Enregistrer</v-btn
        >

        <!-- Dialog de confirmation -->
        <v-dialog v-model="dialog" max-width="400">
          <v-card>
            <v-card-title class="headline">Succès</v-card-title>
            <v-card-text
              >Les données ont été enregistrées avec succès !</v-card-text
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="dialog = false">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      form: {
        province_region: "",
        territoire_ville: "",
        date_event: "",
        event: "",
        localite_village_lieuprecis: "",
        acteur1: "",
        acteur2: "",
        assoc_acteur1: "",
        assoc_acteur2: "",
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
        description: "",
        categorie: "",
      },
      menu: false,
      dialog: false,
    };
  },
  methods: {
    submitForm() {
      const authOptions = {
        auth: {
          username: 'elastic',
          password: 'Jm82icR+PUlNJQKNntUy'
        },
      };

      axios
        .post(
          "http://localhost:9200/intel_v1/_doc/",
          this.form,
          authOptions
        )
        .then((response) => {
          console.log("Data submitted successfully:", response.data);
          this.dialog = true;
          this.resetForm();
        })
        .catch((error) => {
          console.error("Erreur lors de l'envoi des données:", error);
        });
    },
    resetForm() {
      this.form = {
        province_region: "",
        territoire_ville: "",
        date_event: "",
        event: "",
        localite_village_lieuprecis: "",
        acteur1: "",
        acteur2: "",
        assoc_acteur1: "",
        assoc_acteur2: "",
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
        description: "",
        categorie: "",
      };
    },
  },
};
</script>

<style scoped>
.v-card {
  max-width: 1000px;
  margin: auto;
  border-radius: 12px;
}

.v-text-field,
.v-textarea {
  margin-bottom: 16px;
}

.section-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  text-decoration: underline;
}
</style>
