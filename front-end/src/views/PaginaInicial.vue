<template>
  <v-container class="mt-5">
    <v-container class="rounded-lg d-flex bg-secondary" max-width="800">
      <v-label>Ordenar por:</v-label>
      <v-checkbox
        class="ma-1"
        v-for="opcao in opcoes"
        :key="opcao"
        :label="opcao"
        :value="opcao"
        v-model="opcoesSelecionadas"
        hide-details
        density="compact"
      />
    </v-container>
  </v-container>
  <v-container>
    <MusicaItem
      v-for="(musica) in musicas"
      :idMusica="musica.idMusica"
      :titulo="musica.titulo"
      :artistas="musica.artistas"
      :album="musica.album"
      :duracao="musica.duracao"
      :ano="musica.ano"
      :key="musica"
    />
  </v-container>
</template>

<script setup>
import MusicaItem from '@/components/PaginaInicial/MusicaItem.vue';
import axios from 'axios';
import { config } from '@/config';
import { onMounted, ref, watch } from 'vue';

const opcoes = ['titulo', 'artista', 'album', 'ano'];
const opcoesSelecionadas = ref([])
const generosSelecionados = ref([]);
const musicas = ref([]);

async function obterMusicas() {
  const response = await axios.get(`${config.apiUrl}/musicas?sort=${opcoesSelecionadas.value.join(',')}`);
  const musicasComArtistas = await Promise.all(
    response.data.map(async (musica) => {
      const artistas = await obterArtistaMusica(musica.idMusica);
      return {
        ...musica,
        artistas,
      };
    }),
  );
  musicas.value = musicasComArtistas;
}

async function obterArtistaMusica(idMusica) {
  const response = await axios.get(`${config.apiUrl}/musicas/artistas?idMusica=${idMusica}`);
  return response.data.artistaNome;
}
onMounted(async () => {
  await obterMusicas();
});

watch(opcoesSelecionadas, async () => {
  await obterMusicas();
})
</script>
