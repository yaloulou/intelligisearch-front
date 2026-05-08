<template>
  <v-container fluid class="mt-5">
    <v-row justify="center">
      <v-col cols="12" md="9">
        <v-card v-if="entity" class="pa-4">
          <v-row>
            <!-- Photo -->
            <v-col cols="12" md="4" class="text-center">
              <v-avatar size="220">
                <v-img v-if="photoUrl" :src="photoUrl" />
                <v-icon v-else size="220" color="grey">mdi-account</v-icon>
              </v-avatar>
              <div class="mt-3 text-caption grey--text">
                {{ entity.entity_type }} • {{ entity.status }}
              </div>
            </v-col>

            <!-- Basic Info -->
            <v-col cols="12" md="8">
              <h2 class="mb-2">{{ entity.name || "Sans nom" }}</h2>

              <v-divider class="my-3"></v-divider>

              <v-row>
                <v-col cols="12" sm="6">
                  <strong>Sexe :</strong> {{ entity.attributes?.sexe || "—" }}
                </v-col>
                <v-col cols="12" sm="6">
                  <strong>Naissance :</strong> {{ formatDate(entity.attributes?.naissance) }}
                </v-col>
                <v-col cols="12" sm="6">
                  <strong>Lieu de naissance :</strong> {{ entity.attributes?.lieu_nais || "—" }}
                </v-col>
                <v-col cols="12" sm="6">
                  <strong>État civil :</strong> {{ entity.attributes?.etat_civil || "—" }}
                </v-col>
                <v-col cols="12" sm="6">
                  <strong>Profession :</strong> {{ entity.attributes?.profession || "—" }}
                </v-col>
                <v-col cols="12" sm="6">
                  <strong>Téléphone :</strong> {{ firstPhone(entity.contacts) || "—" }}
                </v-col>
              </v-row>

              <v-divider class="my-3"></v-divider>

              <!-- Locations -->
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

              <!-- Identifiers -->
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

export default {
  data() {
    return {
      entity: null,
    };
  },
  computed: {
    photoUrl() {
      // Prend le premier media (si existe) : url sinon file_path
      const media = this.entity?.media;
      if (!Array.isArray(media) || !media.length) return null;

      const first = media[0];
      // Si tu stockes des urls HTTP directes :
      if (first?.url) return first.url;

      // Si tu stockes un file_path local vers un serveur de fichiers :
      // ex: /uploads/entities/abc.jpg => adapte le prefix
      if (first?.file_path) return `http://localhost:5000/uploads/${first.file_path}`;
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
      const p = contacts.find((c) => (c?.type || "").toLowerCase() === "phone");
      return p?.value || null;
    },
  },
};
</script>

<style scoped>
.mt-5 {
  margin-top: 40px;
}
</style>
