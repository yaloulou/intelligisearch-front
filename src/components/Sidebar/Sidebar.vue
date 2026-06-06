<template>
  <v-navigation-drawer
    app
    clipped
    v-model="DRAWER_STATE"
    :mini-variant="!DRAWER_STATE"
    :width="sidebarWidth"
    :permanent="$vuetify.breakpoint.lgAndUp"
    :temporary="$vuetify.breakpoint.mdAndDown"
    :mini-variant-width="sidebarMinWidth"
    :class="{ 'drawer-mini': !DRAWER_STATE }"
  >
    <v-list>
      <template v-for="(item, i) in filteredItems">
        <v-row v-if="item.heading" :key="item.heading" align="center">
          <v-col cols="6">
            <span
              style="padding-left: 32px"
              class="text-body-1 subheader"
              :class="item.heading && DRAWER_STATE ? 'show ' : 'hide'"
            >
              {{ item.heading }}
            </span>
          </v-col>
        </v-row>
        <v-divider
          v-else-if="item.divider"
          :key="i"
          dark
          class="my-4"
        ></v-divider>
        <v-list-item
          color="primary"
          v-else
          :key="item.title"
          :to="item.link === '#' ? '' : item.link"
          @click="item.action ? item.action() : null"
          link
        >
          <v-list-item-action class="mr-6">
            <v-icon
              :size="item.size ? item.size : 24"
              :color="item.color ? item.color : 'greyTint'"
              >{{ item.icon }}</v-icon
            >
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title link>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  data() {
    return {
      items: [
        {
          title: "Enregistrer CCOC",
          icon: "mdi-file-document-outline",
          link: "/dashboard",
        },
        { title: "Rechercher CCOC", icon: "mdi-magnify", link: "/search" },
        {
          title: "Entités",
          icon: "mdi-chart-bubble",
          link: "/poldiplo",
        },
        {
          title: "Informations",
          icon: "mdi-eye-outline",
          link: "/observations",
        },
        {
          title: "Renseignements",
          icon: "mdi-calendar-clock",
          link: "/extra/events",
        },
        {
          title: "Relations",
          icon: "mdi-sitemap",
          link: "/extra/links",
        },
        {
          title: "Gestion utilisateurs",
          icon: "mdi-account-group",
          link: "/admin/users",
          adminOnly: true,
        },
      ],
      sidebarWidth: 240,
      sidebarMinWidth: 96,
    };
  },
  computed: {
    ...mapState("layout", {
      drawer: (state) => state.drawer,
    }),
    DRAWER_STATE: {
      get() {
        return this.drawer;
      },
      set(newValue) {
        if (newValue === this.drawer) return;
        this.TOGGLE_DRAWER();
      },
    },
    userRole() {
      return this.$store.getters["auth/role"];
    },
    filteredItems() {
      const role = this.userRole;
      const officierHidden = ["Renseignements", "Relations", "Entités"];
      return this.items.filter((item) => {
        if (item.adminOnly) return role === "admin";
        if (officierHidden.includes(item.title) && role === "officier") return false;
        return true;
      });
    },
  },
  methods: {
    ...mapActions("layout", ["TOGGLE_DRAWER"]),
  },
};
</script>

<style src="./Sidebar.scss" lang="scss" />
