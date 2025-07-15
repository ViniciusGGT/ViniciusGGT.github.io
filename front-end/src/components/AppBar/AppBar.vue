<template>
  <v-app-bar elevation="0" class="bg-primary text-button" density="compact">
    <v-app-bar-title class="text-button text-uppercase font-weight-medium">
      Catálogo de Músicas Online
    </v-app-bar-title>
    <div v-if="!user">
      <v-btn
        class="text-decoration-underline pa-1"
        text="Cadastre-se"
        @click="router.push({ name: 'cadastro' })"
      />
      <span>|</span>
      <v-btn
        class="text-decoration-underline pa-1"
        text="Faça login"
        @click="router.push({ name: 'login' })"
      />
    </div>
    <div v-if="user" class="ma-2 d-flex align-center">
      <span class="text-body-1 me-2">{{ user.email }}</span>

      <v-menu transition="scale-transition" location="bottom end">
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon size="30">mdi-account-cog</v-icon>
          </v-btn>
        </template>

        <v-list class="bg-primary">
          <v-list-item @click="handleLogout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>

  <v-app-bar class="d-flex pa-0 text-button" density="compact">
    <v-btn-toggle v-model="paginaSelecionada" class="d-flex w-100 pa-0">
      <v-btn
        value="pagina-inicial"
        class="bg-btnCatalogo flex-grow-1"
        variant="text"
        style="max-width: 50%"
        @click="router.push({ name: 'pagina-inicial' })"
      >
        Catálogo
      </v-btn>

      <v-btn
        value="playlists"
        class="bg-btnPlaylists flex-grow-1 w-50"
        variant="text"
        style="max-width: 50%"
        @click="navegarParaPlaylists"
      >
        Minhas Playlists
      </v-btn>

      <v-dialog v-model="popupLoginNecessario" max-width="400">
        <v-card color="warning" variant="outlined" class="bg-secondary">
          <v-card-title class="text-h6 text-white">Acesso restrito</v-card-title>
          <v-card-text class="text-white"
            >Você precisa estar logado para acessar suas playlists.</v-card-text
          >
          <v-divider />
          <v-card-actions class="justify-end text-white">
            <v-btn color="primary" @click="popupLoginNecessario = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-btn-toggle>
  </v-app-bar>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref, computed } from 'vue';
import { config } from '@/config';
import { useRoute } from 'vue-router';
import { watch } from 'vue';

const route = useRoute();
const { user } = useAuth();
const { logout } = useAuth();
const router = useRouter();
const paginaSelecionada = ref(route.name);

function handleLogout() {
  logout();
  router.push({ name: 'pagina-inicial' });
}

const popupLoginNecessario = ref(false);
function navegarParaPlaylists() {
  if (!user.value) {
    popupLoginNecessario.value = true;
  } else {
    router.push({ name: 'playlists' });
  }
}

watch(
  () => route.name,
  (novaRota) => {
    paginaSelecionada.value = novaRota;
  },
  { immediate: true },
);
</script>
