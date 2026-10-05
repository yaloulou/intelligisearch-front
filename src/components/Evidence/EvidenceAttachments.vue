<template>
  <section class="evidence-attachments">
    <v-divider class="my-4" />
    <h4 class="mb-3">Évidences / Pièces jointes ({{ value.length + pending.length }})</h4>
    <v-alert v-if="error" type="error" dense dismissible @input="error = ''">{{ error }}</v-alert>
    <v-file-input
      v-if="!readonly"
      v-model="selection"
      :accept="acceptedFormats"
      :disabled="busy || uploading"
      label="Ajouter des images, vidéos, audios ou documents"
      hint="20 fichiers maximum, 100 Mo par fichier. Vous pouvez ajouter des fichiers en plusieurs fois."
      persistent-hint multiple outlined dense prepend-icon="mdi-paperclip"
      @change="addFiles"
    />
    <v-progress-linear v-if="uploading" :value="progress" class="mt-3" />
    <p v-if="uploading" class="text-caption mt-1">Envoi de {{ uploadingName }} — {{ progress }} %</p>
    <p v-if="!value.length && !pending.length" class="text--secondary mt-3">Aucune pièce jointe.</p>
    <v-list dense>
      <v-list-item v-for="ref in value" :key="ref.doc_id">
        <v-list-item-icon><v-icon>{{ icon(ref.type) }}</v-icon></v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="evidence-name">{{ title(ref) }}</v-list-item-title>
          <v-list-item-subtitle>{{ typeLabel(ref.type) }} · {{ metadata[ref.doc_id] ? 'Enregistré' : 'Chargement…' }}</v-list-item-subtitle>
          <span v-if="metadata[ref.doc_id] && metadata[ref.doc_id].error" class="error--text text-caption">{{ metadata[ref.doc_id].error }}</span>
        </v-list-item-content>
        <v-list-item-action class="evidence-actions">
          <v-btn v-if="ref.type !== 'document'" icon :loading="loadingFile === ref.doc_id" :disabled="busy || uploading" :aria-label="'Consulter ' + title(ref)" @click="preview(ref)"><v-icon>mdi-eye</v-icon></v-btn>
          <v-btn icon :loading="downloading === ref.doc_id" :disabled="busy || uploading" :aria-label="'Télécharger ' + title(ref)" @click="download(ref)"><v-icon>mdi-download</v-icon></v-btn>
          <v-btn v-if="!readonly" icon :disabled="busy || uploading" :aria-label="'Retirer ' + title(ref)" @click="removeRef(ref.doc_id)"><v-icon color="error">mdi-close</v-icon></v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-list-item v-for="entry in pending" :key="entry.key">
        <v-list-item-icon><v-icon>{{ icon(fileType(entry.file)) }}</v-icon></v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="evidence-name">{{ entry.file.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ typeLabel(fileType(entry.file)) }} · {{ size(entry.file.size) }} · En attente d'enregistrement</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action><v-btn icon :disabled="busy || uploading" :aria-label="'Retirer ' + entry.file.name" @click="removePending(entry.key)"><v-icon color="error">mdi-close</v-icon></v-btn></v-list-item-action>
      </v-list-item>
    </v-list>
    <v-dialog v-model="previewOpen" max-width="900px" @input="onPreviewToggle">
      <v-card>
        <v-card-title>{{ previewTitle }}<v-spacer /><v-btn icon aria-label="Fermer l'aperçu" @click="closePreview"><v-icon>mdi-close</v-icon></v-btn></v-card-title>
        <v-card-text>
          <v-alert v-if="previewError" type="info" dense>{{ previewError }}</v-alert>
          <img v-if="previewType === 'image' && previewUrl" :src="previewUrl" :alt="previewTitle" class="evidence-image" @error="mediaError" />
          <video v-if="previewType === 'video' && previewUrl" :src="previewUrl" controls preload="metadata" class="evidence-player" @error="mediaError" />
          <audio v-if="previewType === 'audio' && previewUrl" :src="previewUrl" controls preload="metadata" class="evidence-player" @error="mediaError" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import api from "@/services/api";

const extensions = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "bmp"],
  video: ["mp4", "webm", "mov", "avi", "mkv", "m4v"],
  audio: ["mp3", "wav", "ogg", "oga", "m4a", "aac", "flac"],
  document: ["pdf", "txt", "csv", "rtf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp"],
};

export default {
  name: "EvidenceAttachments",
  props: {
    value: { type: Array, default: () => [] },
    context: { type: String, required: true },
    recordId: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
  },
  data() {
    return {
      selection: [], pending: [], metadata: {}, error: "", uploading: false,
      uploadingName: "", progress: 0, loadingFile: "", downloading: "",
      previewOpen: false, previewUrl: "", previewTitle: "", previewType: "", previewError: "",
      generation: 0, disposed: false,
    };
  },
  computed: {
    acceptedFormats() { return Object.values(extensions).flat().map(ext => `.${ext}`).join(","); },
    params() { return { context: this.context, recordId: this.recordId || undefined }; },
  },
  watch: {
    value: { immediate: true, handler() { this.loadMetadata(); } },
    recordId() { this.loadMetadata(); },
  },
  beforeDestroy() { this.disposed = true; this.generation++; this.closePreview(); },
  methods: {
    fileType(file) {
      const ext = file.name.split(".").pop().toLowerCase();
      return Object.keys(extensions).find(type => extensions[type].includes(ext));
    },
    typeLabel(type) { return { image: "Image", video: "Vidéo", audio: "Audio", document: "Document" }[type] || "Fichier"; },
    icon(type) { return { image: "mdi-image", video: "mdi-video", audio: "mdi-music-note", document: "mdi-file-document" }[type] || "mdi-paperclip"; },
    title(ref) { return (this.metadata[ref.doc_id] || {}).title || ref.doc_id; },
    size(bytes) { return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`; },
    addFiles(files) {
      this.error = "";
      for (const file of files || []) {
        if (!this.fileType(file)) { this.error = `Format non accepté : ${file.name}`; continue; }
        if (!file.size || file.size > 100 * 1024 * 1024) { this.error = `${file.name} : fichier vide ou supérieur à 100 Mo`; continue; }
        if (this.value.length + this.pending.length >= 20) { this.error = "20 pièces jointes maximum par dossier"; break; }
        const key = `${file.name}:${file.size}:${file.lastModified}`;
        if (!this.pending.some(entry => entry.key === key)) this.pending.push({ key, file });
      }
      this.$nextTick(() => { this.selection = []; });
    },
    removePending(key) { this.pending = this.pending.filter(entry => entry.key !== key); },
    removeRef(id) { this.$emit("input", this.value.filter(ref => ref.doc_id !== id)); },
    async loadMetadata() {
      const generation = ++this.generation;
      await Promise.all(this.value.map(async ref => {
        if (this.metadata[ref.doc_id] && !this.metadata[ref.doc_id].error) return;
        try {
          const res = await api.evidence.get(ref.doc_id, this.params);
          if (generation === this.generation && !this.disposed) this.$set(this.metadata, ref.doc_id, res.data);
        } catch (error) {
          if (generation === this.generation && !this.disposed) this.$set(this.metadata, ref.doc_id, { error: "Fichier indisponible ou accès refusé" });
        }
      }));
    },
    async uploadPending(classification) {
      const refs = this.value.map(ref => ({ ...ref }));
      this.error = "";
      this.uploading = true;
      try {
        // Commit each successful upload to the draft before continuing. A retry
        // sends only files still pending if a later upload or record save fails.
        for (const entry of [...this.pending]) {
          this.uploadingName = entry.file.name;
          this.progress = 0;
          const res = await api.evidence.upload(entry.file, this.context, classification, event => {
            this.progress = event.total ? Math.round(event.loaded * 100 / event.total) : 0;
          });
          refs.push(res.data.evidence);
          this.$set(this.metadata, res.data.evidence.doc_id, res.data.document);
          this.removePending(entry.key);
          this.$emit("input", [...refs]);
        }
        return refs;
      } catch (error) {
        this.error = error.response?.data?.message || error.message || "Échec de l'envoi du fichier";
        throw new Error(this.error);
      } finally { this.uploading = false; this.uploadingName = ""; }
    },
    async preview(ref) {
      this.loadingFile = ref.doc_id;
      this.error = "";
      try {
        const res = await api.evidence.file(ref.doc_id, this.params);
        if (this.disposed) return;
        this.closePreview();
        this.previewUrl = URL.createObjectURL(res.data);
        this.previewType = ref.type || (res.data.type.split("/")[0]);
        this.previewTitle = this.title(ref);
        this.previewOpen = true;
      } catch (error) { this.error = "Impossible de consulter cette pièce jointe"; }
      finally { this.loadingFile = ""; }
    },
    async download(ref) {
      this.downloading = ref.doc_id;
      this.error = "";
      try {
        const res = await api.evidence.file(ref.doc_id, this.params);
        if (this.disposed) return;
        const url = URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = url; link.download = this.title(ref);
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) { this.error = "Impossible de télécharger cette pièce jointe"; }
      finally { this.downloading = ""; }
    },
    mediaError() { this.previewError = "Ce format ne peut pas être lu par votre navigateur. Téléchargez le fichier pour l'ouvrir."; },
    onPreviewToggle(open) { if (!open) this.closePreview(); },
    closePreview() {
      this.previewOpen = false;
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = ""; this.previewError = "";
    },
  },
};
</script>

<style scoped>
.evidence-name { white-space: normal; overflow-wrap: anywhere; }
.evidence-actions { flex-direction: row; flex-shrink: 0; margin-left: 8px; }
.evidence-image { display: block; max-width: 100%; max-height: 65vh; margin: auto; }
.evidence-player { width: 100%; max-height: 65vh; }
</style>
