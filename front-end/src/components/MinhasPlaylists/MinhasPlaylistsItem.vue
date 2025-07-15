<template>
  <v-container
    class="mt-4 mb-4 px-10 d-flex rounded-lg flex-column bg-secondary position-relative"
    max-width="720"
  >
    <v-btn
      icon
      size="x-small"
      variant="icon"
      class="position-absolute"
      color="error"
      style="top: 4px; right: 4px"
    >
      <v-icon size="18">mdi-close</v-icon>
    </v-btn>

    <div class="d-flex justify-space-between">
      <span class="text-subtitle-2">{{ nomePlaylist }}</span>
      <span class="text-subtitle-2 text-truncate" style="max-width: 270px">
        <span class="text-info font-weight-bold">{{ quantidadeMusicas }}</span>
        Músicas
      </span>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  idPlaylist: {
    type: Number,
    required: true,
  },
  nomePlaylist: {
    type: String,
    required: true,
  },
  quantidadeMusicas: {
    type: Number,
    required: true,
  },
});

const reproduzindoMusica = ref(false);
const expandido = ref(false);
</script>
