<template>
  <v-container class="pa-5 px-10 mt-4 mb-4 d-flex rounded-lg flex-column bg-secondary" max-width="720">
    <div class="d-flex justify-space-between">
      <span class="text-subtitle-2">{{ titulo }}</span>
      <span class="text-subtitle-2 text-truncate" style="max-width: 270px">{{
        montarStringArtistas()
      }}</span>
    </div>

    <div class="d-flex justify-center align-center">
      <v-btn class="ma-2" icon variant="plain" density="compact">
        <v-icon size="x-large">mdi-rewind</v-icon>
      </v-btn>
      <v-btn class="ma-2" icon variant="plain" density="compact">
        <v-icon @click="trocarBotaoReproducao" size="x-large">
          {{ reproduzindoMusica ? 'mdi-pause' : 'mdi-play' }}
        </v-icon>
      </v-btn>
      <v-btn class="ma-2" icon variant="plain" density="compact">
        <v-icon size="x-large">mdi-fast-forward</v-icon>
      </v-btn>
    </div>

    <div class="d-flex align-center">
      <v-progress-linear :model-value="progressoMusica" :height="5" />
      <span class="ml-2 text-button">{{ duracao }}</span>
    </div>

    <v-btn class="align-self-center" icon variant="icon" @click="expandido = !expandido">
      <v-icon size="x-large">
        {{ expandido ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
      </v-icon>
    </v-btn>
    <v-expand-transition>
      <div v-if="expandido">
        <MusicaItemExpandido
          class="bg-secondary"
          :idMusica="props.idMusica"
          :titulo="props.titulo"
          :album="props.album"
          :artistas="props.artistas"
          :duracao="props.duracao"
          :ano="props.ano"
        />
      </div>
    </v-expand-transition>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import MusicaItemExpandido from './MusicaItemExpandido.vue';

const progressoMusica = ref(5);

const props = defineProps({
  idMusica: {
    type: Number,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  artistas: {
    type: Array,
    required: true,
  },
  album: {
    type: String,
    required: true,
  },
  duracao: {
    type: String,
    required: true,
  },
  ano: {
    type: Number,
    required: true,
  },
});

const reproduzindoMusica = ref(false);
const expandido = ref(false);

function trocarBotaoReproducao() {
  reproduzindoMusica.value = !reproduzindoMusica.value;
}

function montarStringArtistas() {
  let string = props.artistas.join(', ');
  return string;
}
</script>
