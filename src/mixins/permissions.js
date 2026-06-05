import { mapGetters } from "vuex";

export const PermissionsMixin = {
  computed: {
    ...mapGetters("auth", [
      "role",
      "desk",
      "isAdmin",
      "isCoordinateur",
      "canCreate",
      "canDelete",
      "canAssign",
    ]),
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
};
