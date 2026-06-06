<template>
  <v-card class="mx-1">
    <v-breadcrumbs
      v-if="!homePage()"
      class="mt-8 px-4 py-2"
      :items="breadcrumbsGen">
      <template v-slot:divider >
        <v-icon size="22">mdi-chevron-right</v-icon>
      </template>
      <template
        v-slot:item="{ item }">
        <v-breadcrumbs-item :to="item.to" link>
          {{ item.text }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>
  </v-card>
</template>

<script>
export default {
  computed: {
    breadcrumbsGen() {
      const labelByPath = {
        "/dashboard": "Enregistrer CCOC",
        "/search": "Rechercher CCOC",
        "/poldiplo": "Entités",
        "/observations": "Informations",
        "/extra/events": "Renseignements",
        "/extra/links": "Relations",
        "/admin/users": "Gestion utilisateurs",
        "/profile": "Profil entité",
        "/incident": "Détails CCOC",
      };

      const currentPath = this.$route.path;
      const matchedPath = Object.keys(labelByPath)
        .sort((a, b) => b.length - a.length)
        .find((path) => currentPath === path || currentPath.startsWith(`${path}/`));

      const text = matchedPath
        ? labelByPath[matchedPath]
        : this.$route.name || currentPath.split("/").filter(Boolean).pop();

      return [
        { text: "App", to: "/dashboard" },
        { text, to: null },
      ];
    },
  },
  methods: {
    homePage() {
      return this.$route.path === "/" || this.$route.path === "/dashboard";
    },
  },
}
</script>

<style src="./Breadcrumbs.scss" lang="scss"></style>
