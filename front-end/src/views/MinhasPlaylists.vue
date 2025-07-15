<template>
    <v-btn
      prependIcon="mdi-plus"
      color="primary"
      variant="outlined"
      class="position-absolute top-20 right-0 mt-7 mr-7"
      @click="abrirNovaPlaylist"
    >
      Nova Playlist
    </v-btn>
  <v-container>
    <MinhasPlaylistsItem
      v-for="playlist in playlists"
      :idPlaylist="playlist.idPlaylist"
      :nomePlaylist="playlist.nomePlaylist"
      :quantidadeMusicas="playlist.quantidadeMusicas"
      :key="playlist.idPlaylist"
    />
  </v-container>
</template>

<script setup>
import axios from 'axios';
import { config } from '@/config';
import { onMounted, ref } from 'vue';
import MinhasPlaylistsItem from '@/components/MinhasPlaylists/MinhasPlaylistsItem.vue';

const playlists = ref([]);

async function obterPlaylists() {
  const response = await axios.get(`${config.apiUrl}/playlists`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  playlists.value = response.data;
}

onMounted(async () => {
  await obterPlaylists();
});
</script>
