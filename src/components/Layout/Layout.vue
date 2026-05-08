<template>
  <v-app>
    <Header />
    <Sidebar />
    <v-main class="content mx-0 mx-md-2">
      <Breadcrumbs />
      <router-view />
      <Footer />
      <Helper />
    </v-main>
    <v-snackbar v-model="globalSnackbar.show" :color="globalSnackbar.color" timeout="4000" bottom right>
      {{ globalSnackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script>
    import Header from '@/components/Header/Header';
    import Sidebar from '@/components/Sidebar/Sidebar';
    import Footer from "@/components/Footer/Footer";
    import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
    import Helper from "@/components/Helper/Helper";
    import { EventBus } from "@/eventBus";

    export default {
        name: 'Layout',
        components: { Helper, Footer, Header, Sidebar, Breadcrumbs },
        data() {
          return {
            globalSnackbar: { show: false, message: "", color: "error" },
          };
        },
        created() {
          EventBus.$on("global-notification", ({ message, color }) => {
            this.globalSnackbar = { show: true, message, color: color || "error" };
          });
        },
        beforeDestroy() {
          EventBus.$off("global-notification");
        },
    };
</script>

<style src="./Layout.scss" lang="scss" />
