<template>
  <v-container fluid class="users-admin mt-6">
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <h3>Gestion des utilisateurs</h3>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openAddDialog">
              Nouvel utilisateur
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="users"
              :loading="loading"
              loading-text="Chargement des utilisateurs..."
            >
              <template v-slot:item.actif="{ item }">
                <v-chip x-small :color="item.actif ? 'success' : 'grey'" text-color="white">
                  {{ item.actif ? 'Actif' : 'Inactif' }}
                </v-chip>
              </template>
              <template v-slot:item.role="{ item }">
                <v-chip x-small :color="roleColor(item.role)" text-color="white">
                  {{ item.role }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn x-small text @click.stop="openEditDialog(item)">Modifier</v-btn>
                <v-btn x-small text @click.stop="openPasswordDialog(item)">MDP</v-btn>
                <v-btn
                  x-small text color="warning"
                  @click.stop="deactivateUser(item)"
                  :disabled="!item.actif"
                >Désactiver</v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="formDialog" max-width="520px">
      <v-card>
        <v-card-title>
          <h3>{{ editingUser ? 'Modifier' : 'Nouvel' }} utilisateur</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="formDialog = false">×</v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.nom" label="Nom" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.prenom" label="Prénom" outlined dense></v-text-field>
            </v-col>
          </v-row>
          <v-text-field
            v-model="form.email"
            label="Email"
            outlined dense class="mb-2"
            :disabled="!!editingUser"
          ></v-text-field>
          <v-text-field
            v-if="!editingUser"
            v-model="form.password"
            label="Mot de passe"
            type="password"
            outlined dense class="mb-2"
          ></v-text-field>
          <v-select
            v-model="form.role"
            :items="roleOptions"
            label="Rôle"
            outlined dense class="mb-2"
          ></v-select>
          <v-text-field
            v-model="form.desk"
            label="Desk (ex: desk_est)"
            outlined dense class="mb-2"
            hint="Laisser vide si non applicable"
            persistent-hint
          ></v-text-field>
          <v-switch
            v-if="editingUser"
            v-model="form.actif"
            label="Compte actif"
            dense
          ></v-switch>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="formDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="saveUser" :loading="saving">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Password Dialog -->
    <v-dialog v-model="passwordDialog" max-width="400px">
      <v-card>
        <v-card-title>
          <h3>Changer le mot de passe</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="passwordDialog = false">×</v-btn>
        </v-card-title>
        <v-card-text>
          <p class="mb-3 grey--text">
            Utilisateur : <strong>{{ passwordTargetUser ? passwordTargetUser.email : '' }}</strong>
          </p>
          <v-text-field
            v-model="newPassword"
            label="Nouveau mot de passe"
            type="password"
            outlined dense
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="passwordDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="changePassword" :loading="saving">Confirmer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" bottom right>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import api from "@/services/api";

export default {
  name: "UsersAdmin",
  data() {
    return {
      users: [],
      loading: false,
      saving: false,
      formDialog: false,
      passwordDialog: false,
      editingUser: null,
      passwordTargetUser: null,
      newPassword: "",
      form: {
        nom: "",
        prenom: "",
        email: "",
        password: "",
        role: "analyste",
        desk: "",
        actif: true,
      },
      roleOptions: ["officier", "analyste", "conseiller", "coordinateur", "admin"],
      headers: [
        { text: "Nom", value: "nom" },
        { text: "Prénom", value: "prenom" },
        { text: "Email", value: "email" },
        { text: "Rôle", value: "role" },
        { text: "Desk", value: "desk" },
        { text: "Statut", value: "actif", align: "center" },
        { text: "Actions", value: "actions", sortable: false, align: "center" },
      ],
      snackbar: { show: false, message: "", color: "success" },
    };
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    showSnackbar(message, color = "success") {
      this.snackbar = { show: true, message, color };
    },
    roleColor(role) {
      const map = {
        admin: "error",
        coordinateur: "deep-orange",
        conseiller: "purple",
        analyste: "primary",
        officier: "teal",
      };
      return map[role] || "grey";
    },
    async fetchUsers() {
      this.loading = true;
      try {
        const res = await api.users.list();
        this.users = res.data?.items || res.data || [];
      } catch (e) {
        this.showSnackbar("Erreur lors du chargement des utilisateurs", "error");
      } finally {
        this.loading = false;
      }
    },
    openAddDialog() {
      this.editingUser = null;
      this.form = { nom: "", prenom: "", email: "", password: "", role: "analyste", desk: "", actif: true };
      this.formDialog = true;
    },
    openEditDialog(user) {
      this.editingUser = user;
      this.form = {
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email,
        role: user.role,
        desk: user.desk || "",
        actif: !!user.actif,
      };
      this.formDialog = true;
    },
    openPasswordDialog(user) {
      this.passwordTargetUser = user;
      this.newPassword = "";
      this.passwordDialog = true;
    },
    async saveUser() {
      if (!this.form.email || !this.form.role) {
        this.showSnackbar("Email et rôle obligatoires", "error");
        return;
      }
      this.saving = true;
      try {
        if (this.editingUser) {
          const data = { ...this.form };
          delete data.password;
          await api.users.update(this.editingUser._id, data);
          this.showSnackbar("Utilisateur modifié avec succès");
        } else {
          await api.users.create(this.form);
          this.showSnackbar("Utilisateur créé avec succès");
        }
        this.formDialog = false;
        await this.fetchUsers();
      } catch (e) {
        this.showSnackbar(e.response?.data?.message || "Erreur lors de l'enregistrement", "error");
      } finally {
        this.saving = false;
      }
    },
    async changePassword() {
      if (!this.newPassword || this.newPassword.length < 6) {
        this.showSnackbar("Mot de passe trop court (minimum 6 caractères)", "error");
        return;
      }
      this.saving = true;
      try {
        await api.users.changePassword(this.passwordTargetUser._id, { password: this.newPassword });
        this.showSnackbar("Mot de passe modifié avec succès");
        this.passwordDialog = false;
      } catch (e) {
        this.showSnackbar("Erreur lors du changement de mot de passe", "error");
      } finally {
        this.saving = false;
      }
    },
    async deactivateUser(user) {
      if (!confirm(`Désactiver le compte de ${user.prenom} ${user.nom} ?`)) return;
      try {
        await api.users.deactivate(user._id);
        this.showSnackbar("Compte désactivé");
        await this.fetchUsers();
      } catch (e) {
        this.showSnackbar("Erreur lors de la désactivation", "error");
      }
    },
  },
};
</script>
