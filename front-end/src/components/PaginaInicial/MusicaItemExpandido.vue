<template>
  <v-container class="mt-4 mb-4 d-flex justify-space-between bg-secondary">
    <div class="d-flex text-caption font-weight-medium flex-column">
      <span> Título: {{ titulo }} </span>
      <span> Álbum: {{ album }} </span>
      <span> Gênero: {{ generosString }} </span>
    </div>
    <div class="d-flex text-caption font-weight-medium flex-column">
      <span> Artistas: {{ montarStringArtistas() }} </span>
      <span> Ano: {{ ano }} </span>
      <span> Duração: {{ duracao }} </span>
    </div>
  </v-container>
</template>

<script setup>
import { config } from '@/config';
import axios from 'axios';
import { ref, onMounted } from 'vue';

const generosString = ref('');

const props = defineProps({
  idMusica: {
    type: Number,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  album: {
    type: String,
    required: true,
  },
  artistas: {
    type: Array,
    required: true,
  },
  ano: {
    type: Number,
    required: true,
  },
  duracao: {
    type: String,
    required: true,
  },
});

function montarStringArtistas() {
  const string = props.artistas.join(', ');
  return string;
}

async function obterGenerosMusica() {
  try {
    const response = await axios.get(`${config.apiUrl}/musicas/generos?idMusica=${props.idMusica}`);
    return response.data.generoNome;
  } catch (err) {
    return '';
  }
}

function montarStringGeneros(generos) {
  const string = generos.join(', ');
  return string;
}

onMounted(async () => {
  const generos = await obterGenerosMusica();
  generosString.value = montarStringGeneros(generos);
});
</script>
